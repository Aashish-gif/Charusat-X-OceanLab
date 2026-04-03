import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Service for handling Terraform deployments
 */
class DeploymentService {
  /**
   * Deploy infrastructure using Terraform
   * @param {string} terraformCode - The Terraform configuration code
   * @param {Object} awsCredentials - AWS credentials (accessKeyId, secretAccessKey, region)
   * @returns {Promise<Object>} Deployment result
   */
  async deployInfrastructure(terraformCode, awsCredentials) {
    let tempDir = null;
    
    try {
      // Validate inputs
      if (!terraformCode || typeof terraformCode !== 'string') {
        throw new Error('Invalid Terraform code provided');
      }
      
      if (!awsCredentials || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
        throw new Error('AWS credentials are required');
      }

      // Create a temporary directory for the deployment
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'terraform-deploy-'));
      
      // Write Terraform configuration to main.tf file
      const mainTfPath = path.join(tempDir, 'main.tf');
      await fs.writeFile(mainTfPath, terraformCode);
      
      // Create provider configuration with AWS credentials
      const providerConfig = `
provider "aws" {
  access_key = "${awsCredentials.accessKeyId}"
  secret_key = "${awsCredentials.secretAccessKey}"
  region     = "${awsCredentials.region}"
}
      `;
      
      const providerPath = path.join(tempDir, 'provider.tf');
      await fs.writeFile(providerPath, providerConfig);

      // Execute terraform init
      console.log(`Initializing Terraform in ${tempDir}`);
      const initResult = await execAsync('terraform init', { cwd: tempDir });
      
      // Execute terraform plan
      console.log('Running Terraform plan...');
      const planResult = await execAsync('terraform plan -out=tfplan', { cwd: tempDir });
      
      // Execute terraform apply
      console.log('Applying Terraform configuration...');
      const applyResult = await execAsync('terraform apply -auto-approve tfplan', { cwd: tempDir });
      
      return {
        success: true,
        message: 'Infrastructure deployed successfully',
        logs: {
          init: initResult.stdout,
          plan: planResult.stdout,
          apply: applyResult.stdout,
        },
        artifacts: {
          planFile: 'tfplan',
        }
      };
    } catch (error) {
      console.error('Deployment error:', error);
      return {
        success: false,
        message: error.message || 'Deployment failed',
        error: error.message,
        stderr: error.stderr,
        stdout: error.stdout
      };
    } finally {
      // Clean up temporary directory
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Error cleaning up temporary directory:', cleanupError);
        }
      }
    }
  }

  /**
   * Check if Terraform is installed
   * @returns {Promise<boolean>}
   */
  async isTerraformInstalled() {
    try {
      const { stdout } = await execAsync('terraform version');
      return stdout.includes('Terraform v');
    } catch (error) {
      console.error('Terraform not found:', error.message);
      return false;
    }
  }

  /**
   * Validate AWS credentials
   * @param {Object} awsCredentials - AWS credentials to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateAwsCredentials(awsCredentials) {
    try {
      // This is a simplified validation
      // In a real implementation, you might want to make an actual AWS API call
      if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.region) {
        return {
          success: false,
          message: 'Missing required AWS credentials'
        };
      }

      // More thorough validation could include making a simple AWS API call
      // For now, we'll just validate the structure
      return {
        success: true,
        message: 'Credentials format is valid'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Credential validation failed'
      };
    }
  }
}

export default new DeploymentService();