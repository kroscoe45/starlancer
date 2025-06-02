// src/components/dashboard/AWSConfigDialog.tsx
import React, { useState } from "react";
import type { AWSConfig } from "@/hooks/useAWSConfig";

interface AWSConfigDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfigure: (config: AWSConfig) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isConfigured?: boolean;
  testConnection?: () => Promise<boolean>;
  getConnectionStatus?: () => Promise<string>;
}

export function AWSConfigDialog({
  isOpen = false,
  onClose = () => {},
  onConfigure,
  isLoading = false,
  error = null,
}: AWSConfigDialogProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<AWSConfig>({
    region: "us-west-2",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AWSConfig, string>>
  >({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AWSConfig, string>> = {};

    if (!formData.region.trim()) {
      errors.region = "Region is required";
    }

    if (!formData.accessKeyId.trim()) {
      errors.accessKeyId = "Access Key ID is required";
    } else if (formData.accessKeyId.length < 16) {
      errors.accessKeyId = "Access Key ID appears to be too short";
    }

    if (!formData.secretAccessKey.trim()) {
      errors.secretAccessKey = "Secret Access Key is required";
    } else if (formData.secretAccessKey.length < 32) {
      errors.secretAccessKey = "Secret Access Key appears to be too short";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onConfigure(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by the parent component
      console.error("Configuration failed:", err);
    }
  };

  const handleInputChange = (field: keyof AWSConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            AWS Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              AWS Region
            </label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.region ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="eu-central-1">Europe (Frankfurt)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
            {formErrors.region && (
              <p className="mt-1 text-sm text-red-600">{formErrors.region}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="accessKeyId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Access Key ID
            </label>
            <input
              type="text"
              id="accessKeyId"
              value={formData.accessKeyId}
              onChange={(e) => handleInputChange("accessKeyId", e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.accessKeyId ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {formErrors.accessKeyId && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.accessKeyId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="secretAccessKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Secret Access Key
            </label>
            <input
              type="password"
              id="secretAccessKey"
              value={formData.secretAccessKey}
              onChange={(e) =>
                handleInputChange("secretAccessKey", e.target.value)
              }
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.secretAccessKey
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {formErrors.secretAccessKey && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.secretAccessKey}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Configuring..." : "Configure"}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> Your credentials are stored locally and used
            only to access your AWS DynamoDB table. For production deployments,
            consider using environment variables instead.
          </p>
        </div>
      </div>
    </div>
  );
}
