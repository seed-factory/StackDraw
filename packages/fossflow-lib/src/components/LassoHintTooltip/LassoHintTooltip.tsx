import React, { useState, useEffect } from 'react';
import { Box, Paper, Text, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';
import { useCustomTheme } from 'src/hooks/useCustomTheme';

const STORAGE_KEY = 'fossflow_lasso_hint_dismissed';

interface Props {
  toolMenuRef?: React.RefObject<HTMLElement | null>;
}

export const LassoHintTooltip = ({ toolMenuRef }: Props) => {
  const { t } = useTranslation('lassoHintTooltip');
  const theme = useCustomTheme();
  const modeType = useUiStateStore((state) => state.mode.type);
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

  // Only show when in LASSO or FREEHAND_LASSO mode
  if (isDismissed || (modeType !== 'LASSO' && modeType !== 'FREEHAND_LASSO')) {
    return null;
  }

  const isFreehandMode = modeType === 'FREEHAND_LASSO';

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
          {isFreehandMode ? t('tipFreehandLasso') : t('tipLasso')}
        </Text>

        <Text size="sm" c="dimmed" style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
          {isFreehandMode ? (
            <>
              <strong>{t('freehandDragStart')}</strong> {t('freehandDragMiddle')} <strong>{t('freehandDragEnd')}</strong> {t('freehandComplete')}
            </>
          ) : (
            <>
              <strong>{t('lassoDragStart')}</strong> {t('lassoDragEnd')}
            </>
          )}
        </Text>

        <Text size="sm" c="dimmed">
          {t('moveStart')} <strong>{t('moveMiddle')}</strong> {t('moveEnd')}
        </Text>
      </Paper>
    </Box>
  );
};
