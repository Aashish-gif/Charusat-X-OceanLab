# Zenith AI 🚀
### *Where Infrastructure Meets Innovation*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Zenith AI is a state-of-the-art cloud infrastructure automation platform. Build, visualize, and deploy production-ready AWS environments using a powerful drag-and-drop canvas and AI-driven code generation.

---

## 🔗 Quick Links

| Resource | Link |
| :--- | :--- |
| **🚀 Web Application** | [Launch WebApp](https://zenith-ai-ultimate-cloud-syntheses.netlify.app/)  |
| **📺 Demo Video** | [Demo Video](https://drive.google.com/file/d/1hAy1jLsVis7HAkPuOVh5rI5BdAOIGBD2/view?usp=sharing) |
| **📄 API Documentation** | [Postman Collection](https://documenter.getpostman.com/view/39216526/2sBXc7Kiys) |

---

## 🎨 Application Blueprints (Real Wireframes)

### 1. Platform Architecture
This blueprint illustrates the core communication flow between the Frontend React components, the Node.js backend, and the AI IaC Engine.

```mermaid
graph TD
    subgraph "Frontend (React 18)"
        A["Landing Page"] --> B["Studio Canvas (ReactFlow)"]
        B --> C["AI Generation Sidebar"]
        B --> D["Cloud Component Library"]
    end

    subgraph "Backend (Node.js/Express)"
        B <--> E["API Gateway"]
        E <--> F["Project Manager"]
        E <--> G["IaC Engine (Terraform Gen)"]
    end

    subgraph "Storage & Cloud"
        F <--> H[("MongoDB (Metadata)")]
        G --> I["AWS (Deployment)"]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:4px
    style G fill:#dfd,stroke:#333,stroke-width:2px
```

---

### 2. Infrastructure Generation Flow
The "Sorted & Smooth" logic behind how visual connections on the canvas are translated into production-ready Terraform code.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Canvas (ReactFlow)
    participant E as IaC Engine
    participant AI as RAG Processor

    U->>C: Drag EC2 & S3
    U->>C: Connect EC2 -> S3
    C->>AI: Analyze Node Metadata
    AI->>E: Map Icons to HCL Resources
    E->>E: Generate Security Group Rules
    E-->>C: Update Real-time Code Preview
    U->>C: Click 'Deploy'
    C->>E: Execute Terraform Plan
```

---

### 3. AI Text-to-Cloud Workflow
A technical wireframe of our RAG (Retrieval Augmented Generation) pipeline.

```mermaid
flowchart LR
    User([User Prompt]) --> NLP[NLP Interpreter]
    NLP --> KB[(Cloud Pattern KB)]
    KB --> Gen[RAG Code Generator]
    Gen --> Canvas[Visual Representation]
    Canvas --> Code[HCL Terraform]

    subgraph "Sorted Automation"
    KB
    Gen
    end
```

---

## ✨ Core Features

### 🛠️ Visual Infrastructure Design
- **Drag-and-Drop Canvas**: Intuitive placement with ReactFlow engine.
- **Auto-Networking**: Smart connection logic that handles VPCs and Security Groups automatically.

### 🤖 AI Code Generation
- **Text-to-Cloud**: Describe your stack in plain English and let the AI do the heavy lifting.
- **RAG-based Accuracy**: Precise Terraform output based on production best practices.

### 💰 Cost & Security
- **Real-time Cost Estimation**: Know your AWS bill before you deploy.
- **Compliance Checks**: Built-in security auditing for every resource.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Instance
- AWS Credentials (for deployment)

### 1. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd Backend
npm install
npm start
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, ReactFlow.
- **Backend**: Node.js, Express, MongoDB.
- **IaC**: Terraform (HCL) generation.
- **AI**: Retrieval Augmented Generation (RAG) for infrastructure patterns.

---

## 📞 Support & Community

*Developed for the Zenith AI-X DAIICT Hackathon.*

- **Support**: Reach out via GitHub Issues.
- **Contributions**: Pull requests are welcome!

---
© 2026 Zenith AI Team. All Rights Reserved.

