# 🎯 Drag & Drop से MongoDB तक - Complete Step-by-Step Guide

## 📋 Overview (समझिए क्या हो रहा है)

जब आप **AWS icons को drag करके canvas पर drop** करते हैं, तो वो automatically **2 seconds बाद MongoDB Atlas में save** हो जाता है। यहाँ पूरा flow है:

---

## 🔄 Complete Flow (पूरा प्रक्रिया)

### **STEP 1: User Drag करता है Icon** 🖱️

**Location:** `Frontend/src/components/studio/AWSSidebar.tsx`

- User sidebar से कोई AWS resource (जैसे EC2, S3, RDS) को drag करता है
- Icon को canvas पर drop करता है

**Code में क्या होता है:**
```javascript
// User drag करता है icon को
onDragStart = (event, resource) => {
  event.dataTransfer.setData('application/reactflow', JSON.stringify(resource));
}
```

---

### **STEP 2: Canvas पर Drop होता है** 📍

**Location:** `Frontend/src/components/studio/DiagramCanvas.tsx` (Line 67-97)

**क्या होता है:**
1. `onDrop` function trigger होता है
2. Dropped data को parse किया जाता है
3. नया Node object बनता है:

```javascript
const onDrop = (event) => {
  // 1. Data को parse करो
  const resource = JSON.parse(event.dataTransfer.getData('application/reactflow'));
  
  // 2. Position calculate करो (कहाँ drop हुआ)
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY
  });
  
  // 3. नया Node बनाओ
  const newNode = {
    id: `node_${id++}`,                    // Unique ID
    type: 'awsNode',                        // Node type
    position: { x, y },                    // Canvas position
    data: {
      label: resource.name,                 // "EC2 Instance"
      resourceType: resource.type,          // "EC2"
      icon: resource.icon,                  // Icon path
      terraformType: resource.terraformType, // "aws_instance"
      category: resource.category            // "compute"
    }
  };
  
  // 4. Node को state में add करो
  setLocalNodes((nds) => [...nds, newNode]);
}
```

**Result:** Node canvas पर दिखता है और `localNodes` state में store होता है

---

### **STEP 3: State Update होता है** 🔄

**Location:** `Frontend/src/components/studio/DiagramCanvas.tsx` (Line 38-44)

**क्या होता है:**
```javascript
// localNodes change होने पर global store update होता है
React.useEffect(() => {
  setNodes(localNodes);  // Global store में save
}, [localNodes]);
```

**Location:** `Frontend/src/store/useStore.ts`

```javascript
setNodes: (nodes) => {
  set({ nodes });                    // Store में save
  get().generateTerraform();          // Terraform code generate करो
}
```

**Result:** 
- Nodes global store में save होते हैं
- Terraform code automatically generate होता है

---

### **STEP 4: Auto-Save Hook Trigger होता है** ⏱️

**Location:** `Frontend/src/pages/Studio.tsx` (Line 22-38)

**क्या होता है:**
```javascript
// useAutoSave hook nodes को watch करता है
const { manualSave } = useAutoSave({
  projectId: mongoProjectId,
  projectName: 'My Project',
  nodes: nodes,              // ← यहाँ nodes change detect होता है
  generatedCode: terraformCode,
  debounceMs: 2000          // 2 seconds wait करो
});
```

**Location:** `Frontend/src/hooks/useAutoSave.ts` (Line 104-130)

**Auto-Save Logic:**
```javascript
useEffect(() => {
  // जब nodes change होते हैं
  if (nodes.length === 0 && !projectId) {
    return; // Empty project को save मत करो
  }
  
  // पुराना timeout clear करो
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
  
  // नया timeout set करो (2 seconds)
  timeoutRef.current = setTimeout(() => {
    saveToDatabase();  // ← यहाँ save function call होता है
  }, 2000);
  
}, [nodes, generatedCode, projectName]); // ← nodes change पर trigger
```

**Result:** 2 seconds बाद `saveToDatabase()` function call होता है

---

### **STEP 5: Data MongoDB के लिए Prepare होता है** 📦

**Location:** `Frontend/src/hooks/useAutoSave.ts` (Line 35-101)

**क्या होता है:**
```javascript
const saveToDatabase = async () => {
  // 1. Check करो - क्या changes हैं?
  const currentHash = JSON.stringify({ nodes, generatedCode, projectName });
  if (currentHash === lastSavedRef.current) {
    return; // कोई changes नहीं, save मत करो
  }
  
  // 2. Data prepare करो
  const projectData = {
    projectName: "My Project",
    nodes: [
      {
        id: "node_0",
        type: "awsNode",
        position: { x: 100, y: 200 },
        data: {
          label: "EC2 Instance",
          resourceType: "EC2",
          terraformType: "aws_instance",
          category: "compute"
        }
      },
      // ... more nodes
    ],
    generatedCode: "# Terraform code here..."
  };
  
  // 3. API call करो
  if (projectId) {
    await projectApi.update(projectId, projectData);  // Update existing
  } else {
    await projectApi.create(projectData);            // Create new
  }
}
```

**Result:** Data JSON format में ready हो जाता है

---

### **STEP 6: API Call Backend को** 🌐

**Location:** `Frontend/src/lib/api.ts` (Line 82-105)

**क्या होता है:**
```javascript
// POST /api/projects (new project)
// या PUT /api/projects/:id (update existing)

const response = await fetch('http://localhost:5000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // JWT token
  },
  body: JSON.stringify({
    projectName: "My Project",
    nodes: [...],           // All nodes as JSON
    generatedCode: "..."    // Terraform code
  })
});
```

**Request Body Example:**
```json
{
  "projectName": "My Cloud Infrastructure",
  "nodes": [
    {
      "id": "node_0",
      "type": "awsNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "EC2 Instance",
        "resourceType": "EC2",
        "terraformType": "aws_instance",
        "category": "compute",
        "icon": "server"
      }
    },
    {
      "id": "node_1",
      "type": "awsNode",
      "position": { "x": 300, "y": 200 },
      "data": {
        "label": "S3 Bucket",
        "resourceType": "S3",
        "terraformType": "aws_s3_bucket",
        "category": "storage",
        "icon": "database"
      }
    }
  ],
  "generatedCode": "# Terraform configuration..."
}
```

**Result:** Request backend server को भेजा जाता है

---

### **STEP 7: Backend API Receive करता है** 🖥️

**Location:** `Backend/controllers/projectController.js` (Line 6-44)

**क्या होता है:**
```javascript
// POST /api/projects
export const saveProject = async (req, res) => {
  // 1. Data receive करो
  const { projectName, nodes, generatedCode } = req.body;
  
  // 2. Validation करो
  if (!projectName || !nodes) {
    return res.status(400).json({
      success: false,
      message: 'Please provide projectName and nodes'
    });
  }
  
  // 3. MongoDB में save करो
  const project = await Project.create({
    projectName,
    nodes,              // ← JSON format में store होता है
    generatedCode,
    user: req.user._id  // User ID (JWT से)
  });
  
  // 4. Response भेजो
  res.status(201).json({
    success: true,
    message: 'Project saved successfully',
    project
  });
}
```

**Result:** Data MongoDB model में ready हो जाता है

---

### **STEP 8: MongoDB Atlas में Save होता है** 💾

**Location:** `Backend/models/Project.js`

**MongoDB Schema:**
```javascript
const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  nodes: {
    type: mongoose.Schema.Types.Mixed,  // ← JSON format में store
    required: true
  },
  generatedCode: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

**MongoDB Document Example:**
```json
{
  "_id": "65f1234567890abcdef12345",
  "projectName": "My Cloud Infrastructure",
  "nodes": [
    {
      "id": "node_0",
      "type": "awsNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "EC2 Instance",
        "resourceType": "EC2",
        "terraformType": "aws_instance",
        "category": "compute"
      }
    },
    {
      "id": "node_1",
      "type": "awsNode",
      "position": { "x": 300, "y": 200 },
      "data": {
        "label": "S3 Bucket",
        "resourceType": "S3",
        "terraformType": "aws_s3_bucket",
        "category": "storage"
      }
    }
  ],
  "generatedCode": "# Terraform configuration...",
  "user": "65f1111111111abcdef11111",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Result:** Data MongoDB Atlas में permanently store हो जाता है

---

## 📊 Data Flow Summary (संक्षेप में)

```
1. User Drag Icon
   ↓
2. Drop on Canvas
   ↓
3. Node Object Created
   ↓
4. State Updated (localNodes → global store)
   ↓
5. Auto-Save Hook Detects Change
   ↓
6. Wait 2 seconds (debounce)
   ↓
7. Prepare JSON Data
   ↓
8. API Call to Backend
   ↓
9. Backend Validates & Processes
   ↓
10. Save to MongoDB Atlas
    ↓
11. Success Response
    ↓
12. UI Shows "Saved" Status
```

---

## 🎯 Key Points (महत्वपूर्ण बातें)

### ✅ **Auto-Save Features:**
1. **2 seconds debounce** - हर change पर save नहीं, 2 sec wait करता है
2. **Change detection** - अगर कोई change नहीं, save नहीं करता
3. **Real-time status** - Header में "Saving...", "Saved", "Unsaved" दिखता है
4. **Error handling** - अगर save fail हो, error message दिखता है

### ✅ **Data Structure:**
- **Nodes** - Array of objects, हर node में:
  - `id` - Unique identifier
  - `type` - Node type (awsNode)
  - `position` - Canvas coordinates {x, y}
  - `data` - Node information (label, resourceType, terraformType, etc.)

### ✅ **MongoDB Storage:**
- **Collection:** `projects`
- **Format:** JSON (Mongoose Mixed type)
- **User-specific:** हर user के अपने projects
- **Timestamps:** createdAt, updatedAt automatically

---

## 🧪 Testing (टेस्ट कैसे करें)

### Step 1: Login करें
```
http://localhost:5173/login
```

### Step 2: Studio में जाएं
```
http://localhost:5173/studio/new-project
```

### Step 3: Icon Drag करें
- Sidebar से कोई AWS resource drag करें
- Canvas पर drop करें

### Step 4: Wait करें
- 2 seconds wait करें
- Header में "Saving..." दिखेगा
- फिर "Saved" दिखेगा

### Step 5: MongoDB में Check करें
- MongoDB Atlas dashboard में जाएं
- `projects` collection में देखें
- आपका project वहाँ save होगा

---

## 🔍 Debugging (अगर कुछ काम नहीं कर रहा)

### Check 1: Browser Console
```javascript
// F12 दबाएं, Console tab में देखें
// Errors दिखेंगे अगर कोई problem है
```

### Check 2: Network Tab
```
// F12 → Network tab
// /api/projects request देखें
// Status 200 होना चाहिए
```

### Check 3: Backend Logs
```
// PowerShell window में backend logs देखें
// "MongoDB Connected" message होना चाहिए
```

### Check 4: MongoDB Atlas
```
// MongoDB Atlas dashboard में जाएं
// Collections → projects
// Documents में आपका data होना चाहिए
```

---

## ✅ Current Status (अभी क्या ready है)

- ✅ Drag & Drop functionality
- ✅ Auto-save hook (2 seconds debounce)
- ✅ Backend API (POST/PUT /api/projects)
- ✅ MongoDB schema और model
- ✅ Real-time save status indicator
- ✅ Error handling
- ✅ User authentication

## 🚧 Not Integrated Yet (अभी नहीं किया)

- ❌ IaC Engine integration (बाद में करेंगे)

---

## 📝 Next Steps (अगले steps)

1. **Test करें** - Drag & drop करके देखें कि save हो रहा है या नहीं
2. **MongoDB check करें** - Atlas में data verify करें
3. **IaC Engine integrate करें** - जब ready हो (अभी नहीं)

---

**यह complete flow है! अब आप समझ गए होंगे कि drag & drop से MongoDB तक कैसे data जाता है।** 🎉

