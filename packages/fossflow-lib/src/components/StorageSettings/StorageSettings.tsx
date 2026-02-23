import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Switch,
  Alert,
  Loader,
  Badge
} from '@mantine/core';
import {
  IconDatabase,
  IconCloud,
  IconCloudOff,
  IconLock
} from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

const USE_SERVER_STORAGE_KEY = 'stackdraw-use-server-storage';

interface StorageStatus {
  enabled: boolean;
  gitBackup: boolean;
  storagePath?: string;
  version?: string;
}

export interface StorageSettingsProps {
  serverAvailable?: boolean;
  onStoragePreferenceChange?: (useServer: boolean) => void;
}

export const StorageSettings = ({ serverAvailable = false, onStoragePreferenceChange }: StorageSettingsProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [useServerStorage, setUseServerStorage] = useState<boolean>(() => {
    const saved = localStorage.getItem(USE_SERVER_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true; // Default to true if not set
  });

  // Determine base URL for API calls
  const getBaseUrl = () => {
    const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '3000';
    return isDevelopment ? 'http://localhost:3001' : '';
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getBaseUrl()}/api/storage/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setError('Failed to fetch storage status');
      }
    } catch (err) {
      setError('Server not available');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const updateGitBackup = async (enabled: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`${getBaseUrl()}/api/storage/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gitBackup: enabled })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => prev ? { ...prev, gitBackup: data.gitBackup } : null);
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setUpdating(false);
    }
  };

  const handleUseServerStorageChange = (enabled: boolean) => {
    setUseServerStorage(enabled);
    localStorage.setItem(USE_SERVER_STORAGE_KEY, String(enabled));
    if (onStoragePreferenceChange) {
      onStoragePreferenceChange(enabled);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: 'var(--mantine-spacing-lg)' }}>
        <Loader size="sm" />
      </Box>
    );
  }

  return (
    <Box>
      <Group gap="xs" mb="sm">
        <IconDatabase size={24} />
        <Title order={4}>
          {t('settings.storage.title') || 'Storage Settings'}
        </Title>
      </Group>

      {error && (
        <Alert color="yellow" mb="sm">
          {error}
        </Alert>
      )}

      {/* Server Status */}
      <Box mb="md" p="sm" style={{ backgroundColor: 'var(--mantine-color-default)', borderRadius: 'var(--mantine-radius-sm)' }}>
        <Group gap="xs" mb="xs">
          {status?.enabled ? (
            <IconCloud size={20} color="var(--mantine-color-green-6)" />
          ) : (
            <IconCloudOff size={20} color="var(--mantine-color-dimmed)" />
          )}
          <Text fw={500}>
            {t('settings.storage.serverStorage') || 'Server Storage'}
          </Text>
          <Badge
            size="sm"
            color={status?.enabled ? 'green' : 'gray'}
          >
            {status?.enabled ? (t('settings.storage.enabled') || 'Enabled') : (t('settings.storage.disabled') || 'Disabled')}
          </Badge>
        </Group>
        {status?.storagePath && (
          <Text size="sm" c="dimmed">
            {t('settings.storage.path') || 'Path'}: {status.storagePath}
          </Text>
        )}
      </Box>

      {/* Use Server Storage Toggle */}
      <Box mb="sm">
        <Group gap="xs">
          <Switch
            checked={useServerStorage && status?.enabled}
            onChange={(event) => handleUseServerStorageChange(event.currentTarget.checked)}
            disabled={!status?.enabled}
            label={
              <Stack gap={0}>
                <Group gap="xs">
                  <Text>
                    {t('settings.storage.useServerStorage') || 'Use Server Storage'}
                  </Text>
                  {!status?.enabled && (
                    <Badge size="xs" color="gray" leftSection={<IconLock size={10} />}>
                      {t('settings.storage.envDisabled') || 'ENV Disabled'}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  {t('settings.storage.useServerStorageDesc') || 'When enabled, diagrams will be saved to the server instead of browser storage'}
                </Text>
              </Stack>
            }
          />
        </Group>
        {!status?.enabled && (
          <Text size="xs" c="dimmed" mt="xs" ml="xl">
            {t('settings.storage.envDisabledNote') || 'Server storage is disabled by the system administrator (ENABLE_SERVER_STORAGE=false)'}
          </Text>
        )}
      </Box>

      {/* Git Backup Setting */}
      {status?.enabled && (
        <Box mb="sm">
          <Group gap="xs">
            <Switch
              checked={status?.gitBackup || false}
              onChange={(event) => updateGitBackup(event.currentTarget.checked)}
              disabled={updating || !status?.enabled}
              label={
                <Stack gap={0}>
                  <Text>
                    {t('settings.storage.gitBackup') || 'Git Backup'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t('settings.storage.gitBackupDescription') || 'Automatically commit changes to git repository for version history'}
                  </Text>
                </Stack>
              }
            />
            {updating && <Loader size="xs" />}
          </Group>
        </Box>
      )}

      {/* Info */}
      <Alert color="blue" mt="sm">
        <Text size="sm">
          {status?.enabled
            ? (t('settings.storage.serverInfo') || 'Diagrams are saved on the server and available across all devices. Git backup creates version history for your diagrams.')
            : (t('settings.storage.sessionInfo') || 'Server storage is not available. Diagrams are saved in browser session storage only.')}
        </Text>
      </Alert>

      {status?.version && (
        <Text size="xs" c="dimmed" mt="sm">
          {t('settings.storage.version') || 'Server version'}: {status.version}
        </Text>
      )}
    </Box>
  );
};
