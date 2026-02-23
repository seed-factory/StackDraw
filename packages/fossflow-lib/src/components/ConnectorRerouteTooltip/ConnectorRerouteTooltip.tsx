import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Text, ActionIcon, Transition } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useUiStateStore, useUiStateStoreApi } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/stores/localeStore';

const STORAGE_KEY = 'fossflow_connector_reroute_hint_dismissed';

export const ConnectorRerouteTooltip = () => {
  const { t } = useTranslation('connectorRerouteTooltip');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const modeType = useUiStateStore((state) => state.mode.type);
  const isConnecting = useUiStateStore((state) =>
    state.mode.type === 'CONNECTOR' ? state.mode.isConnecting : false
  );
  const connectorId = useUiStateStore((state) =>
    state.mode.type === 'CONNECTOR' ? state.mode.id : null
  );
  const storeApi = useUiStateStoreApi();
  const { connectors } = useScene();
  const previousIsConnectingRef = useRef(isConnecting);
  const shownForConnectorRef = useRef<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if the hint has been dismissed before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== 'true') {
      setIsDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (isDismissed) {
      return;
    }

    const wasConnecting = previousIsConnectingRef.current;

    // Detect when we transition from isConnecting to not isConnecting (connection completed)
    if (
      modeType === 'CONNECTOR' &&
      wasConnecting &&
      !isConnecting &&
      !connectorId // After connection is complete, id is set to null
    ) {
      // Find the most recently created connector
      const latestConnector = connectors[connectors.length - 1];

      if (latestConnector && latestConnector.id !== shownForConnectorRef.current) {
        // Show tooltip near the mouse position (read imperatively)
        const currentMousePosition = storeApi.getState().mouse.position.screen;
        setTooltipPosition({
          x: currentMousePosition.x,
          y: currentMousePosition.y
        });
        setShowTooltip(true);
        shownForConnectorRef.current = latestConnector.id;

        // Auto-hide after 15 seconds
        const timer = setTimeout(() => {
          setShowTooltip(false);
        }, 15000);

        return () => clearTimeout(timer);
      }
    }

    // Hide tooltip when switching away from connector mode
    if (modeType !== 'CONNECTOR') {
      setShowTooltip(false);
    }

    previousIsConnectingRef.current = isConnecting;
  }, [modeType, isConnecting, connectorId, connectors, isDismissed, storeApi]);

  const handleDismiss = () => {
    setShowTooltip(false);
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!showTooltip || isDismissed) {
    return null;
  }

  return (
    <Transition mounted={showTooltip} transition="fade" duration={300}>
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: 'fixed',
            left: Math.min(tooltipPosition.x + 20, window.innerWidth - 370),
            top: Math.min(tooltipPosition.y - 80, window.innerHeight - 120),
            zIndex: 1400,
            maxWidth: 340
          }}
        >
          <Paper
            shadow="md"
            style={{
              padding: 'var(--mantine-spacing-md)',
              paddingRight: 'calc(var(--mantine-spacing-md) + 28px)',
              position: 'relative',
              borderLeft: '4px solid var(--mantine-color-green-6)'
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
              {t('title')}
            </Text>

            <Text size="sm" c="dimmed" style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
              {t('instructionStart')}
            </Text>

            <Text size="sm" c="dimmed">
              <strong>{t('instructionSelect')}</strong> {t('instructionMiddle')} <strong>{t('instructionClick')}</strong> {t('instructionAnd')} <strong>{t('instructionDrag')}</strong> {t('instructionEnd')}
            </Text>
          </Paper>
        </Box>
      )}
    </Transition>
  );
};
