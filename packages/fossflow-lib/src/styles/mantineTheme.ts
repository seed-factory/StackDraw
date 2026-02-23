import { createTheme, MantineThemeOverride } from '@mantine/core';

export interface CustomThemeVars {
  appPadding: {
    x: number;
    y: number;
  };
  toolMenu: {
    height: number;
  };
  customPalette: {
    diagramBg: { light: string; dark: string };
    defaultColor: string;
    [key: string]: string | { light: string; dark: string };
  };
  blueprint: {
    background: { light: string; dark: string };
    gridColor: string;
    gridOpacity: number;
  };
}

export const customVars: CustomThemeVars = {
  appPadding: {
    x: 40,
    y: 40
  },
  toolMenu: {
    height: 40
  },
  customPalette: {
    diagramBg: { light: '#f6faff', dark: '#1a1b1e' },
    defaultColor: '#a5b8f3'
  },
  blueprint: {
    background: {
      light: '#4a7fb5', // Brighter blueprint blue for light theme
      dark: '#1e3a5f'   // Classic dark blueprint blue for dark theme
    },
    gridColor: '#ffffff',   // White grid lines
    gridOpacity: 0.6        // Grid opacity (brighter lines)
  }
};

export const mantineTheme: MantineThemeOverride = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'sm',
  other: customVars,
  fontSizes: {
    xs: '0.75rem',
    sm: '0.85rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  },
  headings: {
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.2' },
      h2: { fontSize: '1.75rem', lineHeight: '1.2' },
      h3: { fontSize: '1.5rem', lineHeight: '1.2' },
      h4: { fontSize: '1.25rem', lineHeight: '1.2' },
      h5: { fontSize: '1.1rem', lineHeight: '1.2' },
      h6: { fontSize: '1rem', lineHeight: '1.2' }
    }
  },
  shadows: {
    xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0px 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0px 10px 20px rgba(0, 0, 0, 0.25)'
  },
  components: {
    Button: {
      defaultProps: {
        variant: 'filled'
      },
      styles: {
        root: {
          textTransform: 'none'
        }
      }
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle'
      }
    },
    TextInput: {
      defaultProps: {
        variant: 'default'
      }
    }
  }
});

// Type augmentation for Mantine theme
declare module '@mantine/core' {
  export interface MantineThemeOther extends CustomThemeVars {}
}
