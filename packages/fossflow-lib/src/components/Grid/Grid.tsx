import React, { memo, useRef, useLayoutEffect, useState } from 'react';
import { useSpring, animated, config, to } from '@react-spring/web';
import { Box, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import gridTileSvg from 'src/assets/grid-tile-bg.svg';
import gridTile2dSvg from 'src/assets/grid-tile-2d.svg';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { PROJECTED_TILE_SIZE, UNPROJECTED_TILE_SIZE } from 'src/config';
import { CustomThemeVars } from 'src/styles/mantineTheme';

export const Grid = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isFirstRender = useRef(true);

  const scroll = useUiStateStore((state) => state.scroll);
  const zoom = useUiStateStore((state) => state.zoom);
  const viewMode = useUiStateStore((state) => state.viewMode);
  const blueprintMode = useUiStateStore((state) => state.blueprintMode);
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const customVars = theme.other as CustomThemeVars;

  // Determine if we're in dark mode (not blueprint mode)
  const isDark = !blueprintMode && (
    colorScheme === 'dark' ||
    (colorScheme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Get container size on mount and resize
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Calculate background properties based on view mode
  const isTopDown = viewMode === 'TOP_DOWN';
  const tileWidth = isTopDown
    ? UNPROJECTED_TILE_SIZE * zoom
    : PROJECTED_TILE_SIZE.width * zoom;
  const tileHeight = isTopDown
    ? UNPROJECTED_TILE_SIZE * zoom
    : PROJECTED_TILE_SIZE.height * zoom;

  // Grid lines should be at tile boundaries, so offset by half tile
  const bgPosX = containerSize.width / 2 + scroll.position.x + tileWidth / 2;
  const bgPosY = isTopDown
    ? containerSize.height / 2 + scroll.position.y + tileHeight / 2
    : containerSize.height / 2 + scroll.position.y;

  // Animate with react-spring
  const springProps = useSpring({
    bgSizeW: tileWidth,
    bgSizeH: isTopDown ? tileHeight : tileHeight * 2,
    bgPosX,
    bgPosY,
    immediate: isFirstRender.current,
    config: {
      ...config.default,
      tension: 300,
      friction: 30
    },
    onChange: () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
    }
  });

  // Calculate grid styles based on mode
  const getGridStyles = () => {
    if (blueprintMode) {
      // Blueprint mode: white grid on blue background
      return {
        filter: 'invert(1) brightness(2)',
        opacity: customVars.blueprint.gridOpacity
      };
    }

    if (isDark) {
      // Dark mode: inverted grid
      return {
        filter: 'invert(1)',
        opacity: 0.3
      };
    }

    // Light mode: normal grid
    return {
      filter: 'none',
      opacity: 1
    };
  };

  const gridStyles = getGridStyles();

  return (
    <Box
      ref={containerRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <animated.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `url("${isTopDown ? gridTile2dSvg : gridTileSvg}")`,
          backgroundRepeat: 'repeat',
          willChange: 'background-position, background-size',
          filter: gridStyles.filter,
          opacity: gridStyles.opacity,
          // Interpolate all values together to keep them in sync
          backgroundSize: to(
            [springProps.bgSizeW, springProps.bgSizeH],
            (w, h) => `${w}px ${h}px`
          ),
          backgroundPosition: to(
            [springProps.bgPosX, springProps.bgPosY],
            (x, y) => `${x}px ${y}px`
          )
        }}
      />
    </Box>
  );
});
