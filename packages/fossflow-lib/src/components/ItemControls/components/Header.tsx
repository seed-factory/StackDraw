import React from 'react';
import { Text, Box, Grid } from '@mantine/core';
import { Section } from './Section';

interface Props {
  title: string;
}

export const Header = ({ title }: Props) => {
  return (
    <Section style={{ paddingTop: 'var(--mantine-spacing-lg)', paddingBottom: 'var(--mantine-spacing-lg)' }}>
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Box style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Text size="sm" c="dimmed">
              {title}
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Section>
  );
};
