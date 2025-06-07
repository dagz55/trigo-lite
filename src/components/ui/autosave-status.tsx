"use client";

import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutosaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
  className?: string;
  showText?: boolean;
}

export function AutosaveStatus({ 
  status, 
  lastSaved, 
  error, 
  className,
  showText = true 
}: AutosaveStatusProps) {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 10) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'idle':
      default:
        return lastSaved ? <Clock className="w-4 h-4 text-gray-400" /> : null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return error || 'Save failed';
      case 'idle':
      default:
        return lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'idle':
      default:
        return 'text-gray-500';
    }
  };

  if (status === 'idle' && !lastSaved) {
    return null; // Don't show anything if never saved
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      getStatusColor(),
      className
    )}>
      {getStatusIcon()}
      {showText && (
        <span className="font-medium">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}

// Compact version for inline use
export function AutosaveIndicator({ 
  status, 
  lastSaved, 
  error, 
  className 
}: AutosaveStatusProps) {
  return (
    <AutosaveStatus
      status={status}
      lastSaved={lastSaved}
      error={error}
      className={className}
      showText={false}
    />
  );
}
