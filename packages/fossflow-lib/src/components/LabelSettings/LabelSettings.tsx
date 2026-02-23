import React from 'react';
import { Box, Stack, Text, Slider } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const LabelSettings = () => {
  const { t } = useTranslation();
  const labelSettings = useUiStateStore((state) => state.labelSettings);
  const setLabelSettings = useUiStateStore((state) => state.actions.setLabelSettings);

  const handlePaddingChange = (value: number) => {
    setLabelSettings({
      ...labelSettings,
      expandButtonPadding: value
    });
  };

  return (
    <Box>
      <Text size="sm" c="dimmed" mb="md">
        {t('labelSettings.description')}
      </Text>

      <Stack gap="xs" mb="lg">
        <Text size="sm" fw={500}>
          {t('labelSettings.expandButtonPadding')}
        </Text>
        <Text size="xs" c="dimmed">
          {t('labelSettings.expandButtonPaddingDesc')}
        </Text>
        <Slider
          value={labelSettings.expandButtonPadding}
          onChange={handlePaddingChange}
          min={0}
          max={8}
          step={0.5}
          marks={[
            { value: 0 },
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
            { value: 7 },
            { value: 8 }
          ]}
          label={(value) => value}
          mt="sm"
        />
        <Text size="xs" c="dimmed">
          {t('labelSettings.currentValue').replace('{value}', String(labelSettings.expandButtonPadding))}
        </Text>
      </Stack>
    </Box>
  );
};
