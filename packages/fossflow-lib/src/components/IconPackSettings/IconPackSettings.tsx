import React from 'react';
import {
  Box,
  Stack,
  Group,
  Switch,
  Checkbox,
  Text,
  Title,
  Paper,
  Loader,
  Alert,
  Divider
} from '@mantine/core';
import { useTranslation } from 'src/stores/localeStore';

export interface IconPackSettingsProps {
  lazyLoadingEnabled: boolean;
  onToggleLazyLoading: (enabled: boolean) => void;
  packInfo: Array<{
    name: string;
    displayName: string;
    loaded: boolean;
    loading: boolean;
    error: string | null;
    iconCount: number;
  }>;
  enabledPacks: string[];
  onTogglePack: (packName: string, enabled: boolean) => void;
}

export const IconPackSettings: React.FC<IconPackSettingsProps> = ({
  lazyLoadingEnabled,
  onToggleLazyLoading,
  packInfo,
  enabledPacks,
  onTogglePack
}) => {
  const { t } = useTranslation();

  const handleLazyLoadingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleLazyLoading(event.target.checked);
  };

  const handlePackToggle = (packName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onTogglePack(packName, event.target.checked);
  };

  return (
    <Box>
      <Title order={4} mb="sm">
        {t('settings.iconPacks.title')}
      </Title>

      {/* Lazy Loading Toggle */}
      <Paper withBorder p="md" mt="md">
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} mb={4}>
              {t('settings.iconPacks.lazyLoading')}
            </Text>
            <Text size="sm" c="dimmed">
              {t('settings.iconPacks.lazyLoadingDesc')}
            </Text>
          </Box>
          <Switch
            checked={lazyLoadingEnabled}
            onChange={handleLazyLoadingChange}
          />
        </Group>
      </Paper>

      {/* Core Isoflow (Always Loaded) */}
      <Paper withBorder p="md" mt="md" bg="var(--mantine-color-gray-light)">
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600}>
              {t('settings.iconPacks.coreIsoflow')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('settings.iconPacks.alwaysEnabled')}
            </Text>
          </Box>
          <Checkbox checked disabled />
        </Group>
      </Paper>

      {/* Available Icon Packs */}
      <Box mt="lg">
        <Text fw={600} mb="sm">
          {t('settings.iconPacks.availablePacks')}
        </Text>

        {!lazyLoadingEnabled && (
          <Alert color="blue" mb="md">
            {t('settings.iconPacks.lazyLoadingDisabledNote')}
          </Alert>
        )}

        <Stack gap="xs">
          {packInfo.map((pack) => (
            <Paper key={pack.name} withBorder p="md">
              <Group justify="space-between" align="center">
                <Box style={{ flex: 1 }}>
                  <Text fw={500}>
                    {pack.displayName}
                  </Text>
                  <Group gap="xs" mt={4}>
                    {pack.loading && (
                      <>
                        <Loader size={14} />
                        <Text size="xs" c="dimmed">
                          {t('settings.iconPacks.loading')}
                        </Text>
                      </>
                    )}
                    {pack.loaded && !pack.loading && (
                      <Text size="xs" c="green">
                        {t('settings.iconPacks.loaded')} • {t('settings.iconPacks.iconCount').replace('{count}', String(pack.iconCount))}
                      </Text>
                    )}
                    {pack.error && (
                      <Text size="xs" c="red">
                        {pack.error}
                      </Text>
                    )}
                    {!pack.loaded && !pack.loading && !pack.error && (
                      <Text size="xs" c="dimmed">
                        {t('settings.iconPacks.notLoaded')}
                      </Text>
                    )}
                  </Group>
                </Box>
                <Checkbox
                  checked={enabledPacks.includes(pack.name) || !lazyLoadingEnabled}
                  onChange={handlePackToggle(pack.name)}
                  disabled={!lazyLoadingEnabled || pack.loading}
                />
              </Group>
            </Paper>
          ))}
        </Stack>
      </Box>

      <Divider my="lg" />

      <Text size="sm" c="dimmed">
        {t('settings.iconPacks.note')}
      </Text>
    </Box>
  );
};
