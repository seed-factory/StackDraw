import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box } from '@mantine/core';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { Gradient } from 'src/components/Gradient/Gradient';
import { ExpandButton } from './ExpandButton';
import { Label, Props as LabelProps } from './Label';
import { useUiStateStore } from 'src/stores/uiStateStore';

type Props = Omit<LabelProps, 'maxHeight'> & {
  onToggleExpand?: (isExpanded: boolean) => void;
};

const STANDARD_LABEL_HEIGHT = 80;

export const ExpandableLabel = ({
  children,
  onToggleExpand,
  ...rest
}: Props) => {
  const forceExpandLabels = useUiStateStore((state) => state.expandLabels);
  const editorMode = useUiStateStore((state) => state.editorMode);
  const labelSettings = useUiStateStore((state) => state.labelSettings);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { observe, size: contentSize } = useResizeObserver();

  useEffect(() => {
    if (!contentRef.current) return;

    observe(contentRef.current);
  }, [observe]);

  const effectiveExpanded = useMemo(() => {
    // Only force expand in NON_INTERACTIVE mode (export preview)
    const shouldForceExpand = forceExpandLabels && editorMode === 'NON_INTERACTIVE';
    return shouldForceExpand || isExpanded;
  }, [forceExpandLabels, isExpanded, editorMode]);

  const containerMaxHeight = useMemo(() => {
    return effectiveExpanded ? undefined : STANDARD_LABEL_HEIGHT;
  }, [effectiveExpanded]);

  const isContentTruncated = useMemo(() => {
    return !effectiveExpanded && contentSize.height >= STANDARD_LABEL_HEIGHT - 10;
  }, [effectiveExpanded, contentSize.height]);

  // Determine overflow behavior based on mode
  const overflowBehavior = useMemo(() => {
    if (editorMode === 'NON_INTERACTIVE') {
      // In export mode, no overflow needed - container expands to fit
      return 'visible';
    }
    // In interactive modes, use scroll when expanded, hidden when collapsed
    return effectiveExpanded ? 'scroll' : 'hidden';
  }, [editorMode, effectiveExpanded]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [effectiveExpanded]);

  return (
    <Label
      {...rest}
      maxHeight={containerMaxHeight}
      maxWidth={effectiveExpanded ? rest.maxWidth * 1.5 : rest.maxWidth}
    >
      <Box
        ref={contentRef}
        style={{
          overflowY: overflowBehavior,
          maxHeight: containerMaxHeight,
          paddingBottom: isContentTruncated || isExpanded ? labelSettings.expandButtonPadding : 0
        }}
        // Use className for webkit scrollbar hiding since it can't be done with inline styles
        className="hide-scrollbar"
      >
        {children}

        {isContentTruncated && (
          <Gradient
            style={{
              position: 'absolute',
              width: '100%',
              height: 50,
              bottom: 0,
              left: 0
            }}
          />
        )}
      </Box>

      {editorMode !== 'NON_INTERACTIVE' && ((!isExpanded && isContentTruncated) || isExpanded) && (
        <ExpandButton
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            margin: 4
          }}
          isExpanded={isExpanded}
          onClick={() => {
            setIsExpanded(!isExpanded);
            onToggleExpand?.(!isExpanded);
          }}
        />
      )}
    </Label>
  );
};
