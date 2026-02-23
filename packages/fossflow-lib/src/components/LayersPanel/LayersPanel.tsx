import React, { useMemo, useCallback, useState, memo, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Stack,
  Group,
  Badge,
  ScrollArea,
  ActionIcon,
  Tooltip,
  SegmentedControl
} from '@mantine/core';
import { shallow } from 'zustand/shallow';
import {
  IconPlus,
  IconTrash,
  Icon3dCubeSphere,
  IconLine,
  IconTypography,
  IconSquare,
  IconFolderOpen,
  IconFolder,
  IconUsers,
  IconArrowsSplit,
  IconChevronDown,
  IconStackPush,
  IconChevronUp,
  IconChevronDown as IconArrowDown,
  IconStack2,
  IconLayersOff,
  IconEye,
  IconEyeOff,
  IconDroplet
} from '@tabler/icons-react';
import { UiElement } from 'src/components/UiElement/UiElement';
import { useScene } from 'src/hooks/useScene';
import { useModelStore } from 'src/stores/modelStore';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';
import { ItemReference, ItemGroup, Layer, LayerDisplayMode } from 'src/types';
import { generateId } from 'src/utils';

// Inline editable text component
interface InlineEditTextProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  style?: React.CSSProperties;
}

const InlineEditText = memo(({ value, onSave, isEditing, onStartEdit, onEndEdit, style }: InlineEditTextProps) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(value);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editValue.trim()) {
        onSave(editValue.trim());
      }
      onEndEdit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onEndEdit();
    }
  }, [editValue, onSave, onEndEdit, value]);

  const handleBlur = useCallback(() => {
    if (editValue.trim() && editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    onEndEdit();
  }, [editValue, value, onSave, onEndEdit]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          padding: '0 2px',
          margin: 0,
          border: '1px solid var(--mantine-color-blue-6)',
          borderRadius: 2,
          outline: 'none',
          backgroundColor: 'var(--mantine-color-body)',
          color: 'var(--mantine-color-text)',
          fontSize: 'var(--mantine-font-size-sm)',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          ...style
        }}
      />
    );
  }

  return (
    <Text
      size="sm"
      lineClamp={1}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit();
      }}
      style={{
        flex: 1,
        cursor: 'text',
        ...style
      }}
    >
      {value}
    </Text>
  );
});

InlineEditText.displayName = 'InlineEditText';

type LayerItemType = 'ITEM' | 'CONNECTOR' | 'RECTANGLE' | 'TEXTBOX';

interface LayerItem {
  id: string;
  type: LayerItemType;
  name: string;
  icon?: string;
  groupId?: string;
  layerId?: string;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case 'ITEM':
      return <Icon3dCubeSphere size={16} />;
    case 'CONNECTOR':
      return <IconLine size={16} />;
    case 'RECTANGLE':
      return <IconSquare size={16} />;
    case 'TEXTBOX':
      return <IconTypography size={16} />;
    default:
      return <Icon3dCubeSphere size={16} />;
  }
};

interface LayerItemRowProps {
  item: LayerItem;
  isSelected: boolean;
  onSelect: (item: LayerItem, event: React.MouseEvent) => void;
  onRename?: (item: LayerItem, newName: string) => void;
  indented?: boolean;
}

const LayerItemRow = memo(({ item, isSelected, onSelect, onRename, indented }: LayerItemRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bgColor = isSelected
    ? (isHovered ? 'var(--mantine-color-blue-light-hover)' : 'var(--mantine-color-blue-light)')
    : (isHovered ? 'var(--mantine-color-default-hover)' : 'transparent');

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect(item, e);
  }, [item, onSelect, isEditing]);

  const handleSave = useCallback((newName: string) => {
    if (onRename && newName !== item.name) {
      onRename(item, newName);
    }
  }, [item, onRename]);

  return (
    <Box
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        padding: '6px 8px 6px ' + (indented ? '40px' : '24px'),
        borderRadius: 4,
        backgroundColor: bgColor,
        cursor: isEditing ? 'text' : 'pointer',
        transition: 'background-color 0.15s ease',
        position: 'relative',
        zIndex: 1,
        userSelect: 'none'
      }}
    >
      <Group gap={8}>
        <Box style={{
          color: isSelected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {getItemIcon(item.type)}
        </Box>
        {onRename ? (
          <InlineEditText
            value={item.name}
            onSave={handleSave}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
            onEndEdit={() => setIsEditing(false)}
            style={{
              color: isSelected ? 'var(--mantine-color-blue-light-color)' : 'inherit',
              fontWeight: isSelected ? 500 : 400
            }}
          />
        ) : (
          <Text
            size="sm"
            lineClamp={1}
            style={{
              flex: 1,
              color: isSelected ? 'var(--mantine-color-blue-light-color)' : 'inherit',
              fontWeight: isSelected ? 500 : 400,
              pointerEvents: 'none'
            }}
          >
            {item.name}
          </Text>
        )}
      </Group>
    </Box>
  );
});

LayerItemRow.displayName = 'LayerItemRow';

interface GroupRowProps {
  group: ItemGroup;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (group: ItemGroup, event: React.MouseEvent) => void;
  onToggleExpand: (groupId: string) => void;
  onRename: (groupId: string, newName: string) => void;
}

const GroupRow = memo(({ group, isSelected, isExpanded, onSelect, onToggleExpand, onRename }: GroupRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bgColor = isSelected
    ? (isHovered ? 'var(--mantine-color-blue-light-hover)' : 'var(--mantine-color-blue-light)')
    : (isHovered ? 'var(--mantine-color-default-hover)' : 'transparent');

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect(group, e);
  }, [group, onSelect, isEditing]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleExpand(group.id);
  }, [group.id, onToggleExpand]);

  const handleSave = useCallback((newName: string) => {
    if (newName !== group.name) {
      onRename(group.id, newName);
    }
  }, [group.id, group.name, onRename]);

  return (
    <Box
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        padding: '6px 8px 6px 24px',
        borderRadius: 4,
        backgroundColor: bgColor,
        cursor: isEditing ? 'text' : 'pointer',
        transition: 'background-color 0.15s ease',
        position: 'relative',
        zIndex: 1,
        userSelect: 'none'
      }}
    >
      <Group gap={8}>
        <Box
          onClick={handleToggle}
          style={{
            color: 'var(--mantine-color-dimmed)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.15s ease'
          }}
        >
          <IconChevronDown size={16} />
        </Box>
        <Box style={{
          color: isSelected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {isExpanded ? <IconFolderOpen size={16} /> : <IconFolder size={16} />}
        </Box>
        <InlineEditText
          value={group.name}
          onSave={handleSave}
          isEditing={isEditing}
          onStartEdit={() => setIsEditing(true)}
          onEndEdit={() => setIsEditing(false)}
          style={{
            color: isSelected ? 'var(--mantine-color-blue-light-color)' : 'inherit',
            fontWeight: isSelected ? 500 : 400
          }}
        />
        <Badge size="xs" variant="light" color="gray">
          {group.items.length}
        </Badge>
      </Group>
    </Box>
  );
});

GroupRow.displayName = 'GroupRow';

interface LayerTabProps {
  layer: Layer | null; // null = default layer
  isActive: boolean;
  itemCount: number;
  onSelect: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  canDelete: boolean;
  defaultLabel?: string;
}

const LayerTab = memo(({ layer, isActive, itemCount, onSelect, onDelete, onRename, canDelete, defaultLabel = 'Default' }: LayerTabProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bgColor = isActive
    ? 'var(--mantine-color-blue-light)'
    : (isHovered ? 'var(--mantine-color-default-hover)' : 'transparent');

  const handleClick = useCallback(() => {
    if (!isEditing) {
      onSelect();
    }
  }, [isEditing, onSelect]);

  const handleSave = useCallback((newName: string) => {
    if (onRename && layer && newName !== layer.name) {
      onRename(newName);
    }
  }, [layer, onRename]);

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 4,
        backgroundColor: bgColor,
        cursor: isEditing ? 'text' : 'pointer',
        transition: 'background-color 0.15s ease',
        userSelect: 'none'
      }}
    >
      <IconStack2 size={16} style={{ color: isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)' }} />
      {layer && onRename ? (
        <Box style={{ flex: 1, marginLeft: 8 }}>
          <InlineEditText
            value={layer.name}
            onSave={handleSave}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
            onEndEdit={() => setIsEditing(false)}
            style={{
              color: isActive ? 'var(--mantine-color-blue-light-color)' : 'inherit',
              fontWeight: isActive ? 500 : 400
            }}
          />
        </Box>
      ) : (
        <Text
          size="sm"
          lineClamp={1}
          style={{
            flex: 1,
            color: isActive ? 'var(--mantine-color-blue-light-color)' : 'inherit',
            fontWeight: isActive ? 500 : 400,
            marginLeft: 8
          }}
        >
          {layer ? layer.name : defaultLabel}
        </Text>
      )}
      <Badge size="xs" variant="light" color="gray" style={{ marginLeft: 8 }}>
        {itemCount}
      </Badge>
      {canDelete && onDelete && (
        <ActionIcon
          size="xs"
          variant="subtle"
          color="red"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{ marginLeft: 4 }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      )}
    </Box>
  );
});

LayerTab.displayName = 'LayerTab';

export const LayersPanel = () => {
  const { t } = useTranslation();
  const { currentView, groups, layers, createGroup, updateGroup, deleteGroup, createLayer, updateLayer, deleteLayer, moveItemsToLayer, updateModelItem } = useScene();
  const modelItems = useModelStore((state) => state.items);

  // Combine UI state selectors into one with shallow comparison
  const { selectedItems, currentLayerId, layerDisplayMode, editorMode, uiStateActions } = useUiStateStore(
    (state) => ({
      selectedItems: state.selectedItems,
      currentLayerId: state.currentLayerId,
      layerDisplayMode: state.layerDisplayMode,
      editorMode: state.editorMode,
      uiStateActions: state.actions
    }),
    shallow
  );

  const isReadonly = editorMode === 'EXPLORABLE_READONLY';

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Get selected item IDs for quick lookup
  const selectedItemIds = useMemo(() => {
    return new Set(selectedItems.map(item => item.id));
  }, [selectedItems]);

  // Map item IDs to their group IDs for quick lookup
  const itemToGroupMap = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach(group => {
      group.items.forEach(item => {
        map.set(item.id, group.id);
      });
    });
    return map;
  }, [groups]);

  // Check if all selected items belong to the same group
  const selectedGroupId = useMemo(() => {
    if (selectedItems.length === 0) return null;

    const groupIds = new Set<string>();
    selectedItems.forEach(item => {
      const groupId = itemToGroupMap.get(item.id);
      if (groupId) groupIds.add(groupId);
    });

    if (groupIds.size === 1) {
      return Array.from(groupIds)[0];
    }
    return null;
  }, [selectedItems, itemToGroupMap]);

  const canGroup = useMemo(() => {
    if (selectedItems.length < 2) return false;
    return selectedGroupId === null || selectedItems.some(item => !itemToGroupMap.has(item.id));
  }, [selectedItems, selectedGroupId, itemToGroupMap]);

  const canUngroup = useMemo(() => {
    return selectedGroupId !== null;
  }, [selectedGroupId]);

  // Get all items with their layer info
  const allItemsWithLayers = useMemo(() => {
    if (!currentView) return [];

    const items: LayerItem[] = currentView.items.map((item) => {
      const modelItem = modelItems.find((m) => m.id === item.id);
      return {
        id: item.id,
        type: 'ITEM' as const,
        name: modelItem?.name || 'Unnamed Item',
        icon: modelItem?.icon,
        groupId: itemToGroupMap.get(item.id),
        layerId: item.layerId
      };
    });

    const connectors: LayerItem[] = (currentView.connectors || []).map((connector, index) => ({
      id: connector.id,
      type: 'CONNECTOR' as const,
      name: `Connector ${index + 1}`,
      groupId: itemToGroupMap.get(connector.id),
      layerId: connector.layerId
    }));

    const rectangles: LayerItem[] = (currentView.rectangles || []).map((rect, index) => ({
      id: rect.id,
      type: 'RECTANGLE' as const,
      name: `Rectangle ${index + 1}`,
      groupId: itemToGroupMap.get(rect.id),
      layerId: rect.layerId
    }));

    const textBoxes: LayerItem[] = (currentView.textBoxes || []).map((textBox) => ({
      id: textBox.id,
      type: 'TEXTBOX' as const,
      name: textBox.content || 'Text',
      groupId: itemToGroupMap.get(textBox.id),
      layerId: textBox.layerId
    }));

    return [...items, ...connectors, ...rectangles, ...textBoxes];
  }, [currentView, modelItems, itemToGroupMap]);

  // Get items for current layer
  const currentLayerItems = useMemo(() => {
    if (currentLayerId === null) {
      // Default layer - items without layerId
      return allItemsWithLayers.filter(item => !item.layerId);
    }
    return allItemsWithLayers.filter(item => item.layerId === currentLayerId);
  }, [allItemsWithLayers, currentLayerId]);

  // Count items per layer
  const layerItemCounts = useMemo(() => {
    const counts = new Map<string | null, number>();
    counts.set(null, 0); // Default layer
    layers.forEach(layer => counts.set(layer.id, 0));

    allItemsWithLayers.forEach(item => {
      const layerId = item.layerId || null;
      counts.set(layerId, (counts.get(layerId) || 0) + 1);
    });

    return counts;
  }, [allItemsWithLayers, layers]);

  // Get current layer index for prev/next navigation
  const currentLayerIndex = useMemo(() => {
    if (currentLayerId === null) return -1; // Default layer
    return layers.findIndex(l => l.id === currentLayerId);
  }, [currentLayerId, layers]);

  const canMoveToNextLayer = selectedItems.length > 0 && (currentLayerId === null || currentLayerIndex < layers.length - 1);
  // Can move to prev layer if: we have selection AND we're not on default layer (currentLayerId !== null)
  const canMoveToPrevLayer = selectedItems.length > 0 && currentLayerId !== null;

  // Single click - handles group selection logic
  const handleItemSelect = useCallback((item: LayerItem, event: React.MouseEvent) => {
    const groupId = item.groupId;

    const itemRef: ItemReference = {
      type: item.type,
      id: item.id
    };

    if (event.metaKey || event.ctrlKey) {
      uiStateActions.toggleSelection(itemRef);
      return;
    }

    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        const selectedFromThisGroup = selectedItems.filter(si =>
          group.items.some(gi => gi.id === si.id)
        );
        const isInSingleItemMode = selectedFromThisGroup.length === 1 && selectedItems.length === 1;

        if (isInSingleItemMode) {
          uiStateActions.setSelectedItems([itemRef]);
          return;
        }

        const isWholeGroupSelected = group.items.length === selectedItems.length &&
          group.items.every(gi => selectedItems.some(si => si.id === gi.id));

        if (isWholeGroupSelected) {
          uiStateActions.setSelectedItems([itemRef]);
        } else {
          uiStateActions.setSelectedItems(group.items.map(i => ({
            type: i.type as ItemReference['type'],
            id: i.id
          })));
        }
        return;
      }
    }

    uiStateActions.setSelectedItems([itemRef]);
  }, [groups, selectedItems, uiStateActions]);

  const handleGroupSelect = useCallback((group: ItemGroup, event: React.MouseEvent) => {
    const groupItems = group.items.map(i => ({
      type: i.type as ItemReference['type'],
      id: i.id
    }));

    if (event.metaKey || event.ctrlKey) {
      const allSelected = group.items.every(i => selectedItemIds.has(i.id));
      if (allSelected) {
        const newSelection = selectedItems.filter(item =>
          !group.items.some(gi => gi.id === item.id)
        );
        uiStateActions.setSelectedItems(newSelection);
      } else {
        const existingIds = new Set(selectedItems.map(i => i.id));
        const newItems = groupItems.filter(i => !existingIds.has(i.id));
        uiStateActions.setSelectedItems([...selectedItems, ...newItems]);
      }
    } else {
      uiStateActions.setSelectedItems(groupItems);
    }
  }, [selectedItems, selectedItemIds, uiStateActions]);

  const handleToggleExpand = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (selectedItems.length < 2) return;

    const selectedItemIds = new Set(selectedItems.map(item => item.id));

    // Remove selected items from existing groups
    groups.forEach(group => {
      const remainingItems = group.items.filter(item => !selectedItemIds.has(item.id));
      if (remainingItems.length !== group.items.length) {
        if (remainingItems.length === 0) {
          // Delete empty group
          deleteGroup(group.id);
        } else {
          // Update group with remaining items
          updateGroup(group.id, { items: remainingItems });
        }
      }
    });

    const newGroup: ItemGroup = {
      id: generateId(),
      name: `Group ${groups.length + 1}`,
      items: selectedItems.map(item => ({
        type: item.type as 'ITEM' | 'CONNECTOR' | 'TEXTBOX' | 'RECTANGLE',
        id: item.id
      }))
    };

    createGroup(newGroup);
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
  }, [selectedItems, groups, createGroup, deleteGroup, updateGroup]);

  const handleUngroup = useCallback(() => {
    if (!selectedGroupId) return;
    deleteGroup(selectedGroupId);
  }, [selectedGroupId, deleteGroup]);

  const handleCreateLayer = useCallback(() => {
    const maxOrder = layers.length > 0 ? Math.max(...layers.map(l => l.order)) : -1;
    const newLayer: Layer = {
      id: generateId(),
      name: `Layer ${layers.length + 1}`,
      order: maxOrder + 1
    };
    createLayer(newLayer);
    uiStateActions.setCurrentLayerId(newLayer.id);
  }, [layers, createLayer, uiStateActions]);

  const handleDeleteLayer = useCallback((layerId: string) => {
    deleteLayer(layerId);
    if (currentLayerId === layerId) {
      uiStateActions.setCurrentLayerId(null);
    }
  }, [deleteLayer, currentLayerId, uiStateActions]);

  const handleRenameLayer = useCallback((layerId: string, newName: string) => {
    updateLayer(layerId, { name: newName });
  }, [updateLayer]);

  const handleRenameGroup = useCallback((groupId: string, newName: string) => {
    updateGroup(groupId, { name: newName });
  }, [updateGroup]);

  const handleRenameItem = useCallback((item: LayerItem, newName: string) => {
    if (item.type === 'ITEM') {
      updateModelItem(item.id, { name: newName });
    }
    // For connectors, rectangles, textboxes - they don't have editable names in model
    // Could extend this later if needed
  }, [updateModelItem]);

  const handleMoveToNextLayer = useCallback(() => {
    if (selectedItems.length === 0) return;

    let targetLayerId: string | null;
    if (currentLayerId === null) {
      // From default to first layer
      targetLayerId = layers.length > 0 ? layers[0].id : null;
    } else {
      const nextIndex = currentLayerIndex + 1;
      targetLayerId = nextIndex < layers.length ? layers[nextIndex].id : null;
    }

    if (targetLayerId !== null || currentLayerId !== null) {
      moveItemsToLayer(
        selectedItems.map(item => ({ type: item.type, id: item.id })),
        targetLayerId
      );
    }
  }, [selectedItems, currentLayerId, currentLayerIndex, layers, moveItemsToLayer]);

  const handleMoveToPrevLayer = useCallback(() => {
    if (selectedItems.length === 0 || currentLayerId === null) return;

    // If on first custom layer (index 0), move to default layer (null)
    // Otherwise move to previous layer
    const prevIndex = currentLayerIndex - 1;
    const targetLayerId = prevIndex >= 0 ? layers[prevIndex].id : null;

    moveItemsToLayer(
      selectedItems.map(item => ({ type: item.type, id: item.id })),
      targetLayerId
    );
  }, [selectedItems, currentLayerId, currentLayerIndex, layers, moveItemsToLayer]);

  const handleLayerDisplayModeChange = useCallback((mode: string) => {
    uiStateActions.setLayerDisplayMode(mode as LayerDisplayMode);
  }, [uiStateActions]);

  const handlePanelMouseEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Get ungrouped items for current layer
  const ungroupedItems = useMemo(() => {
    return currentLayerItems.filter(item => !item.groupId);
  }, [currentLayerItems]);

  const ungroupedByType = useMemo(() => ({
    items: ungroupedItems.filter(i => i.type === 'ITEM'),
    connectors: ungroupedItems.filter(i => i.type === 'CONNECTOR'),
    rectangles: ungroupedItems.filter(i => i.type === 'RECTANGLE'),
    textBoxes: ungroupedItems.filter(i => i.type === 'TEXTBOX')
  }), [ungroupedItems]);

  const renderSection = useCallback((
    title: string,
    items: LayerItem[],
    count: number
  ) => {
    if (count === 0) return null;
    return (
      <Box mb={8}>
        <Group gap={8} py={4} px={8}>
          <IconFolderOpen size={16} color="gray" />
          <Text size="xs" c="dimmed" fw={500}>
            {title} ({count})
          </Text>
        </Group>
        <Stack gap={2}>
          {items.map((item) => (
            <LayerItemRow
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              onSelect={handleItemSelect}
              onRename={!isReadonly && item.type === 'ITEM' ? handleRenameItem : undefined}
            />
          ))}
        </Stack>
      </Box>
    );
  }, [selectedItemIds, handleItemSelect, handleRenameItem, isReadonly]);

  // Get groups that belong to current layer (based on first item's layer)
  const currentLayerGroups = useMemo(() => {
    return groups.filter(group => {
      if (group.items.length === 0) return currentLayerId === null;
      const firstItem = allItemsWithLayers.find(i => i.id === group.items[0].id);
      if (!firstItem) return currentLayerId === null;
      return (firstItem.layerId || null) === currentLayerId;
    });
  }, [groups, allItemsWithLayers, currentLayerId]);

  return (
    <UiElement
      style={{
        width: 320,
        height: 550,
        maxHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        onMouseDown={handlePanelMouseEvent}
        onMouseUp={handlePanelMouseEvent}
        onClick={handlePanelMouseEvent}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Layer Display Mode */}
        <Box p="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={500} c="dimmed">{t('layersPanel.displayMode')}</Text>
          </Group>
          <SegmentedControl
            size="xs"
            fullWidth
            value={layerDisplayMode}
            onChange={handleLayerDisplayModeChange}
            color="blue"
            data={[
              {
                value: 'ONLY',
                label: (
                  <Tooltip label={t('layersPanel.showOnlyCurrentLayer')} withArrow>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconEyeOff size={16} />
                    </Box>
                  </Tooltip>
                )
              },
              {
                value: 'OVERLAY',
                label: (
                  <Tooltip label={t('layersPanel.showAllLayers')} withArrow>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconEye size={16} />
                    </Box>
                  </Tooltip>
                )
              },
              {
                value: 'TRANSPARENCY',
                label: (
                  <Tooltip label={t('layersPanel.currentLayer100Others30')} withArrow>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconDroplet size={16} />
                    </Box>
                  </Tooltip>
                )
              }
            ]}
          />
        </Box>

        {/* Layers List */}
        <Box style={{ borderBottom: '1px solid var(--mantine-color-default-border)', maxHeight: 150, overflow: 'auto' }}>
          <Box p="xs">
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={500} c="dimmed">{t('layersPanel.layers')}</Text>
              {!isReadonly && (
                <Tooltip label={t('layersPanel.addLayer')} withArrow>
                  <ActionIcon size="xs" variant="subtle" onClick={handleCreateLayer}>
                    <IconPlus size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
            <Stack gap={2}>
              {/* Default layer */}
              <LayerTab
                layer={null}
                isActive={currentLayerId === null}
                itemCount={layerItemCounts.get(null) || 0}
                onSelect={() => uiStateActions.setCurrentLayerId(null)}
                canDelete={false}
                defaultLabel={t('layersPanel.defaultLayer')}
              />
              {/* Custom layers */}
              {layers.map((layer) => (
                <LayerTab
                  key={layer.id}
                  layer={layer}
                  isActive={currentLayerId === layer.id}
                  itemCount={layerItemCounts.get(layer.id) || 0}
                  onSelect={() => uiStateActions.setCurrentLayerId(layer.id)}
                  onDelete={() => handleDeleteLayer(layer.id)}
                  onRename={!isReadonly ? (newName) => handleRenameLayer(layer.id, newName) : undefined}
                  canDelete={!isReadonly}
                />
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Action buttons row - hidden in readonly mode */}
        {!isReadonly && (
          <Box px="sm" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <Group gap={4}>
              <Tooltip label={t('layersPanel.groupSelected')} position="bottom" withArrow>
                <ActionIcon
                  size="sm"
                  variant="default"
                  disabled={!canGroup}
                  onClick={handleCreateGroup}
                >
                  <IconStackPush size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('layersPanel.ungroup')} position="bottom" withArrow>
                <ActionIcon
                  size="sm"
                  variant="default"
                  disabled={!canUngroup}
                  onClick={handleUngroup}
                >
                  <IconArrowsSplit size={18} />
                </ActionIcon>
              </Tooltip>
              <Box style={{ width: 1, height: 20, backgroundColor: 'var(--mantine-color-default-border)', margin: '0 4px' }} />
              <Tooltip label={t('layersPanel.moveToPreviousLayer')} position="bottom" withArrow>
                <ActionIcon
                  size="sm"
                  variant="default"
                  disabled={!canMoveToPrevLayer}
                  onClick={handleMoveToPrevLayer}
                >
                  <IconChevronUp size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('layersPanel.moveToNextLayer')} position="bottom" withArrow>
                <ActionIcon
                  size="sm"
                  variant="default"
                  disabled={!canMoveToNextLayer}
                  onClick={handleMoveToNextLayer}
                >
                  <IconArrowDown size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
        )}

        {/* Items list with scroll */}
        <ScrollArea style={{ flex: 1 }} type="auto" scrollbarSize={8} offsetScrollbars>
          <Box p="xs">
            {currentLayerItems.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                {t('layersPanel.noItemsOnLayer')}
              </Text>
            ) : (
              <>
                {/* Render groups first */}
                {currentLayerGroups.length > 0 && (
                  <Box mb={8}>
                    <Group gap={8} py={4} px={8}>
                      <IconUsers size={16} color="gray" />
                      <Text size="xs" c="dimmed" fw={500}>
                        {t('layersPanel.groups')} ({currentLayerGroups.length})
                      </Text>
                    </Group>
                    <Stack gap={2}>
                      {currentLayerGroups.map((group) => {
                        const isExpanded = expandedGroups.has(group.id);
                        const isGroupSelected = group.items.every(i => selectedItemIds.has(i.id));

                        return (
                          <Box key={group.id}>
                            <GroupRow
                              group={group}
                              isSelected={isGroupSelected}
                              isExpanded={isExpanded}
                              onSelect={handleGroupSelect}
                              onToggleExpand={handleToggleExpand}
                              onRename={!isReadonly ? handleRenameGroup : () => {}}
                            />
                            {isExpanded && (
                              <Stack gap={1} ml={16}>
                                {group.items.map((groupItem) => {
                                  const item = allItemsWithLayers.find(i => i.id === groupItem.id);
                                  if (!item) return null;
                                  return (
                                    <LayerItemRow
                                      key={item.id}
                                      item={item}
                                      isSelected={selectedItemIds.has(item.id)}
                                      onSelect={handleItemSelect}
                                      onRename={!isReadonly && item.type === 'ITEM' ? handleRenameItem : undefined}
                                      indented
                                    />
                                  );
                                })}
                              </Stack>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* Render ungrouped items by type */}
                {renderSection(t('layersPanel.items'), ungroupedByType.items, ungroupedByType.items.length)}
                {renderSection(t('layersPanel.connectors'), ungroupedByType.connectors, ungroupedByType.connectors.length)}
                {renderSection(t('layersPanel.rectangles'), ungroupedByType.rectangles, ungroupedByType.rectangles.length)}
                {renderSection(t('layersPanel.textItems'), ungroupedByType.textBoxes, ungroupedByType.textBoxes.length)}
              </>
            )}
          </Box>
        </ScrollArea>

        {/* Footer */}
        <Box p="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed">
            {currentLayerItems.length} {t('layersPanel.itemsOnLayer')}
            {selectedItems.length > 0 && ` | ${selectedItems.length} ${t('layersPanel.selected')}`}
          </Text>
        </Box>
      </Box>
    </UiElement>
  );
};
