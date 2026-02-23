import React from 'react';
import { Group } from '@mantine/core';
import { useScene } from 'src/hooks/useScene';
import { ColorSwatch } from './ColorSwatch';

interface Props {
  onChange: (color: string) => void;
  activeColor?: string;
}

export const ColorSelector = ({ onChange, activeColor }: Props) => {
  const { colors } = useScene();

  return (
    <Group gap={0}>
      {colors.map((color) => {
        return (
          <ColorSwatch
            key={color.id}
            hex={color.value}
            onClick={() => {
              return onChange(color.id);
            }}
            isActive={activeColor === color.id}
          />
        );
      })}
    </Group>
  );
};
