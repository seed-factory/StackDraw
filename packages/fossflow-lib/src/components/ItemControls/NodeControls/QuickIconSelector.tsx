import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Stack, Text, Divider, TextInput, Alert, Button, Checkbox } from '@mantine/core';
import { IconSearch, IconUpload } from '@tabler/icons-react';
import { Icon } from 'src/types';
import { useModelStore } from 'src/stores/modelStore';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useIconCategories } from 'src/hooks/useIconCategories';
import { IconGrid } from '../IconSelectionControls/IconGrid';
import { Icons } from '../IconSelectionControls/Icons';
import { Section } from '../components/Section';
import { generateId } from 'src/utils';

interface Props {
  onIconSelected: (icon: Icon) => void;
  onClose?: () => void;
  currentIconId?: string;
}

// Store recently used icons in localStorage
const RECENT_ICONS_KEY = 'stackdraw-recent-icons';
const MAX_RECENT_ICONS = 12;

const getRecentIcons = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_ICONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addToRecentIcons = (iconId: string) => {
  const recent = getRecentIcons();
  // Remove if already exists and add to front
  const filtered = recent.filter(id => id !== iconId);
  const updated = [iconId, ...filtered].slice(0, MAX_RECENT_ICONS);
  localStorage.setItem(RECENT_ICONS_KEY, JSON.stringify(updated));
};

// Escape special regex characters
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const QuickIconSelector = ({ onIconSelected, onClose, currentIconId }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [treatAsIsometric, setTreatAsIsometric] = useState(true);
  const [iconScale, setIconScale] = useState(100);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const icons = useModelStore((state) => state.icons);
  const modelActions = useModelStore((state) => state.actions);
  const iconCategoriesState = useUiStateStore((state) => state.iconCategoriesState);
  const uiStateActions = useUiStateStore((state) => state.actions);
  const { iconCategories } = useIconCategories();

  // Get recently used icons
  const recentIconIds = useMemo(() => getRecentIcons(), []);
  const recentIcons = useMemo(() => {
    return recentIconIds
      .map(id => icons.find(icon => icon.id === id))
      .filter(Boolean) as Icon[];
  }, [recentIconIds, icons]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchTerm) return null;

    try {
      // Escape special regex characters to prevent errors
      const escapedSearch = escapeRegex(searchTerm);
      const regex = new RegExp(escapedSearch, 'gi');
      return icons.filter(icon => regex.test(icon.name));
    } catch (e) {
      // If regex still fails somehow, fall back to simple includes
      const lowerSearch = searchTerm.toLowerCase();
      return icons.filter(icon => icon.name.toLowerCase().includes(lowerSearch));
    }
  }, [searchTerm, icons]);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation if we're showing search results
      if (!filteredIcons || filteredIcons.length === 0) return;

      const itemsPerRow = 4; // Adjust based on your grid layout
      const totalItems = filteredIcons.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHoveredIndex(prev =>
            Math.min(prev + itemsPerRow, totalItems - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHoveredIndex(prev =>
            Math.max(prev - itemsPerRow, 0)
          );
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setHoveredIndex(prev =>
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          setHoveredIndex(prev =>
            prev < totalItems - 1 ? prev + 1 : prev
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredIcons[hoveredIndex]) {
            handleIconSelect(filteredIcons[hoveredIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredIcons, hoveredIndex, onClose]);

  const handleIconSelect = useCallback((icon: Icon) => {
    addToRecentIcons(icon.id);
    onIconSelected(icon);
  }, [onIconSelected]);

  const handleIconDoubleClick = useCallback((icon: Icon) => {
    handleIconSelect(icon);
    onClose?.();
  }, [handleIconSelect, onClose]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newIcons: Icon[] = [];
    const existingNames = new Set(icons.map(icon => icon.name.toLowerCase()));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }

      // Generate unique name
      let baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      let finalName = baseName;
      let counter = 1;

      while (existingNames.has(finalName.toLowerCase())) {
        finalName = `${baseName}_${counter}`;
        counter++;
      }

      existingNames.add(finalName.toLowerCase());

      // Load and scale the image
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const originalDataUrl = e.target?.result as string;

          // For SVG files, use as-is since they scale naturally
          if (file.type === 'image/svg+xml') {
            resolve(originalDataUrl);
            return;
          }

          // For raster images, scale them to fit in a square bounding box
          const img = new Image();
          img.onload = () => {
            // Create canvas for scaling
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(originalDataUrl); // Fallback to original
              return;
            }

            // Use a square target size for consistent display
            const TARGET_SIZE = 128;

            // Calculate scaling to fit within square while maintaining aspect ratio
            const baseScale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
            const finalScale = baseScale * (iconScale / 100);
            const scaledWidth = img.width * finalScale;
            const scaledHeight = img.height * finalScale;

            // Set canvas to square size
            canvas.width = TARGET_SIZE;
            canvas.height = TARGET_SIZE;

            // Clear canvas with transparent background
            ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);

            // Calculate position to center the image in the square
            const x = (TARGET_SIZE - scaledWidth) / 2;
            const y = (TARGET_SIZE - scaledHeight) / 2;

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw scaled and centered image
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

            // Convert to data URL (using PNG for transparency)
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = originalDataUrl;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newIcons.push({
        id: generateId(),
        name: finalName,
        url: dataUrl,
        collection: 'imported',
        isIsometric: treatAsIsometric
      });
    }

    if (newIcons.length > 0) {
      // Add new icons to the model
      const updatedIcons = [...icons, ...newIcons];
      modelActions.set({ icons: updatedIcons });

      // Update icon categories to include imported collection
      const hasImported = iconCategoriesState.some(cat => cat.id === 'imported');
      if (!hasImported) {
        uiStateActions.setIconCategoriesState([
          ...iconCategoriesState,
          { id: 'imported', isExpanded: true }
        ]);
      }
    }

    // Reset input
    event.target.value = '';
  }, [icons, modelActions, iconCategoriesState, uiStateActions, treatAsIsometric, iconScale]);

  return (
    <Box>
      <Section style={{ paddingTop: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-md)' }}>
        <Stack gap="md">
          {/* Search Box */}
          <TextInput
            ref={searchInputRef}
            placeholder="Search icons (press Enter to select)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHoveredIndex(0); // Reset hover when searching
            }}
            leftSection={<IconSearch size={16} />}
            size="sm"
            autoFocus
          />

          {/* Recently Used Icons - Show when no search */}
          {!searchTerm && recentIcons.length > 0 && (
            <>
              <Text size="xs" c="dimmed">
                RECENTLY USED
              </Text>
              <IconGrid
                icons={recentIcons}
                onClick={handleIconSelect}
                onDoubleClick={handleIconDoubleClick}
              />
              <Divider />
            </>
          )}
        </Stack>
      </Section>

      {/* Search Results */}
      {searchTerm && filteredIcons && (
        <>
          <Section style={{ paddingTop: 'var(--mantine-spacing-xs)', paddingBottom: 'var(--mantine-spacing-xs)' }}>
            <Text size="xs" c="dimmed">
              SEARCH RESULTS ({filteredIcons.length} icons)
            </Text>
          </Section>
          <Divider />
          {filteredIcons.length > 0 ? (
            <Section>
              <IconGrid
                icons={filteredIcons}
                onClick={handleIconSelect}
                onDoubleClick={handleIconDoubleClick}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
              />
            </Section>
          ) : (
            <Section>
              <Alert color="blue">No icons found matching "{searchTerm}"</Alert>
            </Section>
          )}
        </>
      )}

      {/* Original Icon Libraries - Show when no search */}
      {!searchTerm && (
        <Icons
          iconCategories={iconCategories}
          onClick={handleIconSelect}
          onMouseDown={() => {}} // Not needed for selection
        />
      )}

      {/* Import Icons Section */}
      <Section>
        <Box style={{
          border: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
          borderRadius: 'var(--mantine-radius-sm)',
          padding: 'var(--mantine-spacing-sm)',
          backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))'
        }}>
          <Button
            variant="outline"
            leftSection={<IconUpload size={16} />}
            onClick={handleImportClick}
            fullWidth
          >
            Import Icons
          </Button>
          <Checkbox
            checked={treatAsIsometric}
            onChange={(e) => setTreatAsIsometric(e.currentTarget.checked)}
            size="sm"
            label={
              <Text size="sm">
                Treat as isometric (3D view)
              </Text>
            }
            style={{ marginTop: 'var(--mantine-spacing-xs)', marginLeft: 0 }}
          />
          <Text size="xs" c="dimmed" style={{ display: 'block', marginTop: 'var(--mantine-spacing-xs)' }}>
            Uncheck for flat icons (logos, UI elements)
          </Text>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Section>

      {/* Help Text */}
      <Section style={{ paddingTop: 'var(--mantine-spacing-xs)', paddingBottom: 'var(--mantine-spacing-xs)' }}>
        <Text size="xs" c="dimmed">
          {searchTerm
            ? 'Use arrow keys to navigate - Enter to select - Double-click to select and close'
            : 'Type to search - Click category to expand - Double-click to select and close'
          }
        </Text>
      </Section>
    </Box>
  );
};
