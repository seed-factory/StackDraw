// This is an entry point for the Docker image build.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Box } from '@mantine/core';
import '@mantine/core/styles.css';
import Isoflow, { INITIAL_DATA } from 'src/Isoflow';
import { icons, colors } from './examples/initialData';
import { mantineTheme } from './styles/mantineTheme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MantineProvider theme={mantineTheme}>
      <style>{`body { margin: 0; }`}</style>
      <Box style={{ width: '100vw', height: '100vh' }}>
        <Isoflow initialData={{ ...INITIAL_DATA, icons, colors }} />
      </Box>
    </MantineProvider>
  </React.StrictMode>
);
