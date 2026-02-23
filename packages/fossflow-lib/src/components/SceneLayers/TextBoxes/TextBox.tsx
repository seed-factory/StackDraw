import React, { useMemo, memo } from 'react';
import { Box, Text } from '@mantine/core';
import { toPx, CoordsUtils } from 'src/utils';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { useTextBoxProps } from 'src/hooks/useTextBoxProps';
import { useScene } from 'src/hooks/useScene';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useLayerOpacity } from 'src/hooks/useLayerOpacity';

interface Props {
  textBox: ReturnType<typeof useScene>['textBoxes'][0];
}

export const TextBox = memo(({ textBox }: Props) => {
  const { paddingX, fontProps } = useTextBoxProps(textBox);
  const selectedItems = useUiStateStore((state) => state.selectedItems);
  const { opacity, visible } = useLayerOpacity(textBox.layerId);

  // Check if this textbox is selected
  const isSelected = useMemo(() => {
    return selectedItems.some(item => item.id === textBox.id && item.type === 'TEXTBOX');
  }, [selectedItems, textBox.id]);

  const to = useMemo(() => {
    return CoordsUtils.add(textBox.tile, {
      x: textBox.size.width,
      y: 0
    });
  }, [textBox.tile, textBox.size.width]);

  const { css } = useIsoProjection({
    from: textBox.tile,
    to,
    orientation: textBox.orientation
  });

  if (!visible) {
    return null;
  }

  return (
    <Box style={{ ...css, opacity, transition: 'opacity 0.2s ease' }}>
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingLeft: toPx(paddingX),
          paddingRight: toPx(paddingX),
          border: isSelected ? '2px solid #228be6' : 'none',
          borderRadius: 4,
          boxShadow: isSelected ? '0 0 0 2px rgba(34, 139, 230, 0.3)' : 'none'
        }}
      >
        <Text style={{ ...fontProps }}>
          {textBox.content}
        </Text>
      </Box>
    </Box>
  );
});
