import React from 'react';
import { Paper } from '@mantine/core';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const UiElement = ({ children, style }: Props) => {
  return (
    <Paper
      shadow="sm"
      radius="sm"
      p={0}
      withBorder
      style={style}
    >
      {children}
    </Paper>
  );
};
