"use client";

import * as React from "react";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AutosaveState } from "@/contexts/UserContext";

interface AutosaveStatusProps {
  autosave: AutosaveState;
  onForceSave?: () => Promise<void>;
  className?: string;
}

export const AutosaveStatus: React.FC<AutosaveStatusProps> = ({ 
  autosave, 
  onForceSave, 
  className = "" 
}) => {
  const [isManualSaving, setIsManualSaving] = React.useState(false);

  const handleForceSave = async () => {
    if (!onForceSave) return;
    
    setIsManualSaving(true);
    try {
      await onForceSave();
    } catch (error) {
      console.error("Manual save failed:", error);
    } finally {
      setIsManualSaving(false);
    }
  };

  const getStatusIcon = () => {
    if (isManualSaving || autosave.status === 'saving') {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (autosave.status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'idle':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isManualSaving) return "Saving...";
    
    switch (autosave.status) {
      case 'saving':
        return "Saving...";
      case 'saved':
        return autosave.lastSaved 
          ? `Saved ${formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}`
          : "Saved";
      case 'error':
        return autosave.error || "Save failed";
      case 'idle':
      default:
        return autosave.lastSaved 
          ? `Last saved ${formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}`
          : "Ready";
    }
  };

  const getStatusColor = () => {
    if (isManualSaving || autosave.status === 'saving') return "text-blue-600";
    
    switch (autosave.status) {
      case 'saved':
        return "text-green-600";
      case 'error':
        return "text-red-600";
      case 'idle':
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {onForceSave && autosave.status !== 'saving' && !isManualSaving && (
        <button
          onClick={handleForceSave}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
          disabled={isManualSaving}
        >
          Save Now
        </button>
      )}
      
      {autosave.status === 'error' && autosave.error && (
        <div className="ml-2">
          <span className="text-xs text-red-500" title={autosave.error}>
            ⚠️
          </span>
        </div>
      )}
    </div>
  );
};

export default AutosaveStatus;
