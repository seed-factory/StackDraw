import React from 'react';
import { Box, Radio, Text, Switch, Divider, Group, useMantineColorScheme } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { ColorScheme } from 'src/types';
import { useTranslation } from 'src/stores/localeStore';

const THEME_OPTIONS: Array<{ label: string; value: ColorScheme; description: string }> = [
  { label: 'Light', value: 'light', description: 'Always use light theme' },
  { label: 'Dark', value: 'dark', description: 'Always use dark theme' },
  { label: 'System (Auto)', value: 'auto', description: 'Follow system preference' }
];

export const ThemeSettings = () => {
  const currentColorScheme = useUiStateStore((state) => state.colorScheme);
  const setColorScheme = useUiStateStore((state) => state.actions.setColorScheme);
  const blueprintMode = useUiStateStore((state) => state.blueprintMode);
  const setBlueprintMode = useUiStateStore((state) => state.actions.setBlueprintMode);
  const { setColorScheme: setMantineColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const handleThemeChange = (newTheme: string) => {
    const scheme = newTheme as ColorScheme;
    setColorScheme(scheme);
    setMantineColorScheme(scheme);

    // Dispatch event for the parent app to handle theme change
    window.dispatchEvent(new CustomEvent('stackdraw:themeChange', {
      detail: { colorScheme: scheme }
    }));
  };

  const handleBlueprintToggle = (enabled: boolean) => {
    setBlueprintMode(enabled);

    // Dispatch event for the parent app
    window.dispatchEvent(new CustomEvent('stackdraw:blueprintModeChange', {
      detail: { enabled }
    }));
  };

  return (
    <Box>
      <Text size="sm" c="dimmed" mb="md">
        {t('settings.theme.description') || 'Select the interface color theme. This affects the appearance of the entire application.'}
      </Text>

      <Radio.Group
        value={currentColorScheme}
        onChange={handleThemeChange}
      >
        {THEME_OPTIONS.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            label={
              <Box>
                <Text size="sm">{t(`settings.theme.${option.value}`) || option.label}</Text>
                <Text size="xs" c="dimmed">{t(`settings.theme.${option.value}Description`) || option.description}</Text>
              </Box>
            }
            size="sm"
            mb="sm"
          />
        ))}
      </Radio.Group>

      <Divider my="lg" />

      {/* Blueprint Mode Section */}
      <Group justify="space-between">
        <Box>
          <Text size="sm" fw={500}>
            {t('settings.theme.blueprintMode') || 'Blueprint Mode'}
          </Text>
          <Text size="xs" c="dimmed">
            {t('settings.theme.blueprintModeDescription') || 'Classic blueprint style with blue background and white grid'}
          </Text>
        </Box>
        <Switch
          checked={blueprintMode}
          onChange={(e) => handleBlueprintToggle(e.currentTarget.checked)}
        />
      </Group>
    </Box>
  );
};
