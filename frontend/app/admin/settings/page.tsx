'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

// 👇 REFACTORED SUB-COMPONENTS
import { SettingsProfileForm } from '@/components/settings-profile-form';
import { SettingsRatesForm } from '@/components/settings-rates-form';
import { SettingsRulesForm } from '@/components/settings-rules-form';

// 👇 IMPORT THE NEWLY CREATED COMPONENT FROM THE GLOBAL COMPONENTS PATH
import { AdminStaffManagement } from '@/components/admin-staff-management';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: 'Fantsuam Foundation',
    email: 'support@fantsuam.org',
    phone: '+234 803 000 0000',
    businessLoanRate: '8.5',
    salaryLoanRate: '12.0',
    smeLoanRate: '9.5',
    emergencyLoanRate: '15.0',
    agricultureLoanRate: '7.5',
    penaltyRate: '2.5',
    minimumInstallments: '3',
    maximumInstallments: '60',
  });

  const handleFieldChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePolicySave = () => {
    alert('System operational policy metrics synchronized successfully!');
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Control Panel & Operations Settings"
        description="Configure system access structures, default interest tiers, and organizational policy guidelines."
      />

      {/* 🚀 1. Team Directory Access Control Grid (Consumes Live Backend User Routes) */}
      <AdminStaffManagement />

      {/* 📦 2. Modular Profile Component */}
      <SettingsProfileForm
        organizationName={settings.organizationName}
        email={settings.email}
        phone={settings.phone}
        onFieldChange={handleFieldChange}
      />

      {/* 📦 3. Modular Interest Rates Component */}
      <SettingsRatesForm 
        values={settings} 
        onFieldChange={handleFieldChange} 
      />

      {/* 📦 4. Modular Business Rules Component */}
      <SettingsRulesForm
        penaltyRate={settings.penaltyRate}
        minimumInstallments={settings.minimumInstallments}
        maximumInstallments={settings.maximumInstallments}
        onFieldChange={handleFieldChange}
      />

      {/* Form Action Controls Trigger Row */}
      <div className="flex justify-end">
        <Button nativeButton={true} onClick={handlePolicySave} className="bg-primary hover:bg-primary/90">
          <Save size={18} className="mr-2" />
          Save System Profiles
        </Button>
      </div>
    </div>
  );
}
