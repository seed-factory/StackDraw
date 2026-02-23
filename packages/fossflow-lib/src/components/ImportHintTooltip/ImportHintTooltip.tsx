import React, { useState, useEffect } from 'react';
import { Box, Paper, Text, ActionIcon } from '@mantine/core';
import { IconX, IconFolderOpen } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

const STORAGE_KEY = 'fossflow_import_hint_dismissed';

export const ImportHintTooltip = () => {
  const { t } = useTranslation('importHintTooltip');
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if the hint has been dismissed before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== 'true') {
      setIsDismissed(false);
    }
  }, []);

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
        top: 90,
        left: 16,
        zIndex: 1300,
        maxWidth: 280
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

        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--mantine-spacing-xs)' }}>
          <IconFolderOpen size={20} style={{ marginRight: 'var(--mantine-spacing-xs)', color: 'var(--mantine-color-blue-6)' }} />
          <Text size="sm" fw={600}>
            {t('title')}
          </Text>
        </Box>

        <Text size="sm" c="dimmed">
          {t('instructionStart')} <strong>{t('menuButton')}</strong> {t('instructionMiddle')} <strong>{t('openButton')}</strong> {t('instructionEnd')}
        </Text>
      </Paper>
    </Box>
  );
};
