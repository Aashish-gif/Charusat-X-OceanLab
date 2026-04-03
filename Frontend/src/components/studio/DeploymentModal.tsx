import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Cloud, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { projectApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeploymentModalProps {
  children: React.ReactNode;
  projectId?: string;
  className?: string;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ children, projectId, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'in-progress' | 'success' | 'error'>('idle');
  const [deploymentLog, setDeploymentLog] = useState('');
  const [readiness, setReadiness] = useState({
    terraformInstalled: false,
    hasTerraformCode: false,
    canDeploy: false,
  });

  const { terraformCode } = useStudioStore();

  const checkReadiness = async () => {
    if (!projectId) return;
    
    try {
      const response = await projectApi.checkReadiness(projectId);
      if (response.success) {
        setReadiness(response.readiness);
      }
    } catch (error) {
      console.error('Error checking readiness:', error);
    }
  };

  const handleDeploy = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    // Validate credentials
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      toast.error('AWS credentials are required');
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('in-progress');
    setDeploymentLog('');

    try {
      const response = await projectApi.deploy(projectId, {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region,
      });

      if (response.success) {
        setDeploymentStatus('success');
        setDeploymentLog(response.deployment.logs.apply || 'Deployment completed successfully');
        toast.success('Infrastructure deployed successfully!');
      } else {
        setDeploymentStatus('error');
        setDeploymentLog(response.error || response.message || 'Deployment failed');
        toast.error('Deployment failed: ' + response.message);
      }
    } catch (error: any) {
      setDeploymentStatus('error');
      setDeploymentLog(error.message || 'Deployment failed');
      toast.error('Deployment failed: ' + error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetDeployment = () => {
    setDeploymentStatus('idle');
    setDeploymentLog('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}
        onInteractOutside={(e) => {
          if (isDeploying) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Deploy to AWS
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="preview" disabled={!projectId}>Preview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-4">
            {!projectId ? (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Save your project first to enable deployment
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {!readiness.canDeploy && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {readiness.hasTerraformCode ? 
                        'Terraform is not installed on the server' : 
                        'Generate Terraform code first to enable deployment'}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessKeyId">Access Key ID</Label>
                    <Input
                      id="accessKeyId"
                      type="password"
                      placeholder="AKIA..."
                      value={credentials.accessKeyId}
                      onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                      disabled={isDeploying}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                    <Input
                      id="secretAccessKey"
                      type="password"
                      placeholder="Your secret key"
                      value={credentials.secretAccessKey}
                      onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                      disabled={isDeploying}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      placeholder="us-east-1"
                      value={credentials.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      disabled={isDeploying}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetDeployment();
                      checkReadiness();
                    }}
                    disabled={isDeploying}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Check Readiness
                  </Button>
                  <Button 
                    onClick={handleDeploy} 
                    disabled={isDeploying || !readiness.canDeploy || !credentials.accessKeyId || !credentials.secretAccessKey}
                    className="min-w-[120px]"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Deploy Now'
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Terraform Code Preview</CardTitle>
                <CardDescription>
                  Review the generated infrastructure code before deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs max-h-60 overflow-y-auto">
                  {terraformCode || 'No Terraform code available. Generate code first.'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
                <CardDescription>
                  {deploymentStatus === 'success' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Deployment completed successfully
                    </span>
                  ) : deploymentStatus === 'error' ? (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Deployment failed
                    </span>
                  ) : deploymentStatus === 'in-progress' ? (
                    <span className="text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deployment in progress...
                    </span>
                  ) : (
                    'No deployment logs yet'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs max-h-60 overflow-y-auto">
                  {deploymentLog || 'Deployment logs will appear here...'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;