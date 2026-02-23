import React from 'react';
import { Box, Stack, Switch, Text } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useLocale } from 'src/stores/localeStore';

export const ZoomSettings = () => {
  const zoomSettings = useUiStateStore((state) => state.zoomSettings);
  const setZoomSettings = useUiStateStore((state) => state.actions.setZoomSettings);
  const locale = useLocale();

  const handleToggle = (setting: keyof typeof zoomSettings) => {
    setZoomSettings({
      ...zoomSettings,
      [setting]: !zoomSettings[setting]
    });
  };

  return (
    <Box>
      <Text size="sm" c="dimmed" mb="md">
        {locale.settings.zoom.description}
      </Text>

      <Switch
        checked={zoomSettings.zoomToCursor}
        onChange={() => handleToggle('zoomToCursor')}
        label={
          <Stack gap={0}>
            <Text size="sm">
              {locale.settings.zoom.zoomToCursor}
            </Text>
            <Text size="xs" c="dimmed">
              {locale.settings.zoom.zoomToCursorDesc}
            </Text>
          </Stack>
        }
      />
    </Box>
  );
};
