import React, { useMemo } from 'react';
import { Box } from '@mantine/core';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';

const BORDER_WIDTH = 6;

export const SizeIndicator = () => {
  const { getUnprojectedBounds } = useDiagramUtils();
  const diagramBoundingBox = useMemo(() => {
    return getUnprojectedBounds();
  }, [getUnprojectedBounds]);

  return (
    <Box
      style={{
        position: 'absolute',
        border: `${BORDER_WIDTH}px solid red`,
        width: diagramBoundingBox.width,
        height: diagramBoundingBox.height,
        left: diagramBoundingBox.x - BORDER_WIDTH,
        top: diagramBoundingBox.y - BORDER_WIDTH
      }}
    />
  );
};
