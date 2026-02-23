import React, { useRef, CSSProperties } from 'react';
import { Box } from '@mantine/core';

const CONNECTOR_DOT_SIZE = 3;

export interface Props {
  labelHeight?: number;
  maxWidth: number;
  maxHeight?: number;
  expandDirection?: 'CENTER' | 'BOTTOM';
  children: React.ReactNode;
  sx?: CSSProperties;
  showLine?: boolean;
}

export const Label = ({
  children,
  maxWidth,
  maxHeight,
  expandDirection = 'CENTER',
  labelHeight = 0,
  sx,
  showLine = true
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      style={{
        position: 'absolute',
        width: maxWidth
      }}
    >
      {labelHeight > 0 && showLine && (
        <Box
          component="svg"
          viewBox={`0 0 ${CONNECTOR_DOT_SIZE} ${labelHeight}`}
          width={CONNECTOR_DOT_SIZE}
          style={{
            position: 'absolute',
            top: -labelHeight,
            left: -CONNECTOR_DOT_SIZE / 2,
            pointerEvents: 'none'
          }}
        >
          <line
            x1={CONNECTOR_DOT_SIZE / 2}
            y1={0}
            x2={CONNECTOR_DOT_SIZE / 2}
            y2={labelHeight}
            strokeDasharray={`0, ${CONNECTOR_DOT_SIZE * 2}`}
            stroke="var(--mantine-color-dark-4)"
            strokeWidth={CONNECTOR_DOT_SIZE}
            strokeLinecap="round"
          />
        </Box>
      )}

      <Box
        ref={contentRef}
        style={{
          position: 'absolute',
          display: 'inline-block',
          backgroundColor: 'var(--mantine-color-body)',
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-md)',
          paddingTop: 'var(--mantine-spacing-xs)',
          paddingBottom: 'var(--mantine-spacing-xs)',
          paddingLeft: 'var(--mantine-spacing-sm)',
          paddingRight: 'var(--mantine-spacing-sm)',
          transformOrigin: 'bottom center',
          transform: `translate(-50%, ${
            expandDirection === 'BOTTOM' ? '-100%' : '-50%'
          })`,
          overflow: 'hidden',
          maxHeight,
          top: -labelHeight,
          ...sx
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
