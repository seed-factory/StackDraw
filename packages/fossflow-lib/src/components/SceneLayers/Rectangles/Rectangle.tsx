import React, { memo, useMemo } from 'react';
import { Box } from '@mantine/core';
import { useScene } from 'src/hooks/useScene';
import { IsoTileArea } from 'src/components/IsoTileArea/IsoTileArea';
import { getColorVariant } from 'src/utils';
import { useColor } from 'src/hooks/useColor';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useLayerOpacity } from 'src/hooks/useLayerOpacity';

type Props = ReturnType<typeof useScene>['rectangles'][0];

export const Rectangle = memo(({ id, from, to, color: colorId, customColor, layerId }: Props) => {
  const predefinedColor = useColor(colorId);
  const selectedItems = useUiStateStore((state) => state.selectedItems);
  const { opacity, visible } = useLayerOpacity(layerId);

  // Check if this rectangle is selected
  const isSelected = useMemo(() => {
    return selectedItems.some(item => item.id === id && item.type === 'RECTANGLE');
  }, [selectedItems, id]);

  // Use custom color if provided, otherwise use predefined color
  const color = customColor
    ? { value: customColor }
    : predefinedColor;

  if (!color || !visible) {
    return null;
  }

  return (
    <Box style={{ opacity, transition: 'opacity 0.2s ease' }}>
      <IsoTileArea
        from={from}
        to={to}
        fill={color.value}
        cornerRadius={22}
        stroke={{
          color: isSelected ? '#228be6' : getColorVariant(color.value, 'dark', { grade: 2 }),
          width: isSelected ? 3 : 1
        }}
      />
    </Box>
  );
});
