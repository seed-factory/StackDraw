import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Slider, Box, TextInput } from '@mantine/core';
import { ModelItem, ViewItem } from 'src/types';
import { RichTextEditor } from 'src/components/RichTextEditor/RichTextEditor';
import { useModelItem } from 'src/hooks/useModelItem';
import { useModelStore } from 'src/stores/modelStore';
import { useTranslation } from 'src/stores/localeStore';
import { DeleteButton } from '../../components/DeleteButton';
import { Section } from '../../components/Section';

export type NodeUpdates = {
  model: Partial<ModelItem>;
  view: Partial<ViewItem>;
};

interface Props {
  node: ViewItem;
  onModelItemUpdated: (updates: Partial<ModelItem>) => void;
  onViewItemUpdated: (updates: Partial<ViewItem>) => void;
  onDeleted: () => void;
}

export const NodeSettings = ({
  node,
  onModelItemUpdated,
  onViewItemUpdated,
  onDeleted
}: Props) => {
  const { t } = useTranslation();
  const modelItem = useModelItem(node.id);
  const modelActions = useModelStore((state) => state.actions);
  const icons = useModelStore((state) => state.icons);

  // Local state for smooth slider interaction
  const currentIcon = icons.find(icon => icon.id === modelItem?.icon);
  const [localScale, setLocalScale] = useState(currentIcon?.scale || 1);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update local scale when icon changes
  useEffect(() => {
    setLocalScale(currentIcon?.scale || 1);
  }, [currentIcon?.scale]);

  // Debounced update to store
  const updateIconScale = useCallback((scale: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const updatedIcons = icons.map(icon =>
        icon.id === modelItem?.icon
          ? { ...icon, scale }
          : icon
      );
      modelActions.set({ icons: updatedIcons });
    }, 100); // 100ms debounce
  }, [icons, modelItem?.icon, modelActions]);

  // Handle slider change with local state + debounced store update
  const handleScaleChange = useCallback((newScale: number) => {
    setLocalScale(newScale); // Immediate UI update
    updateIconScale(newScale); // Debounced store update
  }, [updateIconScale]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!modelItem) {
    return null;
  }

  return (
    <>
      <Section title={t('nodeControls.name')}>
        <TextInput
          value={modelItem.name}
          onChange={(e) => {
            const text = e.target.value as string;
            if (modelItem.name !== text) onModelItemUpdated({ name: text });
          }}
        />
      </Section>
      <Section title={t('nodeControls.description')}>
        <RichTextEditor
          value={modelItem.description}
          onChange={(text) => {
            if (modelItem.description !== text)
              onModelItemUpdated({ description: text });
          }}
        />
      </Section>
      {modelItem.name && (
        <Section title={t('nodeControls.labelHeight')}>
          <Slider
            marks={[
              { value: 60 },
              { value: 80 },
              { value: 100 },
              { value: 120 },
              { value: 140 },
              { value: 160 },
              { value: 180 },
              { value: 200 },
              { value: 220 },
              { value: 240 },
              { value: 260 },
              { value: 280 }
            ]}
            step={20}
            min={60}
            max={280}
            value={node.labelHeight}
            onChange={(newHeight) => {
              const labelHeight = newHeight as number;
              onViewItemUpdated({ labelHeight });
            }}
          />
        </Section>
      )}

      <Section title={t('nodeControls.iconSize')}>
        <Slider
          marks={[
            { value: 0.3 },
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
            { value: 2.5 }
          ]}
          step={0.1}
          min={0.3}
          max={2.5}
          value={localScale}
          onChange={handleScaleChange}
        />
      </Section>
      <Section>
        <Box>
          <DeleteButton onClick={onDeleted} />
        </Box>
      </Section>
    </>
  );
};
