import React, { useMemo, memo } from 'react';
import { Box, Text, Stack } from '@mantine/core';
import {
  PROJECTED_TILE_SIZE,
  UNPROJECTED_TILE_SIZE,
  DEFAULT_LABEL_HEIGHT,
  MARKDOWN_EMPTY_VALUE
} from 'src/config';
import { getTilePosition } from 'src/utils';
import { useIcon } from 'src/hooks/useIcon';
import { ViewItem } from 'src/types';
import { useModelItem } from 'src/hooks/useModelItem';
import { ExpandableLabel } from 'src/components/Label/ExpandableLabel';
import { RichTextEditor } from 'src/components/RichTextEditor/RichTextEditor';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useLayerOpacity } from 'src/hooks/useLayerOpacity';

interface Props {
  node: ViewItem;
  order: number;
}

export const Node = memo(({ node, order }: Props) => {
  const modelItem = useModelItem(node.id);
  const { iconComponent } = useIcon(modelItem?.icon);
  const viewMode = useUiStateStore((state) => state.viewMode);
  const selectedItems = useUiStateStore((state) => state.selectedItems);
  const { opacity, visible } = useLayerOpacity(node.layerId);

  // Check if this node is selected
  const isSelected = useMemo(() => {
    return selectedItems.some(item => item.id === node.id && item.type === 'ITEM');
  }, [selectedItems, node.id]);

  const isTopDown = viewMode === 'TOP_DOWN';

  const position = useMemo(() => {
    if (isTopDown) {
      // In 2D mode, get center of tile
      return getTilePosition({
        tile: node.tile,
        origin: 'CENTER',
        viewMode
      });
    }
    // In isometric mode, use bottom origin
    return getTilePosition({
      tile: node.tile,
      origin: 'BOTTOM',
      viewMode
    });
  }, [node.tile, viewMode, isTopDown]);

  const description = useMemo(() => {
    if (
      !modelItem ||
      modelItem.description === undefined ||
      modelItem.description === MARKDOWN_EMPTY_VALUE
    )
      return null;

    return modelItem.description;
  }, [modelItem?.description]);

  // Don't render if not visible in current layer mode
  if (!visible) {
    return null;
  }

  // If modelItem doesn't exist, don't render the node
  if (!modelItem) {
    return null;
  }

  const tileHeight = isTopDown ? UNPROJECTED_TILE_SIZE : PROJECTED_TILE_SIZE.height;
  const cardSize = UNPROJECTED_TILE_SIZE * 0.9;

  return (
    <Box
      style={{
        position: 'absolute',
        zIndex: order,
        opacity,
        transition: 'opacity 0.2s ease'
      }}
    >
      <Box
        style={{ position: 'absolute', left: position.x, top: position.y }}
      >
        {(modelItem?.name || description) && (
          <Box
            style={{ position: 'absolute', bottom: isTopDown ? cardSize / 2 : tileHeight / 2 }}
          >
            <ExpandableLabel
              maxWidth={250}
              expandDirection="BOTTOM"
              labelHeight={isTopDown ? 60 : (node.labelHeight ?? DEFAULT_LABEL_HEIGHT)}
            >
              <Stack gap="xs">
                {modelItem.name && (
                  <Text fw={600}>{modelItem.name}</Text>
                )}
                {modelItem.description &&
                  modelItem.description !== MARKDOWN_EMPTY_VALUE && (
                    <RichTextEditor value={modelItem.description} readOnly />
                  )}
              </Stack>
            </ExpandableLabel>
          </Box>
        )}
        {iconComponent && (
          <Box
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              // Apply selection highlight filter for isometric mode
              ...(!isTopDown && isSelected ? {
                filter: 'drop-shadow(0 0 4px #228be6) drop-shadow(0 0 8px rgba(34, 139, 230, 0.5))',
                transition: 'filter 0.15s ease'
              } : {})
            }}
          >
            {isTopDown ? (
              <Box
                style={{
                  position: 'absolute',
                  border: isSelected ? '3px solid #228be6' : '2px solid var(--mantine-color-gray-3)',
                  borderRadius: 22,
                  backgroundColor: 'var(--mantine-color-body)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(34, 139, 230, 0.3)' : 'var(--mantine-shadow-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: cardSize,
                  height: cardSize,
                  left: -cardSize / 2,
                  top: -cardSize / 2,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {iconComponent}
              </Box>
            ) : (
              iconComponent
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
});
