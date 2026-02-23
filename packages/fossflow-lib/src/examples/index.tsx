import React, { useState, useMemo } from 'react';
import { Box, Select } from '@mantine/core';
import { BasicEditor } from './BasicEditor/BasicEditor';
import { DebugTools } from './DebugTools/DebugTools';
import { ReadonlyMode } from './ReadonlyMode/ReadonlyMode';
import { useCustomTheme } from 'src/hooks/useCustomTheme';

const examples = [
  { name: 'Basic editor', value: '0', component: BasicEditor },
  { name: 'Debug tools', value: '1', component: DebugTools },
  { name: 'Read-only mode', value: '2', component: ReadonlyMode }
];

export const Examples = () => {
  const theme = useCustomTheme();
  const [currentExample, setCurrentExample] = useState('0');

  const Example = useMemo(() => {
    const index = parseInt(currentExample, 10);
    return examples[index].component;
  }, [currentExample]);

  return (
    <Box style={{ width: '100vw', height: '100vh' }}>
      <Box style={{ width: '100%', height: '100%' }}>{Example && <Example />}</Box>
      <Select
        style={{
          position: 'absolute',
          bottom: theme.customVars.appPadding.y,
          right: theme.customVars.appPadding.x,
          backgroundColor: 'var(--mantine-color-body)',
          width: 200
        }}
        value={currentExample}
        onChange={(value) => {
          if (value) setCurrentExample(value);
        }}
        data={examples.map((example) => ({
          value: example.value,
          label: example.name
        }))}
      />
    </Box>
  );
};
