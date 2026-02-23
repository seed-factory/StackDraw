import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from 'src/styles/mantineTheme';
import { Value } from '../Value';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<MantineProvider theme={mantineTheme}>{ui}</MantineProvider>);
};

describe('Value', () => {
  it('renders value', () => {
    renderWithTheme(<Value value="Test Value" />);
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithTheme(<Value value="Snapshot Value" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
