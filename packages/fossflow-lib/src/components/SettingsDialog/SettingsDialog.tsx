import React, { useState } from 'react';
import { Modal, Tabs, Box, Button, Tooltip, Group, Text } from '@mantine/core';
import {
  IconLanguage,
  IconKeyboard,
  IconHandMove,
  IconZoomIn,
  IconTag,
  IconTimeline,
  IconPackage,
  IconDatabase,
  IconInfoCircle,
  IconPalette
} from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { HotkeySettings } from '../HotkeySettings/HotkeySettings';
import { PanSettings } from '../PanSettings/PanSettings';
import { ZoomSettings } from '../ZoomSettings/ZoomSettings';
import { LabelSettings } from '../LabelSettings/LabelSettings';
import { ConnectorSettings } from '../ConnectorSettings/ConnectorSettings';
import { IconPackSettings } from '../IconPackSettings/IconPackSettings';
import { LanguageSettings } from '../LanguageSettings/LanguageSettings';
import { ThemeSettings } from '../ThemeSettings/ThemeSettings';
import { StorageSettings } from '../StorageSettings/StorageSettings';
import { InfoSettings } from '../InfoSettings/InfoSettings';
import { useTranslation } from 'src/stores/localeStore';

export interface SettingsDialogProps {
  iconPackManager?: {
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
  };
}

export const SettingsDialog = ({ iconPackManager }: SettingsDialogProps) => {
  const dialog = useUiStateStore((state) => state.dialog);
  const setDialog = useUiStateStore((state) => state.actions.setDialog);
  const [tabValue, setTabValue] = useState<string | null>('language');
  const { t } = useTranslation();

  const isOpen = dialog === 'SETTINGS';

  const handleClose = () => {
    setDialog(null);
  };

  const handleTabChange = (value: string | null) => {
    setTabValue(value);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size="lg"
      title={t('settingsDialog.title')}
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tabs.List>
          <Tooltip label={t('settingsDialog.tabs.language')} withArrow>
            <Tabs.Tab value="language" aria-label={t('settingsDialog.tabs.language')}>
              <IconLanguage size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settingsDialog.tabs.theme')} withArrow>
            <Tabs.Tab value="theme" aria-label={t('settingsDialog.tabs.theme')}>
              <IconPalette size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settings.hotkeys.title')} withArrow>
            <Tabs.Tab value="hotkeys" aria-label={t('settings.hotkeys.title')}>
              <IconKeyboard size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settings.pan.title')} withArrow>
            <Tabs.Tab value="pan" aria-label={t('settings.pan.title')}>
              <IconHandMove size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settingsDialog.tabs.zoom')} withArrow>
            <Tabs.Tab value="zoom" aria-label={t('settingsDialog.tabs.zoom')}>
              <IconZoomIn size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settingsDialog.tabs.labels')} withArrow>
            <Tabs.Tab value="labels" aria-label={t('settingsDialog.tabs.labels')}>
              <IconTag size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label={t('settings.connector.title')} withArrow>
            <Tabs.Tab value="connector" aria-label={t('settings.connector.title')}>
              <IconTimeline size={20} />
            </Tabs.Tab>
          </Tooltip>
          {iconPackManager && (
            <Tooltip label={t('settings.iconPacks.title')} withArrow>
              <Tabs.Tab value="iconPacks" aria-label={t('settings.iconPacks.title')}>
                <IconPackage size={20} />
              </Tabs.Tab>
            </Tooltip>
          )}
          <Tooltip label={t('settingsDialog.tabs.storage')} withArrow>
            <Tabs.Tab value="storage" aria-label={t('settingsDialog.tabs.storage')}>
              <IconDatabase size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tabs.Tab value="info" aria-label={t('settingsDialog.tabs.info')}>
            <Group gap={6} wrap="nowrap">
              <IconInfoCircle size={20} />
              <Text size="sm">{t('settingsDialog.tabs.info')}</Text>
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        <Box mt="md">
          <Tabs.Panel value="language">
            <LanguageSettings />
          </Tabs.Panel>
          <Tabs.Panel value="theme">
            <ThemeSettings />
          </Tabs.Panel>
          <Tabs.Panel value="hotkeys">
            <HotkeySettings />
          </Tabs.Panel>
          <Tabs.Panel value="pan">
            <PanSettings />
          </Tabs.Panel>
          <Tabs.Panel value="zoom">
            <ZoomSettings />
          </Tabs.Panel>
          <Tabs.Panel value="labels">
            <LabelSettings />
          </Tabs.Panel>
          <Tabs.Panel value="connector">
            <ConnectorSettings />
          </Tabs.Panel>
          {iconPackManager && (
            <Tabs.Panel value="iconPacks">
              <IconPackSettings
                lazyLoadingEnabled={iconPackManager.lazyLoadingEnabled}
                onToggleLazyLoading={iconPackManager.onToggleLazyLoading}
                packInfo={iconPackManager.packInfo}
                enabledPacks={iconPackManager.enabledPacks}
                onTogglePack={iconPackManager.onTogglePack}
              />
            </Tabs.Panel>
          )}
          <Tabs.Panel value="storage">
            <StorageSettings />
          </Tabs.Panel>
          <Tabs.Panel value="info">
            <InfoSettings />
          </Tabs.Panel>
        </Box>
      </Tabs>

      <Group justify="flex-end" mt="md">
        <Button onClick={handleClose}>{t('common.close')}</Button>
      </Group>
    </Modal>
  );
};
