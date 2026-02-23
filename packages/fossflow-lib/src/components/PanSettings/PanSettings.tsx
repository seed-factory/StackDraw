import React from 'react';
import {
  Box,
  Stack,
  Text,
  Title,
  Switch,
  Slider,
  Paper,
  Divider
} from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const PanSettings = () => {
  const panSettings = useUiStateStore((state) => state.panSettings);
  const setPanSettings = useUiStateStore((state) => state.actions.setPanSettings);
  const { t } = useTranslation();

  const handleToggle = (setting: keyof typeof panSettings) => {
    if (typeof panSettings[setting] === 'boolean') {
      setPanSettings({
        ...panSettings,
        [setting]: !panSettings[setting]
      });
    }
  };

  const handleSpeedChange = (value: number) => {
    setPanSettings({
      ...panSettings,
      keyboardPanSpeed: value
    });
  };

  return (
    <Box p="md">
      <Title order={4} mb="sm">
        {t('settings.pan.title')}
      </Title>

      <Paper p="md" mb="md" withBorder>
        <Text fw={500} size="sm" mb="xs">
          {t('settings.pan.mousePanOptions')}
        </Text>

        <Stack gap="xs">
          <Switch
            checked={panSettings.emptyAreaClickPan}
            onChange={() => handleToggle('emptyAreaClickPan')}
            label={t('settings.pan.emptyAreaClickPan')}
          />

          <Switch
            checked={!panSettings.middleClickPan}
            onChange={() => handleToggle('middleClickPan')}
            label={t('settings.pan.middleClickPan')}
          />

          <Switch
            checked={!panSettings.rightClickPan}
            onChange={() => handleToggle('rightClickPan')}
            label={t('settings.pan.rightClickPan')}
          />

          <Switch
            checked={!panSettings.ctrlClickPan}
            onChange={() => handleToggle('ctrlClickPan')}
            label={t('settings.pan.ctrlClickPan')}
          />

          <Switch
            checked={!panSettings.altClickPan}
            onChange={() => handleToggle('altClickPan')}
            label={t('settings.pan.altClickPan')}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Text fw={500} size="sm" mb="xs">
          {t('settings.pan.keyboardPanOptions')}
        </Text>

        <Stack gap="xs">
          <Switch
            checked={panSettings.arrowKeysPan}
            onChange={() => handleToggle('arrowKeysPan')}
            label={t('settings.pan.arrowKeys')}
          />

          <Switch
            checked={panSettings.wasdPan}
            onChange={() => handleToggle('wasdPan')}
            label={t('settings.pan.wasdKeys')}
          />

          <Switch
            checked={panSettings.ijklPan}
            onChange={() => handleToggle('ijklPan')}
            label={t('settings.pan.ijklKeys')}
          />
        </Stack>

        <Divider my="md" />

        <Text fw={500} size="sm" mb="xs">
          {t('settings.pan.keyboardPanSpeed')}
        </Text>

        <Box px="sm">
          <Slider
            value={panSettings.keyboardPanSpeed}
            onChange={handleSpeedChange}
            min={5}
            max={50}
            step={5}
            marks={[
              { value: 5 },
              { value: 10 },
              { value: 15 },
              { value: 20 },
              { value: 25 },
              { value: 30 },
              { value: 35 },
              { value: 40 },
              { value: 45 },
              { value: 50 }
            ]}
            labelAlwaysOn={false}
          />
        </Box>
      </Paper>

      <Text size="xs" c="dimmed" mt="md">
        {t('settings.pan.note')}
      </Text>
    </Box>
  );
};
