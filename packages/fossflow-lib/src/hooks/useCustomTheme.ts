import { useMantineTheme, useMantineColorScheme, MantineTheme } from '@mantine/core';
import { CustomThemeVars } from 'src/styles/mantineTheme';

export interface CustomTheme extends MantineTheme {
  customVars: CustomThemeVars;
  colorScheme: 'light' | 'dark';
}

export const useCustomTheme = (): CustomTheme => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const customVars = theme.other as CustomThemeVars;

  // Resolve 'auto' to actual theme based on system preference
  const resolvedColorScheme =
    colorScheme === 'auto'
      ? typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : colorScheme;

  return {
    ...theme,
    customVars,
    colorScheme: resolvedColorScheme
  };
};

// Helper to get theme-aware color from customPalette
export const useThemedColor = (colorKey: keyof CustomThemeVars['customPalette']): string => {
  const { customVars, colorScheme } = useCustomTheme();
  const colorValue = customVars.customPalette[colorKey];

  if (typeof colorValue === 'string') {
    return colorValue;
  }

  return colorScheme === 'dark' ? colorValue.dark : colorValue.light;
};
