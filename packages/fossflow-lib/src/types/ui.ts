import { Coords, EditorModeEnum, MainMenuOptions } from './common';
import { Icon } from './model';
import { ItemReference } from './scene';
import { HotkeyProfile } from 'src/config/hotkeys';
import { PanSettings } from 'src/config/panSettings';
import { ZoomSettings } from 'src/config/zoomSettings';
import { LabelSettings } from 'src/config/labelSettings';
import { IconPackManagerProps } from './isoflowProps';

interface AddItemControls {
  type: 'ADD_ITEM';
}

export type ItemControls = ItemReference | AddItemControls;

export interface Mouse {
  position: {
    screen: Coords;
    tile: Coords;
  };
  mousedown: {
    screen: Coords;
    tile: Coords;
  } | null;
  delta: {
    screen: Coords;
    tile: Coords;
  } | null;
}

// Mode types
export interface InteractionsDisabled {
  type: 'INTERACTIONS_DISABLED';
  showCursor: boolean;
}

export interface CursorMode {
  type: 'CURSOR';
  showCursor: boolean;
  mousedownItem: ItemReference | null;
}

export interface DragItemsMode {
  type: 'DRAG_ITEMS';
  showCursor: boolean;
  items: ItemReference[];
  isInitialMovement: Boolean;
}

export interface PanMode {
  type: 'PAN';
  showCursor: boolean;
}

export interface PlaceIconMode {
  type: 'PLACE_ICON';
  showCursor: boolean;
  id: string | null;
}

export interface ConnectorMode {
  type: 'CONNECTOR';
  showCursor: boolean;
  id: string | null;
  // For click-based connection mode
  startAnchor?: {
    tile?: Coords;
    itemId?: string;
  };
  isConnecting?: boolean;
}

export interface DrawRectangleMode {
  type: 'RECTANGLE.DRAW';
  showCursor: boolean;
  id: string | null;
}

export const AnchorPositionOptions = {
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  TOP_RIGHT: 'TOP_RIGHT',
  TOP_LEFT: 'TOP_LEFT'
} as const;

export type AnchorPosition = keyof typeof AnchorPositionOptions;

export interface TransformRectangleMode {
  type: 'RECTANGLE.TRANSFORM';
  showCursor: boolean;
  id: string;
  selectedAnchor: AnchorPosition | null;
}

export interface TextBoxMode {
  type: 'TEXTBOX';
  showCursor: boolean;
  id: string | null;
}

export interface LassoMode {
  type: 'LASSO';
  showCursor: boolean;
  selection: {
    startTile: Coords;
    endTile: Coords;
    items: ItemReference[];
  } | null;
  isDragging: boolean;
}

export interface FreehandLassoMode {
  type: 'FREEHAND_LASSO';
  showCursor: boolean;
  path: Coords[]; // Screen coordinates of the drawn path
  selection: {
    pathTiles: Coords[]; // Tile coordinates of the path points
    items: ItemReference[];
  } | null;
  isDragging: boolean;
}

export interface DeleteMode {
  type: 'DELETE';
  showCursor: boolean;
}

export type Mode =
  | InteractionsDisabled
  | CursorMode
  | PanMode
  | PlaceIconMode
  | ConnectorMode
  | DrawRectangleMode
  | TransformRectangleMode
  | DragItemsMode
  | TextBoxMode
  | LassoMode
  | FreehandLassoMode
  | DeleteMode;
// End mode types

export interface Scroll {
  position: Coords;
  offset: Coords;
}

export interface IconCollectionState {
  id?: string;
  isExpanded: boolean;
}

export type IconCollectionStateWithIcons = IconCollectionState & {
  icons: Icon[];
};

export const DialogTypeEnum = {
  EXPORT_IMAGE: 'EXPORT_IMAGE',
  HELP: 'HELP',
  SETTINGS: 'SETTINGS'
} as const;

export interface ContextMenu {
  type: 'ITEM' | 'EMPTY';
  item?: ItemReference;
  tile: Coords;
}


export type ConnectorInteractionMode = 'click' | 'drag';

export const ViewModeEnum = {
  ISOMETRIC: 'ISOMETRIC',
  TOP_DOWN: 'TOP_DOWN'
} as const;

export type ViewMode = keyof typeof ViewModeEnum;

// Animation settings
export interface AnimationSettings {
  enabled: boolean;
  speed: number; // 1-10 scale
}

// Layer display modes
export const LayerDisplayModeEnum = {
  ONLY: 'ONLY',           // Show only current layer
  OVERLAY: 'OVERLAY',     // Show all layers at 100%
  TRANSPARENCY: 'TRANSPARENCY' // Current layer 100%, others 30%
} as const;

export type LayerDisplayMode = keyof typeof LayerDisplayModeEnum;

// Color scheme options
export const ColorSchemeEnum = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

export type ColorScheme = 'light' | 'dark' | 'auto';

// Blueprint mode - just a boolean toggle
export type BlueprintMode = boolean;

export interface UiState {
  view: string;
  mainMenuOptions: MainMenuOptions;
  editorMode: keyof typeof EditorModeEnum;
  iconCategoriesState: IconCollectionState[];
  mode: Mode;
  dialog: keyof typeof DialogTypeEnum | null;
  isMainMenuOpen: boolean;
  itemControls: ItemControls | null;
  contextMenu: ContextMenu | null;
  zoom: number;
  scroll: Scroll;
  mouse: Mouse;
  rendererEl: HTMLDivElement | null;
  enableDebugTools: boolean;
  hotkeyProfile: HotkeyProfile;
  panSettings: PanSettings;
  zoomSettings: ZoomSettings;
  labelSettings: LabelSettings;
  connectorInteractionMode: ConnectorInteractionMode;
  expandLabels: boolean;
  iconPackManager: IconPackManagerProps | null;
  language: string;
  viewMode: ViewMode;
  animationsPanel: boolean;
  layersPanel: boolean;
  animationSettings: AnimationSettings;
  selectedItems: ItemReference[];
  currentLayerId: string | null; // Currently active layer (null = default/all)
  layerDisplayMode: LayerDisplayMode; // How to display layers
  colorScheme: ColorScheme; // UI color scheme (light/dark/auto)
  blueprintMode: BlueprintMode; // Blueprint mode enabled/disabled
}

export interface UiStateActions {
  setView: (view: string) => void;
  setMainMenuOptions: (options: MainMenuOptions) => void;
  setEditorMode: (mode: keyof typeof EditorModeEnum) => void;
  setIconCategoriesState: (iconCategoriesState: IconCollectionState[]) => void;
  resetUiState: () => void;
  setMode: (mode: Mode) => void;
  incrementZoom: () => void;
  decrementZoom: () => void;
  setIsMainMenuOpen: (isOpen: boolean) => void;
  setDialog: (dialog: keyof typeof DialogTypeEnum | null) => void;
  setZoom: (zoom: number) => void;
  setScroll: (scroll: Scroll) => void;
  setItemControls: (itemControls: ItemControls | null, options?: { keepLayersPanel?: boolean }) => void;
  setContextMenu: (contextMenu: ContextMenu | null) => void;
  setMouse: (mouse: Mouse) => void;
  setRendererEl: (el: HTMLDivElement) => void;
  setEnableDebugTools: (enabled: boolean) => void;
  setHotkeyProfile: (profile: HotkeyProfile) => void;
  setPanSettings: (settings: PanSettings) => void;
  setZoomSettings: (settings: ZoomSettings) => void;
  setLabelSettings: (settings: LabelSettings) => void;
  setConnectorInteractionMode: (mode: ConnectorInteractionMode) => void;
  setExpandLabels: (expand: boolean) => void;
  setIconPackManager: (iconPackManager: IconPackManagerProps | null) => void;
  setLanguage: (language: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  toggleViewMode: () => void;
  setAnimationsPanel: (open: boolean) => void;
  toggleAnimationsPanel: () => void;
  setAnimationSettings: (settings: Partial<AnimationSettings>) => void;
  setLayersPanel: (open: boolean) => void;
  toggleLayersPanel: () => void;
  // Selection management
  setSelectedItems: (items: ItemReference[]) => void;
  addToSelection: (item: ItemReference) => void;
  removeFromSelection: (itemId: string) => void;
  toggleSelection: (item: ItemReference) => void;
  clearSelection: () => void;
  // Layer management
  setCurrentLayerId: (layerId: string | null) => void;
  setLayerDisplayMode: (mode: LayerDisplayMode) => void;
  // Color scheme
  setColorScheme: (scheme: ColorScheme) => void;
  // Blueprint mode
  setBlueprintMode: (enabled: boolean) => void;
  toggleBlueprintMode: () => void;
}

export type UiStateStore = UiState & {
  actions: UiStateActions;
};
