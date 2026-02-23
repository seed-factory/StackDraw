import React, { useState, useEffect } from 'react';
import { Box, Paper, Text, ActionIcon, Transition } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';
import { useCustomTheme } from 'src/hooks/useCustomTheme';

const STORAGE_KEY = 'fossflow_connector_hint_dismissed';

interface Props {
  toolMenuRef?: React.RefObject<HTMLElement | null>;
}

export const ConnectorHintTooltip = ({ toolMenuRef }: Props) => {
  const { t } = useTranslation('connectorHintTooltip');
  const theme = useCustomTheme();
  const connectorInteractionMode = useUiStateStore((state) => state.connectorInteractionMode);
  const modeType = useUiStateStore((state) => state.mode.type);
  const isConnecting = useUiStateStore((state) =>
    state.mode.type === 'CONNECTOR' ? state.mode.isConnecting : false
  );
  const [isDismissed, setIsDismissed] = useState(true);
  const [position, setPosition] = useState({ top: 16, right: 16 });

  useEffect(() => {
    // Check if the hint has been dismissed before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== 'true') {
      setIsDismissed(false);
    }
  }, []);

  const appPadding = theme.customVars?.appPadding || { x: 16, y: 16 };

  useEffect(() => {
    // Calculate position based on toolbar
    if (toolMenuRef?.current) {
      const toolMenuRect = toolMenuRef.current.getBoundingClientRect();
      // Position tooltip below the toolbar with some spacing
      setPosition({
        top: toolMenuRect.bottom + 16,
        right: 16
      });
    } else {
      // Fallback position if no toolbar ref
      setPosition({
        top: appPadding.y + 500, // Approximate toolbar height
        right: appPadding.x
      });
    }
  }, [toolMenuRef, appPadding.x, appPadding.y]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Box
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        zIndex: 1300,
        maxWidth: 320
      }}
    >
      <Paper
        shadow="md"
        style={{
          padding: 'var(--mantine-spacing-md)',
          paddingRight: 'calc(var(--mantine-spacing-md) + 28px)',
          position: 'relative',
          borderLeft: '4px solid var(--mantine-color-blue-6)'
        }}
      >
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            right: 4,
            top: 4
          }}
        >
          <IconX size={16} />
        </ActionIcon>

        <Text size="sm" fw={600} style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
          {connectorInteractionMode === 'click' ? t('tipCreatingConnectors') : t('tipConnectorTools')}
        </Text>

        <Text size="sm" c="dimmed" style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
          {connectorInteractionMode === 'click' ? (
            <>
              <strong>{t('clickInstructionStart')}</strong> {t('clickInstructionMiddle')} <strong>{t('clickInstructionStart')}</strong> {t('clickInstructionEnd')}
              {modeType === 'CONNECTOR' && isConnecting && (
                <Box component="span" style={{ display: 'block', marginTop: 'var(--mantine-spacing-xs)', color: 'var(--mantine-color-blue-6)' }}>
                  {t('nowClickTarget')}
                </Box>
              )}
            </>
          ) : (
            <>
              <strong>{t('dragStart')}</strong> {t('dragEnd')}
            </>
          )}
        </Text>

        <Text size="sm" c="dimmed">
          {t('rerouteStart')} <strong>{t('rerouteMiddle')}</strong> {t('rerouteEnd')}
        </Text>
      </Paper>
    </Box>
  );
};
