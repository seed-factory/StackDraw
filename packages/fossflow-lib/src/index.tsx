// This is an entry point for running the app in dev mode.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Examples } from './examples';
import { mantineTheme } from './styles/mantineTheme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MantineProvider theme={mantineTheme}>
      <style>{`body { margin: 0; }`}</style>
      <Examples />
    </MantineProvider>
  </React.StrictMode>
);
