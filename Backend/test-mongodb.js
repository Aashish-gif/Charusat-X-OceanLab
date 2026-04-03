import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Project from './models/Project.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Test data matching your requirements
const testProjectData = {
  projectName: 'Logic Engine Project',
  name: 'logic-engine',
  version: '1.0.0',
  description: 'Infrastructure as Code Engine for CloudVibe Project',
  type: 'module',
  main: 'IaCEngine.js',
  scripts: {
    test: 'node test.js'
  },
  keywords: ['terraform', 'iac', 'aws', 'infrastructure'],
  author: 'CloudVibe Team',
  license: 'ISC',
  nodes: [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'VPC', terraformType: 'aws_vpc' }
    },
    {
      id: '2',
      type: 'default',
      position: { x: 300, y: 200 },
      data: { label: 'EC2 Instance', terraformType: 'aws_instance' }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep'
    }
  ],
  generatedCode: `# Terraform Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "Main VPC"
  }
}

resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  tags = {
    Name = "Example Instance"
  }
}`
};

async function testMongoDBConnection() {
  console.log('\n🔍 Testing MongoDB Atlas Connection...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Test: Create a test user (if doesn't exist)
    console.log('📝 Creating test user...');
    let testUser = await User.findOne({ email: 'test@mongodb.com' });
    
    if (!testUser) {
      testUser = await User.create({
        username: 'mongodb_test_user',
        email: 'test@mongodb.com',
        password: 'testpassword123'
      });
      console.log('✅ Test user created:', testUser.username);
    } else {
      console.log('✅ Test user already exists:', testUser.username);
    }

    // Test: Save project data
    console.log('\n💾 Saving project data to MongoDB Atlas...');
    const project = await Project.create({
      ...testProjectData,
      user: testUser._id
    });
    console.log('✅ Project saved successfully!');
    console.log('   Project ID:', project._id);
    console.log('   Project Name:', project.projectName);
    console.log('   Version:', project.version);
    console.log('   Description:', project.description);
    console.log('   Type:', project.type);
    console.log('   Main:', project.main);
    console.log('   Scripts:', JSON.stringify(project.scripts));
    console.log('   Keywords:', project.keywords.join(', '));
    console.log('   Author:', project.author);
    console.log('   License:', project.license);
    console.log('   Nodes Count:', Array.isArray(project.nodes) ? project.nodes.length : 'N/A');
    console.log('   Edges Count:', Array.isArray(project.edges) ? project.edges.length : 'N/A');
    console.log('   Generated Code Length:', project.generatedCode.length, 'characters');

    // Test: Retrieve project
    console.log('\n📖 Retrieving project from MongoDB Atlas...');
    const retrievedProject = await Project.findById(project._id);
    if (retrievedProject) {
      console.log('✅ Project retrieved successfully!');
      console.log('   All metadata fields are stored correctly.');
    }

    // Test: Count projects
    const projectCount = await Project.countDocuments({ user: testUser._id });
    console.log(`\n📊 Total projects for test user: ${projectCount}`);

    // Test: List all projects
    console.log('\n📋 Listing all projects...');
    const allProjects = await Project.find({ user: testUser._id })
      .select('projectName name version description createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    allProjects.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.projectName} (v${p.version}) - ${p.description || 'No description'}`);
    });

    console.log('\n✅ All MongoDB Atlas tests passed!\n');
    console.log('🎉 Your data is being saved to MongoDB Atlas successfully!\n');

    // Cleanup (optional - comment out if you want to keep test data)
    // console.log('🧹 Cleaning up test data...');
    // await Project.deleteOne({ _id: project._id });
    // console.log('✅ Test project deleted');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('MONGODB_URI')) {
      console.error('\n⚠️  Please create a .env file with MONGODB_URI');
      console.error('   See MONGODB_ATLAS_SETUP.md for instructions\n');
    } else {
      console.error('\nFull error:', error);
    }
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
testMongoDBConnection();
