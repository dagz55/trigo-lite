'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from 'react';

interface TODARegistrationForm {
  // TODA Organization Details
  todaName: string;
  todaCode: string;
  registrationNumber: string;
  dateEstablished: string;
  
  // Location Information
  mainTerminal: string;
  alternateTerminals: string;
  operatingRoutes: string;
  serviceArea: string;
  
  // Contact Information
  presidentName: string;
  presidentContact: string;
  presidentEmail: string;
  secretaryName: string;
  secretaryContact: string;
  treasurerName: string;
  treasurerContact: string;
  
  // Additional Details
  totalMembers: string;
  activeTriders: string;
  monthlyDues: string;
  registrationFee: string;
  
  // Documents
  secRegistration: File | null;
  dtiPermit: File | null;
  barangayPermit: File | null;
  mayorPermit: File | null;
  
  // Terms
  agreeToTerms: boolean;
}

export default function RegisterTODAPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = React.useState<TODARegistrationForm>({
    todaName: '',
    todaCode: '',
    registrationNumber: '',
    dateEstablished: '',
    mainTerminal: '',
    alternateTerminals: '',
    operatingRoutes: '',
    serviceArea: '',
    presidentName: '',
    presidentContact: '',
    presidentEmail: '',
    secretaryName: '',
    secretaryContact: '',
    treasurerName: '',
    treasurerContact: '',
    totalMembers: '',
    activeTriders: '',
    monthlyDues: '',
    registrationFee: '',
    secRegistration: null,
    dtiPermit: null,
    barangayPermit: null,
    mayorPermit: null,
    agreeToTerms: false,
  });

  const handleInputChange = (field: keyof TODARegistrationForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof TODARegistrationForm, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.todaName && formData.todaCode && formData.registrationNumber && formData.dateEstablished);
      case 2:
        return !!(formData.mainTerminal && formData.operatingRoutes && formData.serviceArea);
      case 3:
        return !!(formData.presidentName && formData.presidentContact && formData.presidentEmail);
      case 4:
        return !!(formData.totalMembers && formData.activeTriders && formData.agreeToTerms);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Registration Submitted!",
        description: "Your TODA registration has been submitted for review. We'll contact you within 3-5 business days.",
      });
      
      console.log("TODA Registration Data:", formData);
      
      // Reset form or redirect
      setTimeout(() => {
        router.push('/dispatcher');
      }, 2000);
      
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">TODA Registration</h1>
        <p className="text-muted-foreground mt-2">
          Register your Transport Operators and Drivers Association with TriGo
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-muted'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Organization</span>
          <span className="text-sm">Location</span>
          <span className="text-sm">Officers</span>
          <span className="text-sm">Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Organization Information"}
              {currentStep === 2 && "Location & Routes"}
              {currentStep === 3 && "Officers & Contacts"}
              {currentStep === 4 && "Additional Details"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Basic information about your TODA organization"}
              {currentStep === 2 && "Terminal locations and operating routes"}
              {currentStep === 3 && "Contact details for TODA officers"}
              {currentStep === 4 && "Membership details and required documents"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Organization Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="todaName">TODA Name *</Label>
                    <Input
                      id="todaName"
                      placeholder="e.g., Talon Kuatro Transport Association"
                      value={formData.todaName}
                      onChange={(e) => handleInputChange('todaName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="todaCode">TODA Code *</Label>
                    <Input
                      id="todaCode"
                      placeholder="e.g., TK-TODA"
                      value={formData.todaCode}
                      onChange={(e) => handleInputChange('todaCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">SEC/DTI Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="e.g., CN202012345"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateEstablished">Date Established *</Label>
                    <Input
                      id="dateEstablished"
                      type="date"
                      value={formData.dateEstablished}
                      onChange={(e) => handleInputChange('dateEstablished', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Routes */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainTerminal">Main Terminal Location *</Label>
                  <Textarea
                    id="mainTerminal"
                    placeholder="Complete address of main terminal"
                    value={formData.mainTerminal}
                    onChange={(e) => handleInputChange('mainTerminal', e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alternateTerminals">Alternate Terminals</Label>
                  <Textarea
                    id="alternateTerminals"
                    placeholder="List any alternate terminal locations (optional)"
                    value={formData.alternateTerminals}
                    onChange={(e) => handleInputChange('alternateTerminals', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="operatingRoutes">Operating Routes *</Label>
                  <Textarea
                    id="operatingRoutes"
                    placeholder="List all approved routes (e.g., Terminal - SM Fairview, Terminal - Alabang Town Center)"
                    value={formData.operatingRoutes}
                    onChange={(e) => handleInputChange('operatingRoutes', e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area Coverage *</Label>
                  <Textarea
                    id="serviceArea"
                    placeholder="Describe the barangays/areas covered by your TODA"
                    value={formData.serviceArea}
                    onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Officers & Contacts */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">President</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="presidentName">Full Name *</Label>
                      <Input
                        id="presidentName"
                        placeholder="Juan Dela Cruz"
                        value={formData.presidentName}
                        onChange={(e) => handleInputChange('presidentName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="presidentContact">Contact Number *</Label>
                      <Input
                        id="presidentContact"
                        placeholder="+63 912 345 6789"
                        value={formData.presidentContact}
                        onChange={(e) => handleInputChange('presidentContact', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="presidentEmail">Email *</Label>
                      <Input
                        id="presidentEmail"
                        type="email"
                        placeholder="president@toda.ph"
                        value={formData.presidentEmail}
                        onChange={(e) => handleInputChange('presidentEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Secretary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secretaryName">Full Name</Label>
                      <Input
                        id="secretaryName"
                        placeholder="Maria Santos"
                        value={formData.secretaryName}
                        onChange={(e) => handleInputChange('secretaryName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secretaryContact">Contact Number</Label>
                      <Input
                        id="secretaryContact"
                        placeholder="+63 912 345 6789"
                        value={formData.secretaryContact}
                        onChange={(e) => handleInputChange('secretaryContact', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Treasurer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="treasurerName">Full Name</Label>
                      <Input
                        id="treasurerName"
                        placeholder="Pedro Reyes"
                        value={formData.treasurerName}
                        onChange={(e) => handleInputChange('treasurerName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="treasurerContact">Contact Number</Label>
                      <Input
                        id="treasurerContact"
                        placeholder="+63 912 345 6789"
                        value={formData.treasurerContact}
                        onChange={(e) => handleInputChange('treasurerContact', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Membership Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalMembers">Total Members *</Label>
                      <Input
                        id="totalMembers"
                        type="number"
                        placeholder="150"
                        value={formData.totalMembers}
                        onChange={(e) => handleInputChange('totalMembers', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activeTriders">Active Triders *</Label>
                      <Input
                        id="activeTriders"
                        type="number"
                        placeholder="120"
                        value={formData.activeTriders}
                        onChange={(e) => handleInputChange('activeTriders', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDues">Monthly Dues (₱)</Label>
                      <Input
                        id="monthlyDues"
                        type="number"
                        placeholder="500"
                        value={formData.monthlyDues}
                        onChange={(e) => handleInputChange('monthlyDues', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationFee">Registration Fee (₱)</Label>
                      <Input
                        id="registrationFee"
                        type="number"
                        placeholder="1000"
                        value={formData.registrationFee}
                        onChange={(e) => handleInputChange('registrationFee', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload clear copies of the following documents (PDF, JPG, or PNG format)
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="secRegistration">SEC/DTI Registration Certificate</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="secRegistration"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('secRegistration', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('secRegistration')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {formData.secRegistration ? formData.secRegistration.name : 'Choose File'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="barangayPermit">Barangay Permit</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="barangayPermit"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('barangayPermit', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('barangayPermit')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {formData.barangayPermit ? formData.barangayPermit.name : 'Choose File'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1"
                      required
                    />
                    <div>
                      <Label htmlFor="agreeToTerms" className="font-normal">
                        I certify that all information provided is accurate and complete. I agree to the TriGo platform 
                        terms of service and understand that false information may result in registration denial.
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <div className="p-6 pt-0 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
} 