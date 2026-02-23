import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from 'src/styles/mantineTheme';
import { ModelProvider } from 'src/stores/modelStore';
import { SceneProvider } from 'src/stores/sceneStore';
import { UiStateProvider } from 'src/stores/uiStateStore';
import { DebugUtils } from '../DebugUtils';

describe('DebugUtils', () => {
  const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <MantineProvider theme={mantineTheme}>
        <ModelProvider>
          <SceneProvider>
            <UiStateProvider>{children}</UiStateProvider>
          </SceneProvider>
        </ModelProvider>
      </MantineProvider>
    );
  };

  it('renders without crashing', () => {
    render(
      <Providers>
        <DebugUtils />
      </Providers>
    );
    expect(screen.getByText('Mouse')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <Providers>
        <DebugUtils />
      </Providers>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
