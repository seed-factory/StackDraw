import React, { useState, useCallback, useEffect } from 'react';
import { Box, Stack, Button, ActionIcon } from '@mantine/core';
import { IconChevronRight, IconChevronLeft, IconX } from '@tabler/icons-react';
import { useIconCategories } from 'src/hooks/useIconCategories';
import { useIcon } from 'src/hooks/useIcon';
import { useScene } from 'src/hooks/useScene';
import { useViewItem } from 'src/hooks/useViewItem';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useModelItem } from 'src/hooks/useModelItem';
import { useThemedColor } from 'src/hooks/useCustomTheme';
import { useTranslation } from 'src/stores/localeStore';
import { ControlsContainer } from '../components/ControlsContainer';
import { Icons } from '../IconSelectionControls/Icons';
import { NodeSettings } from './NodeSettings/NodeSettings';
import { Section } from '../components/Section';
import { QuickIconSelector } from './QuickIconSelector';

interface Props {
  id: string;
}

const ModeOptions = {
  SETTINGS: 'SETTINGS',
  CHANGE_ICON: 'CHANGE_ICON'
} as const;

type Mode = keyof typeof ModeOptions;

export const NodeControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('SETTINGS');
  const { updateModelItem, updateViewItem, deleteViewItem } = useScene();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const viewItem = useViewItem(id);
  const modelItem = useModelItem(id);
  const { iconCategories } = useIconCategories();
  const { icon } = useIcon(modelItem?.icon || '');
  const diagramBg = useThemedColor('diagramBg');

  const onSwitchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
  }, []);

  // Listen for quick icon change event (triggered by 'i' hotkey)
  useEffect(() => {
    const handleQuickIconChange = () => {
      setMode('CHANGE_ICON');
    };

    window.addEventListener('quickIconChange', handleQuickIconChange);
    return () => {
      window.removeEventListener('quickIconChange', handleQuickIconChange);
    };
  }, []);

  // If items don't exist, return null (component will unmount)
  if (!viewItem || !modelItem) {
    return null;
  }

  return (
    <ControlsContainer>
      <Box
        style={{
          backgroundColor: diagramBg,
          position: 'relative'
        }}
      >
        {/* Close button */}
        <ActionIcon
          aria-label={t('common.close')}
          onClick={() => {
            return uiStateActions.setItemControls(null);
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2
          }}
          size="sm"
          variant="subtle"
        >
          <IconX size={18} />
        </ActionIcon>
        <Section style={{ paddingTop: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-md)' }}>
          <Stack
            gap="md"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between'
            }}
          >
            <Box
              component="img"
              src={icon.url}
              style={{ width: 70, height: 70 }}
            />
            {mode === 'SETTINGS' && (
              <Button
                rightSection={<IconChevronRight size={16} />}
                onClick={() => {
                  onSwitchMode('CHANGE_ICON');
                }}
                variant="subtle"
              >
                {t('nodeControls.updateIcon')}
              </Button>
            )}
            {mode === 'CHANGE_ICON' && (
              <Button
                leftSection={<IconChevronLeft size={16} />}
                onClick={() => {
                  onSwitchMode('SETTINGS');
                }}
                variant="subtle"
              >
                {t('nodeControls.settings')}
              </Button>
            )}
          </Stack>
        </Section>
      </Box>
      {mode === 'SETTINGS' && (
        <NodeSettings
          key={viewItem.id}
          node={viewItem}
          onModelItemUpdated={(updates) => {
            updateModelItem(viewItem.id, updates);
          }}
          onViewItemUpdated={(updates) => {
            updateViewItem(viewItem.id, updates);
          }}
          onDeleted={() => {
            uiStateActions.setItemControls(null);
            deleteViewItem(viewItem.id);
          }}
        />
      )}
      {mode === 'CHANGE_ICON' && (
        <QuickIconSelector
          currentIconId={modelItem.icon}
          onIconSelected={(_icon) => {
            updateModelItem(viewItem.id, { icon: _icon.id });
          }}
          onClose={() => {
            onSwitchMode('SETTINGS');
          }}
        />
      )}
    </ControlsContainer>
  );
};
