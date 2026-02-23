import React, { memo, useMemo } from 'react';
import { ViewItem } from 'src/types';
import { Node } from './Node/Node';

interface Props {
  nodes: ViewItem[];
}

export const Nodes = memo(({ nodes }: Props) => {
  // Memoize the reversed array to avoid creating new array every render
  const reversedNodes = useMemo(() => {
    return [...nodes].reverse();
  }, [nodes]);

  return (
    <>
      {reversedNodes.map((node) => (
        <Node key={node.id} order={-node.tile.x - node.tile.y} node={node} />
      ))}
    </>
  );
});
