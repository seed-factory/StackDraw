import React, { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mantine/core';
import { shallow } from 'zustand/shallow';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useInteractionManager } from 'src/interaction/useInteractionManager';
import { Grid } from 'src/components/Grid/Grid';
import { Cursor } from 'src/components/Cursor/Cursor';
import { Nodes } from 'src/components/SceneLayers/Nodes/Nodes';
import { Rectangles } from 'src/components/SceneLayers/Rectangles/Rectangles';
import { Connectors } from 'src/components/SceneLayers/Connectors/Connectors';
import { ConnectorLabels } from 'src/components/SceneLayers/ConnectorLabels/ConnectorLabels';
import { TextBoxes } from 'src/components/SceneLayers/TextBoxes/TextBoxes';
import { SizeIndicator } from 'src/components/DebugUtils/SizeIndicator';
import { SceneLayer } from 'src/components/SceneLayer/SceneLayer';
import { TransformControlsManager } from 'src/components/TransformControlsManager/TransformControlsManager';
import { Lasso } from 'src/components/Lasso/Lasso';
import { FreehandLasso } from 'src/components/FreehandLasso/FreehandLasso';
import { useScene } from 'src/hooks/useScene';
import { RendererProps } from 'src/types/rendererProps';
import { useThemedColor, useCustomTheme } from 'src/hooks/useCustomTheme';

export const Renderer = ({ showGrid, backgroundColor }: RendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionsRef = useRef<HTMLDivElement>(null);

  // Combine UI state selectors into one with shallow comparison
  const { enableDebugTools, showCursor, uiStateActions, blueprintMode } = useUiStateStore(
    (state) => ({
      enableDebugTools: state.enableDebugTools,
      showCursor: state.mode.showCursor,
      uiStateActions: state.actions,
      blueprintMode: state.blueprintMode
    }),
    shallow
  );

  const { setInteractionsElement } = useInteractionManager();
  const { items, rectangles, connectors, textBoxes } = useScene();
  const diagramBg = useThemedColor('diagramBg');
  const { customVars, colorScheme } = useCustomTheme();

  useEffect(() => {
    if (!containerRef.current || !interactionsRef.current) return;

    setInteractionsElement(interactionsRef.current);
    uiStateActions.setRendererEl(containerRef.current);
  }, [setInteractionsElement, uiStateActions]);

  const isShowGrid = useMemo(() => {
    return showGrid === undefined || showGrid;
  }, [showGrid]);

  // Use blueprint background if enabled, otherwise use normal background
  const getBlueprintBackground = () => {
    const isDark = colorScheme === 'dark';
    return isDark ? customVars.blueprint.background.dark : customVars.blueprint.background.light;
  };

  const bgColor = blueprintMode
    ? getBlueprintBackground()
    : (backgroundColor === 'transparent' ? 'transparent' : (backgroundColor ?? diagramBg));

  return (
    <Box
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundColor: bgColor
      }}
    >
      <SceneLayer>
        <Rectangles rectangles={rectangles} />
      </SceneLayer>
      <SceneLayer>
        <Lasso />
      </SceneLayer>
      <FreehandLasso />
      <Box
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }}
      >
        {isShowGrid && <Grid />}
      </Box>
      {showCursor && (
        <SceneLayer>
          <Cursor />
        </SceneLayer>
      )}
      <SceneLayer>
        <Connectors connectors={connectors} />
      </SceneLayer>
      <SceneLayer>
        <TextBoxes textBoxes={textBoxes} />
      </SceneLayer>
      <SceneLayer>
        <ConnectorLabels connectors={connectors} />
      </SceneLayer>
      {enableDebugTools && (
        <SceneLayer>
          <SizeIndicator />
        </SceneLayer>
      )}
      {/* Interaction layer: this is where events are detected */}
      <Box
        ref={interactionsRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      />
      <SceneLayer>
        <Nodes nodes={items} />
      </SceneLayer>
      <SceneLayer>
        <TransformControlsManager />
      </SceneLayer>
    </Box>
  );
};
