import React from 'react';
import { Box, Stack, Text, Title, Radio, Paper } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const ConnectorSettings = () => {
  const connectorInteractionMode = useUiStateStore((state) => state.connectorInteractionMode);
  const setConnectorInteractionMode = useUiStateStore((state) => state.actions.setConnectorInteractionMode);
  const { t } = useTranslation();

  const handleChange = (value: string) => {
    setConnectorInteractionMode(value as 'click' | 'drag');
  };

  return (
    <Box>
      <Title order={4} mb="xs">
        {t('settings.connector.title')}
      </Title>

      <Paper withBorder p="md" mt="md">
        <Radio.Group
          value={connectorInteractionMode}
          onChange={handleChange}
          label={t('settings.connector.connectionMode')}
        >
          <Stack mt="xs" gap="sm">
            <Radio
              value="click"
              label={
                <Box>
                  <Text size="sm">{t('settings.connector.clickMode')}</Text>
                  <Text size="xs" c="dimmed">
                    {t('settings.connector.clickModeDesc')}
                  </Text>
                </Box>
              }
            />
            <Radio
              value="drag"
              label={
                <Box>
                  <Text size="sm">{t('settings.connector.dragMode')}</Text>
                  <Text size="xs" c="dimmed">
                    {t('settings.connector.dragModeDesc')}
                  </Text>
                </Box>
              }
            />
          </Stack>
        </Radio.Group>
      </Paper>

      <Text size="xs" c="dimmed" mt="md">
        {t('settings.connector.note')}
      </Text>
    </Box>
  );
};
