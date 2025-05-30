// src/components/dashboard/AWSConfigDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AWSConfigDialogProps {
  isConfigured: boolean;
  error: string | null;
  onConfigure: (config: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    identityPoolId?: string;
    userPoolId?: string;
    userPoolWebClientId?: string;
  }) => Promise<void>;
}

export function AWSConfigDialog({ isConfigured, error, onConfigure }: AWSConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    region: 'us-west-2',
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: '',
    identityPoolId: '',
    userPoolId: '',
    userPoolWebClientId: '',
  });
  const [showSecrets, setShowSecrets] = useState({
    secretAccessKey: false,
    sessionToken: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onConfigure(formData);
      setOpen(false);
    } catch (err) {
      console.error('Configuration failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    }
    
    if (isConfigured) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="gap-1">
        <Settings className="h-3 w-3" />
        Not Configured
      </Badge>
    );
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          AWS Config
          {getStatusBadge()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AWS Configuration</DialogTitle>
          <DialogDescription>
            Configure your AWS credentials to access DynamoDB data. You can use direct AWS credentials
            (Access Key + Secret + Session Token) or Cognito Identity Pool for secure access.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Configuration Error</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium">
              AWS Region *
            </label>
            <Input
              id="region"
              placeholder="e.g., us-west-2"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              required
            />
          </div>

          {/* Direct AWS Credentials Section */}
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">Option 1: Direct AWS Credentials</h4>
            
            <div className="space-y-2">
              <label htmlFor="accessKeyId" className="text-sm font-medium">
                AWS Access Key ID
              </label>
              <Input
                id="accessKeyId"
                placeholder="AKIA..."
                value={formData.accessKeyId}
                onChange={(e) => setFormData(prev => ({ ...prev, accessKeyId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="secretAccessKey" className="text-sm font-medium">
                AWS Secret Access Key
              </label>
              <div className="relative">
                <Input
                  id="secretAccessKey"
                  type={showSecrets.secretAccessKey ? "text" : "password"}
                  placeholder="Enter your secret access key"
                  value={formData.secretAccessKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility('secretAccessKey')}
                >
                  {showSecrets.secretAccessKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sessionToken" className="text-sm font-medium">
                AWS Session Token (for temporary credentials)
              </label>
              <div className="relative">
                <Input
                  id="sessionToken"
                  type={showSecrets.sessionToken ? "text" : "password"}
                  placeholder="Enter your session token (if applicable)"
                  value={formData.sessionToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionToken: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility('sessionToken')}
                >
                  {showSecrets.sessionToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required if using temporary credentials (STS, MFA, etc.)
              </p>
            </div>
          </div>

          {/* Cognito Section (Alternative) */}
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">Option 2: Cognito Identity Pool (Alternative)</h4>
            
            <div className="space-y-2">
              <label htmlFor="identityPoolId" className="text-sm font-medium">
                Cognito Identity Pool ID
              </label>
              <Input
                id="identityPoolId"
                placeholder="e.g., us-west-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.identityPoolId}
                onChange={(e) => setFormData(prev => ({ ...prev, identityPoolId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="userPoolId" className="text-sm font-medium">
                Cognito User Pool ID
              </label>
              <Input
                id="userPoolId"
                placeholder="e.g., us-west-2_xxxxxxxxx"
                value={formData.userPoolId}
                onChange={(e) => setFormData(prev => ({ ...prev, userPoolId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="userPoolWebClientId" className="text-sm font-medium">
                Cognito App Client ID
              </label>
              <Input
                id="userPoolWebClientId"
                placeholder="e.g., xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.userPoolWebClientId}
                onChange={(e) => setFormData(prev => ({ ...prev, userPoolWebClientId: e.target.value }))}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2">Environment Variables (Alternative)</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><code>VITE_AWS_REGION</code> - AWS Region</div>
              <div><code>VITE_AWS_ACCESS_KEY_ID</code> - AWS Access Key ID</div>
              <div><code>VITE_AWS_SECRET_ACCESS_KEY</code> - AWS Secret Access Key</div>
              <div><code>VITE_AWS_SESSION_TOKEN</code> - AWS Session Token</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Configuring...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
