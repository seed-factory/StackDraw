import type { EditorModeEnum, MainMenuOptions } from './common';
import type { Model } from './model';
import type { RendererProps } from './rendererProps';

export type InitialData = Model & {
  fitToView?: boolean;
  view?: string;
};

export interface LocaleProps {
  common: {
    exampleText: string;
    close: string;
    cancel: string;
    save: string;
    delete: string;
    add: string;
    edit: string;
    options: string;
    name: string;
    description: string;
    color: string;
    size: string;
    position: string;
    enabled: string;
    disabled: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  settingsDialog: {
    title: string;
    tabs: {
      language: string;
      theme: string;
      zoom: string;
      labels: string;
      storage: string;
      info: string;
    };
  };
  toolMenu: {
    undo: string;
    redo: string;
    select: string;
    lassoSelect: string;
    freehandLasso: string;
    pan: string;
    addItem: string;
    rectangle: string;
    connector: string;
    text: string;
    delete: string;
  };
  contextMenu: {
    addNode: string;
    addRectangle: string;
  };
  exportDialog: {
    title: string;
    browserNotice: string;
    browserNoticeText: string;
    options: string;
    showGrid: string;
    expandDescriptions: string;
    cropToContent: string;
    backgroundColor: string;
    transparentBg: string;
    exportQuality: string;
    recrop: string;
    cropApplied: string;
    applyCrop: string;
    clearSelection: string;
    cropHint: string;
    clickDragCrop: string;
    clickDragExport: string;
    downloadSvg: string;
    downloadPng: string;
    exportError: string;
    quality1x: string;
    quality2x: string;
    quality3x: string;
    quality4x: string;
    qualityCustom: string;
  };
  labelSettings: {
    description: string;
    expandButtonPadding: string;
    expandButtonPaddingDesc: string;
    currentValue: string;
  };
  animationsPanel: {
    title: string;
    enable: string;
    speed: string;
  };
  languageSettings: {
    description: string;
  };
  nodeControls: {
    name: string;
    description: string;
    labelHeight: string;
    iconSize: string;
    updateIcon: string;
    settings: string;
  };
  connectorControls: {
    labels: string;
    labelCount: string;
    addLabel: string;
    noLabels: string;
    labelN: string;
    text: string;
    positionPercent: string;
    line1: string;
    line2: string;
    heightOffset: string;
    showDottedLine: string;
    color: string;
    useCustomColor: string;
    width: string;
    lineStyle: string;
    lineType: string;
    doubleLineCircle: string;
    singleLine: string;
    doubleLine: string;
    arrow: string;
    arrowNone: string;
    arrowForward: string;
    arrowBackward: string;
    arrowBoth: string;
  };
  textBoxControls: {
    enterText: string;
    textSize: string;
    alignment: string;
  };
  rectangleControls: {
    color: string;
    useCustomColor: string;
  };
  searchbox: {
    placeholder: string;
  };
  infoSettings: {
    title: string;
    version: string;
    tagline: string;
    developedBy: string;
    team: string;
    repository: string;
    credits: string;
    creditsText: string;
    originalRepo: string;
    builtWith: string;
  };
  mainMenu: {
    undo: string;
    redo: string;
    open: string;
    exportJson: string;
    exportCompactJson: string;
    exportImage: string;
    clearCanvas: string;
    settings: string;
    gitHub: string;
  };
  helpDialog: {
    title: string;
    close: string;
    keyboardShortcuts: string;
    mouseInteractions: string;
    action: string;
    shortcut: string;
    method: string;
    description: string;
    note: string;
    noteContent: string;
    // Keyboard shortcuts
    undoAction: string;
    undoDescription: string;
    redoAction: string;
    redoDescription: string;
    redoAltAction: string;
    redoAltDescription: string;
    helpAction: string;
    helpDescription: string;
    zoomInAction: string;
    zoomInShortcut: string;
    zoomInDescription: string;
    zoomOutAction: string;
    zoomOutShortcut: string;
    zoomOutDescription: string;
    panCanvasAction: string;
    panCanvasShortcut: string;
    panCanvasDescription: string;
    contextMenuAction: string;
    contextMenuShortcut: string;
    contextMenuDescription: string;
    // Mouse interactions
    selectToolAction: string;
    selectToolShortcut: string;
    selectToolDescription: string;
    panToolAction: string;
    panToolShortcut: string;
    panToolDescription: string;
    addItemAction: string;
    addItemShortcut: string;
    addItemDescription: string;
    drawRectangleAction: string;
    drawRectangleShortcut: string;
    drawRectangleDescription: string;
    createConnectorAction: string;
    createConnectorShortcut: string;
    createConnectorDescription: string;
    addTextAction: string;
    addTextShortcut: string;
    addTextDescription: string;
  };
  connectorHintTooltip: {
    tipCreatingConnectors: string;
    tipConnectorTools: string;
    clickInstructionStart: string;
    clickInstructionMiddle: string;
    clickInstructionEnd: string;
    nowClickTarget: string;
    dragStart: string;
    dragEnd: string;
    rerouteStart: string;
    rerouteMiddle: string;
    rerouteEnd: string;
  };
  lassoHintTooltip: {
    tipLasso: string;
    tipFreehandLasso: string;
    lassoDragStart: string;
    lassoDragEnd: string;
    freehandDragStart: string;
    freehandDragMiddle: string;
    freehandDragEnd: string;
    freehandComplete: string;
    moveStart: string;
    moveMiddle: string;
    moveEnd: string;
  };
  importHintTooltip: {
    title: string;
    instructionStart: string;
    menuButton: string;
    instructionMiddle: string;
    openButton: string;
    instructionEnd: string;
  };
  connectorRerouteTooltip: {
    title: string;
    instructionStart: string;
    instructionSelect: string;
    instructionMiddle: string;
    instructionClick: string;
    instructionAnd: string;
    instructionDrag: string;
    instructionEnd: string;
  };
  connectorEmptySpaceTooltip: {
    message: string;
    instruction: string;
  };
  settings: {
    theme: {
      title: string;
      description: string;
      light: string;
      lightDescription: string;
      dark: string;
      darkDescription: string;
      auto: string;
      autoDescription: string;
      blueprintMode: string;
      blueprintModeDescription: string;
      uiStyle: string;
      uiStyleDescription: string;
    };
    zoom: {
      description: string;
      zoomToCursor: string;
      zoomToCursorDesc: string;
    };
    hotkeys: {
      title: string;
      profile: string;
      profileQwerty: string;
      profileSmnrct: string;
      profileNone: string;
      tool: string;
      hotkey: string;
      toolSelect: string;
      toolPan: string;
      toolAddItem: string;
      toolRectangle: string;
      toolConnector: string;
      toolText: string;
      note: string;
    };
    pan: {
      title: string;
      mousePanOptions: string;
      emptyAreaClickPan: string;
      middleClickPan: string;
      rightClickPan: string;
      ctrlClickPan: string;
      altClickPan: string;
      keyboardPanOptions: string;
      arrowKeys: string;
      wasdKeys: string;
      ijklKeys: string;
      keyboardPanSpeed: string;
      note: string;
    };
    connector: {
      title: string;
      connectionMode: string;
      clickMode: string;
      clickModeDesc: string;
      dragMode: string;
      dragModeDesc: string;
      note: string;
    };
    iconPacks: {
      title: string;
      lazyLoading: string;
      lazyLoadingDesc: string;
      availablePacks: string;
      coreIsoflow: string;
      alwaysEnabled: string;
      awsPack: string;
      gcpPack: string;
      azurePack: string;
      kubernetesPack: string;
      loading: string;
      loaded: string;
      notLoaded: string;
      iconCount: string;
      lazyLoadingDisabledNote: string;
      note: string;
    };
    storage: {
      title: string;
      serverStorage: string;
      enabled: string;
      disabled: string;
      path: string;
      gitBackup: string;
      gitBackupDescription: string;
      serverInfo: string;
      sessionInfo: string;
      version: string;
      useServerStorage: string;
      useServerStorageDesc: string;
      envDisabled: string;
      envDisabledNote: string;
    };
  };
  lazyLoadingWelcome: {
    title: string;
    message: string;
    configPath: string;
    configPath2: string;
    canDisable: string;
    signature: string;
  };
  layersPanel: {
    displayMode: string;
    showOnlyCurrentLayer: string;
    showAllLayers: string;
    currentLayer100Others30: string;
    layers: string;
    addLayer: string;
    defaultLayer: string;
    groupSelected: string;
    ungroup: string;
    moveToPreviousLayer: string;
    moveToNextLayer: string;
    groups: string;
    items: string;
    connectors: string;
    rectangles: string;
    textItems: string;
    noItemsOnLayer: string;
    itemsOnLayer: string;
    selected: string;
  };
  // other namespaces can be added here
}

export interface IconPackManagerProps {
  lazyLoadingEnabled: boolean;
  onToggleLazyLoading: (enabled: boolean) => void;
  packInfo: Array<{
    name: string;
    displayName: string;
    loaded: boolean;
    loading: boolean;
    error: string | null;
    iconCount: number;
  }>;
  enabledPacks: string[];
  onTogglePack: (packName: string, enabled: boolean) => void;
}

export interface IsoflowProps {
  initialData?: InitialData;
  mainMenuOptions?: MainMenuOptions;
  onModelUpdated?: (Model: Model) => void;
  width?: number | string;
  height?: number | string;
  enableDebugTools?: boolean;
  editorMode?: keyof typeof EditorModeEnum;
  renderer?: RendererProps;
  locale?: LocaleProps;
  iconPackManager?: IconPackManagerProps;
}
