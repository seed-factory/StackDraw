import React, { useMemo, memo, useId } from 'react';
import { Box } from '@mantine/core';
import { shallow } from 'zustand/shallow';
import { useCustomTheme } from 'src/hooks/useCustomTheme';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import {
  getAnchorTile,
  getColorVariant,
  getConnectorDirectionIcon,
  getConnectorBackwardIcon
} from 'src/utils';
import { Circle } from 'src/components/Circle/Circle';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { useConnector } from 'src/hooks/useConnector';
import { useScene } from 'src/hooks/useScene';
import { useColor } from 'src/hooks/useColor';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useLayerOpacity } from 'src/hooks/useLayerOpacity';

interface Props {
  connector: ReturnType<typeof useScene>['connectors'][0];
  isSelected?: boolean;
}

export const Connector = memo(({ connector: _connector, isSelected }: Props) => {
  const theme = useCustomTheme();
  const predefinedColor = useColor(_connector.color);
  const { currentView } = useScene();
  const connector = useConnector(_connector.id);

  // Extract only primitive values from animationSettings to prevent re-renders
  // when the object reference changes but values stay the same
  const { isAnimationEnabled, animationSpeed, viewMode } = useUiStateStore(
    (state) => ({
      isAnimationEnabled: state.animationSettings.enabled,
      animationSpeed: state.animationSettings.speed,
      viewMode: state.viewMode
    }),
    shallow
  );
  const isTopDown = viewMode === 'TOP_DOWN';
  const uniqueId = useId();
  const { opacity, visible } = useLayerOpacity(_connector.layerId);

  // Use custom color if provided, otherwise use predefined color
  const color = useMemo(() => {
    if (!connector) return null;
    return connector.customColor
      ? { value: connector.customColor }
      : predefinedColor;
  }, [connector, predefinedColor]);

  const { css, pxSize } = useIsoProjection(
    connector?.path?.rectangle ?? { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }
  );

  const drawOffset = useMemo(() => {
    return {
      x: UNPROJECTED_TILE_SIZE / 2,
      y: UNPROJECTED_TILE_SIZE / 2
    };
  }, []);

  const connectorWidthPx = useMemo(() => {
    if (!connector) return 0;
    return (UNPROJECTED_TILE_SIZE / 100) * connector.width;
  }, [connector]);

  const pathString = useMemo(() => {
    if (!connector) return '';
    return connector.path.tiles.reduce((acc, tile) => {
      return `${acc} ${tile.x * UNPROJECTED_TILE_SIZE + drawOffset.x},${
        tile.y * UNPROJECTED_TILE_SIZE + drawOffset.y
      }`;
    }, '');
  }, [connector, drawOffset]);

  // Create offset paths for double lines
  const offsetPaths = useMemo(() => {
    if (!connector) return null;
    if (!connector.lineType || connector.lineType === 'SINGLE') return null;

    const tiles = connector.path.tiles;
    if (tiles.length < 2) return null;

    const offset = connectorWidthPx * 3; // Larger spacing between double lines for visibility
    const path1Points: string[] = [];
    const path2Points: string[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const curr = tiles[i];
      let dx = 0, dy = 0;

      // Calculate perpendicular offset based on line direction
      if (i > 0 && i < tiles.length - 1) {
        const prev = tiles[i - 1];
        const next = tiles[i + 1];
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;

        // Average direction for smooth corners
        const avgDx = (dx1 + dx2) / 2;
        const avgDy = (dy1 + dy2) / 2;
        const len = Math.sqrt(avgDx * avgDx + avgDy * avgDy) || 1;

        // Perpendicular vector
        dx = -avgDy / len;
        dy = avgDx / len;
      } else if (i === 0 && tiles.length > 1) {
        // Start point
        const next = tiles[1];
        const dirX = next.x - curr.x;
        const dirY = next.y - curr.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dx = -dirY / len;
        dy = dirX / len;
      } else if (i === tiles.length - 1 && tiles.length > 1) {
        // End point
        const prev = tiles[i - 1];
        const dirX = curr.x - prev.x;
        const dirY = curr.y - prev.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dx = -dirY / len;
        dy = dirX / len;
      }

      const x = curr.x * UNPROJECTED_TILE_SIZE + drawOffset.x;
      const y = curr.y * UNPROJECTED_TILE_SIZE + drawOffset.y;

      path1Points.push(`${x + dx * offset},${y + dy * offset}`);
      path2Points.push(`${x - dx * offset},${y - dy * offset}`);
    }

    return {
      path1: path1Points.join(' '),
      path2: path2Points.join(' ')
    };
  }, [connector, connectorWidthPx, drawOffset]);

  const anchorPositions = useMemo(() => {
    if (!isSelected || !connector) return [];

    return connector.anchors.map((anchor) => {
      const position = getAnchorTile(anchor, currentView);

      return {
        id: anchor.id,
        x:
          (connector.path.rectangle.from.x - position.x) *
            UNPROJECTED_TILE_SIZE +
          drawOffset.x,
        y:
          (connector.path.rectangle.from.y - position.y) *
            UNPROJECTED_TILE_SIZE +
          drawOffset.y
      };
    });
  }, [
    currentView,
    connector,
    drawOffset,
    isSelected
  ]);

  // Check if arrows would overlap (path length of 3 tiles)
  const arrowsOverlap = useMemo(() => {
    if (!connector) return false;
    return connector.path.tiles.length === 3;
  }, [connector]);

  const forwardIcon = useMemo(() => {
    if (!connector) return null;
    const icon = getConnectorDirectionIcon(connector.path.tiles);
    if (!icon || !arrowsOverlap) return icon;

    // Offset forward arrow towards the end of the path
    const tiles = connector.path.tiles;
    const lastTile = tiles[tiles.length - 1];
    const iconTile = tiles[tiles.length - 2];
    const dx = (lastTile.x - iconTile.x) * UNPROJECTED_TILE_SIZE * 0.3;
    const dy = (lastTile.y - iconTile.y) * UNPROJECTED_TILE_SIZE * 0.3;

    return {
      ...icon,
      x: icon.x + dx,
      y: icon.y + dy
    };
  }, [connector, arrowsOverlap]);

  const backwardIcon = useMemo(() => {
    if (!connector) return null;
    const icon = getConnectorBackwardIcon(connector.path.tiles);
    if (!icon || !arrowsOverlap) return icon;

    // Offset backward arrow towards the start of the path
    const tiles = connector.path.tiles;
    const firstTile = tiles[0];
    const iconTile = tiles[1];
    const dx = (firstTile.x - iconTile.x) * UNPROJECTED_TILE_SIZE * 0.3;
    const dy = (firstTile.y - iconTile.y) * UNPROJECTED_TILE_SIZE * 0.3;

    return {
      ...icon,
      x: icon.x + dx,
      y: icon.y + dy
    };
  }, [connector, arrowsOverlap]);

  // Support backward compatibility: arrowDirection takes priority over legacy showArrow
  const arrowDirection = useMemo(() => {
    if (!connector) return 'FORWARD';
    if (connector.arrowDirection !== undefined) {
      return connector.arrowDirection;
    }
    // Legacy showArrow fallback
    if (connector.showArrow !== undefined) {
      return connector.showArrow ? 'FORWARD' : 'NONE';
    }
    return 'FORWARD';
  }, [connector]);

  const strokeDashArray = useMemo(() => {
    if (!connector) return 'none';
    switch (connector.style) {
      case 'DASHED':
        return `${connectorWidthPx * 2}, ${connectorWidthPx * 2}`;
      case 'DOTTED':
        return `0, ${connectorWidthPx * 1.8}`;
      case 'SOLID':
      default:
        return 'none';
    }
  }, [connector, connectorWidthPx]);

  // Animation settings - values already extracted from store above

  // Determine animation type based on line style
  const isSolid = !connector || connector.style === 'SOLID' || !connector.style;
  const isLineFlowAnimation = !isSolid; // DASHED/DOTTED use line flow
  const isBallsAnimation = isSolid; // SOLID uses balls

  // Calculate animation duration based on speed (1-10 scale)
  const animationDuration = useMemo(() => {
    // Speed 1 = 5s, Speed 10 = 0.5s
    return 5 - (animationSpeed - 1) * 0.5;
  }, [animationSpeed]);

  const lineType = connector?.lineType || 'SINGLE';
  const isDoubleLine = lineType === 'DOUBLE' || lineType === 'DOUBLE_WITH_CIRCLE';

  // Generate SVG path for animateMotion - forward direction
  const motionPathForward = useMemo(() => {
    if (!connector || connector.path.tiles.length < 2) return '';
    const tiles = connector.path.tiles;
    let path = `M ${tiles[0].x * UNPROJECTED_TILE_SIZE + drawOffset.x},${tiles[0].y * UNPROJECTED_TILE_SIZE + drawOffset.y}`;
    for (let i = 1; i < tiles.length; i++) {
      path += ` L ${tiles[i].x * UNPROJECTED_TILE_SIZE + drawOffset.x},${tiles[i].y * UNPROJECTED_TILE_SIZE + drawOffset.y}`;
    }
    return path;
  }, [connector, drawOffset]);

  // Generate SVG path for animateMotion - backward direction (reversed)
  const motionPathBackward = useMemo(() => {
    if (!connector || connector.path.tiles.length < 2) return '';
    const tiles = [...connector.path.tiles].reverse();
    let path = `M ${tiles[0].x * UNPROJECTED_TILE_SIZE + drawOffset.x},${tiles[0].y * UNPROJECTED_TILE_SIZE + drawOffset.y}`;
    for (let i = 1; i < tiles.length; i++) {
      path += ` L ${tiles[i].x * UNPROJECTED_TILE_SIZE + drawOffset.x},${tiles[i].y * UNPROJECTED_TILE_SIZE + drawOffset.y}`;
    }
    return path;
  }, [connector, drawOffset]);

  // Generate offset motion paths for balls animation (used for both single and double lines)
  const offsetMotionPaths = useMemo(() => {
    if (!connector || connector.path.tiles.length < 2) return null;

    const tiles = connector.path.tiles;
    // Smaller offset for single lines, larger for double lines
    const offset = isDoubleLine ? connectorWidthPx * 3 : connectorWidthPx * 1.5;
    const path1Points: { x: number; y: number }[] = [];
    const path2Points: { x: number; y: number }[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const curr = tiles[i];
      let dx = 0, dy = 0;

      if (i > 0 && i < tiles.length - 1) {
        const prev = tiles[i - 1];
        const next = tiles[i + 1];
        const avgDx = ((curr.x - prev.x) + (next.x - curr.x)) / 2;
        const avgDy = ((curr.y - prev.y) + (next.y - curr.y)) / 2;
        const len = Math.sqrt(avgDx * avgDx + avgDy * avgDy) || 1;
        dx = -avgDy / len;
        dy = avgDx / len;
      } else if (i === 0 && tiles.length > 1) {
        const next = tiles[1];
        const dirX = next.x - curr.x;
        const dirY = next.y - curr.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dx = -dirY / len;
        dy = dirX / len;
      } else if (i === tiles.length - 1 && tiles.length > 1) {
        const prev = tiles[i - 1];
        const dirX = curr.x - prev.x;
        const dirY = curr.y - prev.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dx = -dirY / len;
        dy = dirX / len;
      }

      const x = curr.x * UNPROJECTED_TILE_SIZE + drawOffset.x;
      const y = curr.y * UNPROJECTED_TILE_SIZE + drawOffset.y;

      path1Points.push({ x: x + dx * offset, y: y + dy * offset });
      path2Points.push({ x: x - dx * offset, y: y - dy * offset });
    }

    const toPathString = (points: { x: number; y: number }[]) => {
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x},${points[i].y}`;
      }
      return path;
    };

    const toReversedPathString = (points: { x: number; y: number }[]) => {
      const reversed = [...points].reverse();
      return toPathString(reversed);
    };

    return {
      path1Forward: toPathString(path1Points),
      path1Backward: toReversedPathString(path1Points),
      path2Forward: toPathString(path2Points),
      path2Backward: toReversedPathString(path2Points)
    };
  }, [connector, isDoubleLine, connectorWidthPx, drawOffset]);

  // Calculate stroke dash offset for line flow animation
  const dashOffset = useMemo(() => {
    if (!connector) return 0;
    if (connector.style === 'DASHED') {
      return connectorWidthPx * 4;
    } else if (connector.style === 'DOTTED') {
      return connectorWidthPx * 1.8;
    }
    return 0;
  }, [connector, connectorWidthPx]);

  // Determine which directions to animate based on arrowDirection
  const animateForward = arrowDirection === 'FORWARD' || arrowDirection === 'BOTH';
  const animateBackward = arrowDirection === 'BACKWARD' || arrowDirection === 'BOTH';
  const animateBoth = arrowDirection === 'BOTH';

  // Animation styles for line flow (forward)
  const lineFlowForwardStyle = useMemo(() => {
    if (!isAnimationEnabled || !isLineFlowAnimation) return {};
    return {
      animation: `lineFlowForward-${uniqueId.replace(/:/g, '')} ${animationDuration}s linear infinite`
    };
  }, [isAnimationEnabled, isLineFlowAnimation, animationDuration, uniqueId]);

  // Animation styles for line flow (backward)
  const lineFlowBackwardStyle = useMemo(() => {
    if (!isAnimationEnabled || !isLineFlowAnimation) return {};
    return {
      animation: `lineFlowBackward-${uniqueId.replace(/:/g, '')} ${animationDuration}s linear infinite`
    };
  }, [isAnimationEnabled, isLineFlowAnimation, animationDuration, uniqueId]);

  // Get the appropriate line flow style based on direction
  const getLineFlowStyle = (isFirstLine: boolean) => {
    if (!isAnimationEnabled || !isLineFlowAnimation) return {};

    if (isDoubleLine && animateBoth) {
      // Double line with both directions: line1 forward, line2 backward
      return isFirstLine ? lineFlowForwardStyle : lineFlowBackwardStyle;
    } else if (animateBoth) {
      // Single line with both: we show forward animation (bidirectional visual effect not easy)
      return lineFlowForwardStyle;
    } else if (animateForward) {
      return lineFlowForwardStyle;
    } else if (animateBackward) {
      return lineFlowBackwardStyle;
    }
    return {};
  };

  // Early return after all hooks
  if (!connector || !visible || !color) {
    return null;
  }

  return (
    <Box style={{ ...css, opacity, transition: 'opacity 0.2s ease' }}>
      <Svg
        style={{
          // TODO: The original x coordinates of each tile seems to be calculated wrongly.
          // They are mirrored along the x-axis.  The hack below fixes this, but we should
          // try to fix this issue at the root of the problem (might have further implications).
          transform: 'scale(-1, 1)'
        }}
        viewboxSize={pxSize}
      >
        {/* Animation keyframes for LINE_FLOW */}
        {isAnimationEnabled && isLineFlowAnimation && (
          <defs>
            <style>
              {`
                @keyframes lineFlowForward-${uniqueId.replace(/:/g, '')} {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -${dashOffset}px; }
                }
                @keyframes lineFlowBackward-${uniqueId.replace(/:/g, '')} {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: ${dashOffset}px; }
                }
              `}
            </style>
          </defs>
        )}

        {lineType === 'SINGLE' ? (
          <>
            {/* Selection highlight */}
            {isSelected && (
              <polyline
                points={pathString}
                stroke="#228be6"
                strokeWidth={connectorWidthPx * 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.4}
                fill="none"
              />
            )}
            <polyline
              points={pathString}
              stroke="white"
              strokeWidth={connectorWidthPx * 1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.7}
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(true)}
            />
            <polyline
              points={pathString}
              stroke={isSelected ? '#228be6' : getColorVariant(color.value, 'dark', { grade: 1 })}
              strokeWidth={connectorWidthPx}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(true)}
            />
          </>
        ) : offsetPaths ? (
          <>
            {/* Selection highlight for double lines */}
            {isSelected && (
              <>
                <polyline
                  points={offsetPaths.path1}
                  stroke="#228be6"
                  strokeWidth={connectorWidthPx * 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.4}
                  fill="none"
                />
                <polyline
                  points={offsetPaths.path2}
                  stroke="#228be6"
                  strokeWidth={connectorWidthPx * 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.4}
                  fill="none"
                />
              </>
            )}
            {/* First line of double */}
            <polyline
              points={offsetPaths.path1}
              stroke="white"
              strokeWidth={connectorWidthPx * 1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.7}
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(true)}
            />
            <polyline
              points={offsetPaths.path1}
              stroke={isSelected ? '#228be6' : getColorVariant(color.value, 'dark', { grade: 1 })}
              strokeWidth={connectorWidthPx}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(true)}
            />
            {/* Second line of double */}
            <polyline
              points={offsetPaths.path2}
              stroke="white"
              strokeWidth={connectorWidthPx * 1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.7}
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(false)}
            />
            <polyline
              points={offsetPaths.path2}
              stroke={isSelected ? '#228be6' : getColorVariant(color.value, 'dark', { grade: 1 })}
              strokeWidth={connectorWidthPx}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDashArray}
              fill="none"
              style={getLineFlowStyle(false)}
            />
          </>
        ) : null}

        {/* BALLS animation - moving circles along the path */}
        {isAnimationEnabled && isBallsAnimation && (
          <>
            {/* Single direction (FORWARD or BACKWARD) - balls on center path */}
            {!animateBoth && !isDoubleLine && (
              <>
                {animateForward && motionPathForward && [0, 0.33, 0.66].map((offset, index) => (
                  <circle
                    key={`center-forward-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.8}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={motionPathForward}
                    />
                  </circle>
                ))}
                {animateBackward && motionPathBackward && [0, 0.33, 0.66].map((offset, index) => (
                  <circle
                    key={`center-backward-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.8}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={motionPathBackward}
                    />
                  </circle>
                ))}
              </>
            )}

            {/* BOTH direction for single line - balls on both sides in opposite directions */}
            {animateBoth && !isDoubleLine && offsetMotionPaths && (
              <>
                {[0, 0.5].map((offset, index) => (
                  <circle
                    key={`both-line1-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.6}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={offsetMotionPaths.path1Forward}
                    />
                  </circle>
                ))}
                {[0, 0.5].map((offset, index) => (
                  <circle
                    key={`both-line2-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.6}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={offsetMotionPaths.path2Backward}
                    />
                  </circle>
                ))}
              </>
            )}

            {/* Double line - balls along offset paths */}
            {isDoubleLine && offsetMotionPaths && (
              <>
                {/* Line 1 balls */}
                {[0, 0.5].map((offset, index) => (
                  <circle
                    key={`double-line1-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.7}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={animateBoth
                        ? offsetMotionPaths.path1Forward
                        : (animateForward ? offsetMotionPaths.path1Forward : offsetMotionPaths.path1Backward)}
                    />
                  </circle>
                ))}
                {/* Line 2 balls */}
                {[0, 0.5].map((offset, index) => (
                  <circle
                    key={`double-line2-${index}-${animationDuration}`}
                    r={connectorWidthPx * 0.7}
                    fill={getColorVariant(color.value, 'dark', { grade: 1 })}
                    stroke="white"
                    strokeWidth={2}
                  >
                    <animateMotion
                      dur={`${animationDuration}s`}
                      repeatCount="indefinite"
                      begin={`${-offset * animationDuration}s`}
                      path={animateBoth
                        ? offsetMotionPaths.path2Backward
                        : (animateForward ? offsetMotionPaths.path2Forward : offsetMotionPaths.path2Backward)}
                    />
                  </circle>
                ))}
              </>
            )}
          </>
        )}

        {/* Circle for port-channel representation */}
        {lineType === 'DOUBLE_WITH_CIRCLE' && connector.path.tiles.length >= 2 && (() => {
          const midIndex = Math.floor(connector.path.tiles.length / 2);
          const midTile = connector.path.tiles[midIndex];
          const x = midTile.x * UNPROJECTED_TILE_SIZE + drawOffset.x;
          const y = midTile.y * UNPROJECTED_TILE_SIZE + drawOffset.y;

          // Calculate rotation based on line direction at middle point
          let rotation = 0;
          if (midIndex > 0 && midIndex < connector.path.tiles.length - 1) {
            const prevTile = connector.path.tiles[midIndex - 1];
            const nextTile = connector.path.tiles[midIndex + 1];
            const dx = nextTile.x - prevTile.x;
            const dy = nextTile.y - prevTile.y;
            rotation = Math.atan2(dy, dx) * (180 / Math.PI);
          }

          // In 2D mode use a circle, in isometric mode use ellipse to compensate for projection distortion
          const circleRadius = connectorWidthPx * 5;
          // In isometric view, vertical axis is compressed, so we need taller ellipse to appear as circle
          const circleRadiusX = circleRadius;
          const circleRadiusY = isTopDown ? circleRadius : circleRadius * 1.25;

          return (
            <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
              <ellipse
                cx={0}
                cy={0}
                rx={circleRadiusX}
                ry={circleRadiusY}
                fill="none"
                stroke={getColorVariant(color.value, 'dark', { grade: 1 })}
                strokeWidth={connectorWidthPx * 0.8}
              />
              <ellipse
                cx={0}
                cy={0}
                rx={circleRadiusX}
                ry={circleRadiusY}
                fill="none"
                stroke="white"
                strokeWidth={connectorWidthPx * 1.2}
                strokeOpacity={0.5}
              />
            </g>
          );
        })()}

        {anchorPositions.map((anchor) => {
          return (
            <g key={anchor.id}>
              <Circle
                tile={anchor}
                radius={18}
                fill="white"
                fillOpacity={0.7}
              />
              <Circle
                tile={anchor}
                radius={12}
                stroke="black"
                fill="white"
                strokeWidth={6}
              />
            </g>
          );
        })}

        {/* Forward arrow */}
        {forwardIcon && (arrowDirection === 'FORWARD' || arrowDirection === 'BOTH') && (
          <g transform={`translate(${forwardIcon.x}, ${forwardIcon.y})`}>
            <g transform={`rotate(${forwardIcon.rotation})`}>
              <polygon
                fill="black"
                stroke="white"
                strokeWidth={4}
                points="17.58,17.01 0,-17.01 -17.58,17.01"
              />
            </g>
          </g>
        )}

        {/* Backward arrow */}
        {backwardIcon && (arrowDirection === 'BACKWARD' || arrowDirection === 'BOTH') && (
          <g transform={`translate(${backwardIcon.x}, ${backwardIcon.y})`}>
            <g transform={`rotate(${backwardIcon.rotation})`}>
              <polygon
                fill="black"
                stroke="white"
                strokeWidth={4}
                points="17.58,17.01 0,-17.01 -17.58,17.01"
              />
            </g>
          </g>
        )}
      </Svg>
    </Box>
  );
});
