import React from 'react';
import { Box, Text } from '@mantine/core';

interface Props {
  value: string;
}

export const Value = ({ value }: Props) => {
  return (
    <Box
      style={{
        display: 'inline-block',
        backgroundColor: 'var(--mantine-color-gray-3)',
        wordWrap: 'break-word',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4,
        border: '1px solid var(--mantine-color-gray-4)',
        borderRadius: 4,
        maxWidth: 200
      }}
    >
      <Text size="xs">{value}</Text>
    </Box>
  );
};
