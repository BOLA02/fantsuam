// app/(admin)/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-types';

import { SettingsProfileForm } from '@/components/settings-profile-form';
import { AdminStaffManagement } from '@/components/admin-staff-management';

interface OrganizationSettings {
  id: string;
  organizationName: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await apiClient<ApiResponse<OrganizationSettings>>(
          '/settings/organization'
        );
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error('Failed to load organization settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handlePolicySave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient<ApiResponse<OrganizationSettings>>(
        '/settings/organization',
        {
          method: 'PATCH',
          body: JSON.stringify({
            organizationName: settings.organizationName,
            email: settings.email,
            phone: settings.phone,
          }),
        }
      );
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to save organization settings:', err);
      setError('Failed to save settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Control Panel & Operations Settings"
        description="Configure system access structures and organizational profile."
      />

      <AdminStaffManagement />

      {loading && (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading organization profile…
        </div>
      )}

      {!loading && settings && (
        <SettingsProfileForm
          organizationName={settings.organizationName}
          email={settings.email}
          phone={settings.phone}
          onFieldChange={handleFieldChange}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button
          nativeButton={true}
          onClick={handlePolicySave}
          disabled={saving || loading || !settings}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Save System Profiles
        </Button>
      </div>
    </div>
  );
}