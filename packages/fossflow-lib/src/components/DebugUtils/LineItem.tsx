import React from 'react';
import { Text, Box } from '@mantine/core';
import { Value } from './Value';

interface Props {
  title: string;
  value: string | number;
}

export const LineItem = ({ title, value }: Props) => {
  return (
    <Box
      style={{
        display: 'flex',
        width: '100%',
        paddingTop: 'var(--mantine-spacing-xs)',
        paddingBottom: 'var(--mantine-spacing-xs)',
        borderBottom: '1px solid var(--mantine-color-gray-3)'
      }}
    >
      <Box style={{ width: 100 }}>
        <Text>{title}</Text>
      </Box>
      <Box style={{ flexGrow: 1 }}>
        <Value value={value.toString()} />
      </Box>
    </Box>
  );
};
