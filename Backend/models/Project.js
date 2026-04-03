import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  nodes: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Nodes are required']
  },
  generatedCode: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
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

// Update updatedAt before saving
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
