import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from 'src/styles/mantineTheme';
import { LineItem } from '../LineItem';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<MantineProvider theme={mantineTheme}>{ui}</MantineProvider>);
};

describe('LineItem', () => {
  it('renders title and value', () => {
    renderWithTheme(<LineItem title="Test Title" value="Test Value" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithTheme(
      <LineItem title="Snapshot Title" value="Snapshot Value" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
