import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import pricingRoutes from './routes/pricing.js';
import recommendationRoutes from './routes/recommendations.js';
import voiceRoutes from './routes/voice.js';
import { initRAG, getVerifiedContext } from './ragEngine.js';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not defined in environment variables');
  console.error('\n📝 Please create a .env file in the root directory with:');
  console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
  console.error('   JWT_SECRET=your_secret_key');
  console.error('   PORT=5000\n');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('\n⚠️  WARNING: JWT_SECRET is not defined. Using default (not secure for production)\n');
  process.env.JWT_SECRET = 'default_jwt_secret_change_in_production';
}

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/v1/voice', voiceRoutes);

// RAG-powered HCL generation route
app.post('/api/generate-hcl', async (req, res, next) => {
  try {
    const { nodes = [], edges = [] } = req.body || {};

    // Build a clean, minimal summary grounded in provided node labels/types
    const nodeLabels = (Array.isArray(nodes) ? nodes : [])
      .map(n => (typeof n === 'string' ? n : n?.label || n?.type || n?.name || ''))
      .filter(Boolean);
    const summary = `The user design consists ONLY of the following components: [${nodeLabels.join(', ')}]`;

    const context = await getVerifiedContext(summary);
    if (!context) {
      return res.status(400).json({ error: 'Resource not in verified knowledge base' });
    }
    // Debug: show small slice of context
    console.log('✅ Context Found:', context ? context.substring(0, 100) : 'NULL');

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const groqModel = process.env.GROQ_MODEL || 'llama3-70b-8192';

    // RAG Constraint: Only pass context for syntax reference if multiple nodes
    const contextForReference = nodeLabels.length === 1 ? '' : context;

    const body = {
      model: groqModel,
      messages: [
        {
          role: 'system',
          content: `CRITICAL: You are a machine. Output ONLY the resource block for [${nodeLabels.join(', ')}]. If you add a NAT Gateway or Subnet when not requested, you fail. DO NOT provide variables or outputs unless requested. 1 Node = 1 Block.`
        },
        {
          role: 'user',
          content: `Generate HCL for these exact nodes: [${nodeLabels.join(', ')}]. Use context only for syntax reference: ${contextForReference}`
        }
      ],
      temperature: 0,
      max_tokens: 400,
      stream: false
    };

    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', body, {
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log("🚀 Groq Response Received. Tokens Used:", data?.usage?.total_tokens || 'N/A');

    const code = data?.choices?.[0]?.message?.content || '';
    if (!code.trim()) {
      return res.status(502).json({ error: 'Groq returned empty response', raw: data });
    }

    // HARD-FILTER: Block unauthorized resources at code level
    let processedCode = code;
    
    // Create allowed keywords from node labels
    const allowedKeywords = nodeLabels.map(label => label.toLowerCase());
    
    console.log('🔍 DEBUG: Node labels:', nodeLabels);
    console.log('🔍 DEBUG: Allowed keywords:', allowedKeywords);
    console.log('🔍 DEBUG: Original code length:', code.length);
    
    // Define ALL resource types to filter (more comprehensive)
    const resourceFilters = [
      { keyword: 'subnet', pattern: 'aws_subnet' },
      { keyword: 'nat', pattern: 'aws_nat_gateway' },
      { keyword: 'internet', pattern: 'aws_internet_gateway' },
      { keyword: 'endpoint', pattern: 'aws_vpc_endpoint' },
      { keyword: 'route', pattern: 'aws_route_table' },
      { keyword: 'eip', pattern: 'aws_eip' },
      { keyword: 'flow', pattern: 'aws_flow_log' },
      { keyword: 'dhcp', pattern: 'aws_vpc_dhcp_options' },
      { keyword: 's3', pattern: 'aws_s3_bucket' },
      { keyword: 'bucket', pattern: 'aws_s3_bucket' },
      { keyword: 'lambda', pattern: 'aws_lambda_function' },
      { keyword: 'cloudwatch', pattern: 'aws_cloudwatch_log_group' },
      { keyword: 'security', pattern: 'aws_security_group' },
      { keyword: 'association', pattern: 'aws_route_table_association' }
    ];
    
    // Filter unauthorized resources
    resourceFilters.forEach(({ keyword, pattern }) => {
      if (!allowedKeywords.includes(keyword)) {
        // Remove entire resource blocks (super aggressive regex for multiline)
        const resourceBlockRegex = new RegExp(`resource\\s+"${pattern}"[^\\{]*\\{[\\s\\S]*?^\\}`, 'gm');
        const beforeCount = (processedCode.match(new RegExp(pattern, 'g')) || []).length;
        processedCode = processedCode.replace(resourceBlockRegex, '');
        const afterCount = (processedCode.match(new RegExp(pattern, 'g')) || []).length;
        
        if (beforeCount > 0) {
          console.log(`🚫 HARD-FILTER: Removed ${beforeCount} ${pattern} blocks`);
        }
      }
    });
    
    // Remove ALL variables and outputs for single nodes
    if (nodeLabels.length === 1) {
      // Remove variables section (multiline)
      const variablesRegex = new RegExp(`variable\\s+"[^"]*"\\s*\\{[\\s\\S]*?^\\}`, 'gm');
      processedCode = processedCode.replace(variablesRegex, '');
      
      // Remove outputs section (multiline)
      const outputsRegex = new RegExp(`output\\s+"[^"]*"\\s*\\{[\\s\\S]*?^\\}`, 'gm');
      processedCode = processedCode.replace(outputsRegex, '');
      
      // Remove terraform block (multiline)
      const terraformRegex = new RegExp(`terraform\\s*\\{[\\s\\S]*?^\\}`, 'gm');
      processedCode = processedCode.replace(terraformRegex, '');
      
      // Remove provider block (multiline)
      const providerRegex = new RegExp(`provider\\s+"aws"[^\\{]*\\{[\\s\\S]*?^\\}`, 'gm');
      processedCode = processedCode.replace(providerRegex, '');
      
      console.log('🧹 CLEANUP: Removed variables/outputs/terraform/provider for single node');
    }
    
    // Clean up comments and extra whitespace
    processedCode = processedCode.replace(/#.*$/gm, ''); // Remove comments
    processedCode = processedCode.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    console.log('🔒 HARD-FILTER Applied');
    console.log('📝 Original:', code.length, '→ Filtered:', processedCode.length, 'characters');
    console.log('✅ Allowed keywords:', allowedKeywords.join(', '));

    return res.status(200).json({ hcl: processedCode });
  } catch (err) {
    return next(err);
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await initRAG();
    console.log('RAG initialized with knowledge-base documents');
  } catch (e) {
    console.error('Failed to initialize RAG:', e?.message || e);
  }
  console.log(`Server running on port ${PORT}`);
});
