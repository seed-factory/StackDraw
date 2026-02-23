import React from 'react';
import {
  Box,
  Text,
  Switch,
  Slider,
  Stack
} from '@mantine/core';
import { UiElement } from 'src/components/UiElement/UiElement';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const AnimationsPanel = () => {
  const { t } = useTranslation();
  const animationSettings = useUiStateStore((state) => state.animationSettings);
  const setAnimationSettings = useUiStateStore(
    (state) => state.actions.setAnimationSettings
  );

  return (
    <UiElement
      style={{
        padding: 16,
        minWidth: 240
      }}
    >
      <Text size="sm" fw={500} mb="sm">
        {t('animationsPanel.title')}
      </Text>

      <Stack gap="md">
        <Switch
          label={t('animationsPanel.enable')}
          checked={animationSettings.enabled}
          onChange={(e) => {
            setAnimationSettings({ enabled: e.currentTarget.checked });
          }}
        />

        <Box>
          <Text size="xs" c="dimmed" mb={4}>
            {t('animationsPanel.speed')}
          </Text>
          <Slider
            value={animationSettings.speed}
            onChange={(value) => {
              setAnimationSettings({ speed: value });
            }}
            min={1}
            max={10}
            step={1}
            marks={[
              { value: 1 },
              { value: 5 },
              { value: 10 }
            ]}
            disabled={!animationSettings.enabled}
            labelAlwaysOn={false}
          />
        </Box>
      </Stack>
    </UiElement>
  );
};
