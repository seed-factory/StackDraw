import React, { memo, useRef, CSSProperties } from 'react';
import { useSpring, animated, config, to } from '@react-spring/web';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  children?: React.ReactNode;
  order?: number;
  style?: CSSProperties;
  disableAnimation?: boolean;
}

export const SceneLayer = memo(({
  children,
  order = 0,
  disableAnimation
}: Props) => {
  const isFirstRender = useRef(true);

  const scroll = useUiStateStore((state) => state.scroll);
  const zoom = useUiStateStore((state) => state.zoom);

  // react-spring handles animations outside React's render cycle
  const springProps = useSpring({
    x: scroll.position.x,
    y: scroll.position.y,
    scale: zoom,
    // Instant on first render, smooth otherwise
    immediate: disableAnimation || isFirstRender.current,
    config: {
      ...config.default,
      tension: 300,
      friction: 30,
      precision: 0.001
    },
    onChange: () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
    }
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        zIndex: order,
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        userSelect: 'none',
        willChange: 'transform',
        // Interpolate all values together to keep them in sync
        transform: to(
          [springProps.x, springProps.y, springProps.scale],
          (x, y, scale) => `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        )
      }}
    >
      {children}
    </animated.div>
  );
});
