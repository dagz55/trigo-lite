"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AutosaveTest: React.FC = () => {
  const { userProfile, updateUserProfile, autosave, forceSave } = useUser();

  const handleTestAutosave = () => {
    // Test autosave by updating the name
    const testName = `Test User ${Date.now()}`;
    updateUserProfile({ name: testName });
  };

  const handleTestManualSave = async () => {
    try {
      await forceSave();
      console.log('Manual save successful');
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('triGoUserProfile');
    localStorage.removeItem('triGoCurrentUser');
    localStorage.removeItem('triGoPaymentMethods');
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Autosave Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Autosave Status */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            {autosave.status === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-600">Saving...</span>
              </>
            )}
            {autosave.status === 'saved' && (
              <>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm font-medium text-green-600">Saved</span>
              </>
            )}
            {autosave.status === 'error' && (
              <>
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {autosave.error || 'Save failed'}
                </span>
              </>
            )}
            {autosave.status === 'idle' && (
              <>
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-500">Ready</span>
              </>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="test-name">Name</Label>
            <Input
              id="test-name"
              value={userProfile.name}
              onChange={(e) => updateUserProfile({ name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              value={userProfile.email}
              onChange={(e) => updateUserProfile({ email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button onClick={handleTestAutosave} className="w-full" variant="outline">
            Test Autosave (Change Name)
          </Button>
          <Button onClick={handleTestManualSave} className="w-full" variant="outline">
            Test Manual Save
          </Button>
          <Button onClick={handleClearStorage} className="w-full" variant="destructive">
            Clear Storage & Reload
          </Button>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Status: {autosave.status}</div>
          <div>Last Saved: {autosave.lastSaved?.toLocaleString() || 'Never'}</div>
          <div>Error: {autosave.error || 'None'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutosaveTest;
