import React, { useEffect, useRef } from 'react';
import { MantineProvider, Box, useMantineColorScheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { mantineTheme } from 'src/styles/mantineTheme';
import { IsoflowProps, ColorScheme } from 'src/types';
import { setWindowCursor, modelFromModelStore } from 'src/utils';
import { useModelStore, ModelProvider } from 'src/stores/modelStore';
import { SceneProvider } from 'src/stores/sceneStore';
import { LocaleProvider } from 'src/stores/localeStore';
import { Renderer } from 'src/components/Renderer/Renderer';
import { UiOverlay } from 'src/components/UiOverlay/UiOverlay';
import { UiStateProvider, useUiStateStore } from 'src/stores/uiStateStore';
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from 'src/config';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import enUS from 'src/i18n/en-US';

const App = ({
  initialData,
  mainMenuOptions = MAIN_MENU_OPTIONS,
  width = '100%',
  height = '100%',
  onModelUpdated,
  enableDebugTools = false,
  editorMode = 'EDITABLE',
  renderer,
  locale = enUS,
  iconPackManager,
}: IsoflowProps) => {
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const initialDataManager = useInitialDataManager();
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });
  const prevModelRef = useRef<string | null>(null);

  const { load } = initialDataManager;

  useEffect(() => {
    load({ ...INITIAL_DATA, ...initialData });
  }, [initialData, load]);

  useEffect(() => {
    uiStateActions.setEditorMode(editorMode);
    uiStateActions.setMainMenuOptions(mainMenuOptions);
  }, [editorMode, uiStateActions, mainMenuOptions]);

  useEffect(() => {
    return () => {
      setWindowCursor('default');
    };
  }, []);

  useEffect(() => {
    if (!initialDataManager.isReady || !onModelUpdated) return;

    // Compare model content to prevent infinite loops
    // modelFromModelStore creates new object each time, so we compare JSON
    const modelJson = JSON.stringify(model);
    if (prevModelRef.current === modelJson) return;
    prevModelRef.current = modelJson;

    onModelUpdated(model);
  }, [model, initialDataManager.isReady, onModelUpdated]);

  useEffect(() => {
    uiStateActions.setEnableDebugTools(enableDebugTools);
  }, [enableDebugTools, uiStateActions]);

  useEffect(() => {
    if (renderer?.expandLabels !== undefined) {
      uiStateActions.setExpandLabels(renderer.expandLabels);
    }
  }, [renderer?.expandLabels, uiStateActions]);

  useEffect(() => {
    uiStateActions.setIconPackManager(iconPackManager || null);
  }, [iconPackManager, uiStateActions]);

  if (!initialDataManager.isReady) return null;

  return (
    <Box
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0)',
        boxSizing: 'border-box'
      }}
    >
      <Renderer {...renderer} />
      <UiOverlay />
    </Box>
  );
};

// Inner component that syncs color scheme from UI state store to Mantine
const ColorSchemeSyncer = () => {
  const colorScheme = useUiStateStore((state) => state.colorScheme);
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (colorScheme === 'auto') {
      // Explicitly detect system preference for Chrome compatibility
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorScheme(systemDark ? 'dark' : 'light');
    } else {
      setColorScheme(colorScheme);
    }
  }, [colorScheme, setColorScheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (colorScheme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorScheme, setColorScheme]);

  return null;
};

// Detect system color scheme using matchMedia (works in all browsers including Chrome)
const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Get initial color scheme for MantineProvider
// IMPORTANT: Never return 'auto' - always resolve to actual 'light' or 'dark'
// This fixes Chrome not properly detecting system dark mode with Mantine's 'auto'
const getInitialColorScheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('stackdraw-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  // For 'auto' or no preference, explicitly detect system theme
  return getSystemColorScheme();
};

// Cache the initial color scheme to avoid re-reading on every render
const cachedInitialColorScheme = getInitialColorScheme();

export const Isoflow = (props: IsoflowProps) => {
  return (
    <MantineProvider
      theme={mantineTheme}
      defaultColorScheme={cachedInitialColorScheme}
    >
      <LocaleProvider locale={props.locale || enUS}>
        <ModelProvider>
          <SceneProvider>
            <UiStateProvider>
              <ColorSchemeSyncer />
              <App {...props} />
            </UiStateProvider>
          </SceneProvider>
        </ModelProvider>
      </LocaleProvider>
    </MantineProvider>
  );
};

const useIsoflow = () => {
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });

  const ModelActions = useModelStore((state) => {
    return state.actions;
  });

  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });

  return {
    Model: ModelActions,
    uiState: uiStateActions,
    rendererEl
  };
};

export { useIsoflow };
export * from 'src/standaloneExports';
export default Isoflow;
