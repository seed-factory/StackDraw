import React from 'react';
import { Grid } from '@mantine/core';
import { IconCollectionStateWithIcons, Icon } from 'src/types';
import { IconCollection } from './IconCollection';

interface Props {
  iconCategories: IconCollectionStateWithIcons[];
  onClick?: (icon: Icon) => void;
  onMouseDown?: (icon: Icon) => void;
}

export const Icons = ({ iconCategories, onClick, onMouseDown }: Props) => {
  return (
    <Grid gutter="xs" style={{ paddingTop: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-md)' }}>
      {iconCategories.map((cat) => {
        return (
          <Grid.Col
            span={12}
            key={`icon-collection-${cat.id ?? 'uncategorised'}`}
          >
            <IconCollection
              {...cat}
              onClick={onClick}
              onMouseDown={onMouseDown}
            />
          </Grid.Col>
        );
      })}
    </Grid>
  );
};
