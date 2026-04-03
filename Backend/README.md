# Cloud Infrastructure Design Tool - Backend API

Backend API for cloud infrastructure design tool built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- ✅ JWT-based authentication (Signup & Login)
- ✅ Password hashing with bcrypt
- ✅ Protected routes with auth middleware
- ✅ Project CRUD operations
- ✅ User-specific project management
- ✅ React Flow diagram storage (nodes & edges as JSON)

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**📖 For detailed MongoDB Atlas setup instructions, see [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)**

**Quick Setup:**
1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user and whitelist your IP
4. Get your connection string and add it to `.env` as `MONGODB_URI`

### 3. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Projects (Protected Routes)

All project routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

#### POST `/api/projects/save`
Save a new project.

**Request Body:**
```json
{
  "projectName": "My Infrastructure",
  "nodes": [...],
  "edges": [...],
  "generatedCode": "terraform code here",
  "name": "logic-engine",
  "version": "1.0.0",
  "description": "Infrastructure as Code Engine for CloudVibe Project",
  "type": "module",
  "main": "IaCEngine.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["terraform", "iac", "aws", "infrastructure"],
  "author": "Your Name",
  "license": "ISC"
}
```

**Note:** Only `projectName`, `nodes`, and `edges` are required. All other metadata fields are optional.

#### GET `/api/projects`
Get all projects for logged-in user.

#### GET `/api/projects/:id`
Get single project by ID.

#### PUT `/api/projects/:id`
Update project.

**Request Body:**
```json
{
  "projectName": "Updated Name",
  "nodes": [...],
  "edges": [...],
  "generatedCode": "updated code",
  "version": "1.1.0",
  "description": "Updated description",
  "keywords": ["terraform", "iac", "aws", "infrastructure", "cloud"]
}
```

**Note:** All fields are optional. Only include the fields you want to update.

#### DELETE `/api/projects/:id`
Delete project.

## Frontend Integration Example

### Using Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set up axios instance with token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Signup
const signup = async (username, email, password) => {
  const response = await api.post('/auth/signup', {
    username,
    email,
    password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Save Project (React Flow)
const saveProject = async (projectName, nodes, edges, generatedCode) => {
  const response = await api.post('/projects/save', {
    projectName,
    nodes,
    edges,
    generatedCode
  });
  return response.data;
};

// Get All Projects
const getAllProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

// Get Single Project
const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// Update Project
const updateProject = async (projectId, projectName, nodes, edges, generatedCode) => {
  const response = await api.put(`/projects/${projectId}`, {
    projectName,
    nodes,
    edges,
    generatedCode
  });
  return response.data;
};

// Delete Project
const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};
```

### React Flow Integration Example

```javascript
import { useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';
import { saveProject } from './api';

function DiagramEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [projectName, setProjectName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleSave = async () => {
    try {
      await saveProject(projectName, nodes, edges, generatedCode);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  return (
    <div>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
      <button onClick={handleSave}>Save Project</button>
    </div>
  );
}
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Auth logic (signup, login)
│   └── projectController.js # Project CRUD logic
├── middleware/
│   └── auth.js            # JWT verification middleware
├── models/
│   ├── User.js            # User schema
│   └── Project.js         # Project schema
├── routes/
│   ├── auth.js            # Auth routes
│   └── projects.js        # Project routes
├── .env                   # Environment variables (create this)
├── .env.example           # Environment variables template
├── package.json
├── server.js              # Main server file
└── README.md
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are required for all project routes
- Users can only access their own projects
- Input validation on all endpoints
- CORS enabled for frontend integration

## License

ISC
