import Project from '../models/Project.js';
import deploymentService from '../services/deploymentService.js';

/**
 * @desc    Deploy project infrastructure to AWS
 * @route   POST /api/projects/:id/deploy
 * @access  Private
 */
export const deployProject = async (req, res) => {
  try {
    const { awsCredentials } = req.body;
    
    // Validate AWS credentials
    if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
      return res.status(400).json({
        success: false,
        message: 'AWS credentials are required (accessKeyId, secretAccessKey, region)'
      });
    }

    // Get the project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    // Check if Terraform code exists
    if (!project.generatedCode || project.generatedCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'No Terraform code available for deployment. Please generate code first.'
      });
    }

    // Check if Terraform is installed
    const isTerraformInstalled = await deploymentService.isTerraformInstalled();
    if (!isTerraformInstalled) {
      return res.status(500).json({
        success: false,
        message: 'Terraform is not installed on the server. Deployment cannot proceed.',
        error: 'Terraform executable not found'
      });
    }

    // Validate AWS credentials
    const credentialValidation = await deploymentService.validateAwsCredentials(awsCredentials);
    if (!credentialValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid AWS credentials',
        error: credentialValidation.message
      });
    }

    // Perform the deployment
    const deploymentResult = await deploymentService.deployInfrastructure(
      project.generatedCode,
      awsCredentials
    );

    // Return the deployment result
    res.status(200).json({
      success: deploymentResult.success,
      message: deploymentResult.message,
      deployment: deploymentResult
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deployment',
      error: error.message
    });
  }
};

/**
 * @desc    Check deployment readiness
 * @route   GET /api/projects/:id/deployment-readiness
 * @access  Private
 */
export const checkDeploymentReadiness = async (req, res) => {
  try {
    // Get the project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This project does not belong to you.'
      });
    }

    // Check deployment readiness
    const isTerraformInstalled = await deploymentService.isTerraformInstalled();
    const hasTerraformCode = !!(project.generatedCode && project.generatedCode.trim() !== '');

    res.status(200).json({
      success: true,
      readiness: {
        terraformInstalled: isTerraformInstalled,
        hasTerraformCode: hasTerraformCode,
        canDeploy: isTerraformInstalled && hasTerraformCode
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while checking deployment readiness',
      error: error.message
    });
  }
};