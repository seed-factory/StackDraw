import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState
} from 'react';
import {
  Modal,
  Box,
  Button,
  Stack,
  Alert,
  Checkbox,
  Text,
  Slider,
  Select,
  Group,
  Image
} from '@mantine/core';
import { useModelStore } from 'src/stores/modelStore';
import {
  exportAsImage,
  exportAsSVG,
  downloadFile as downloadFileUtil,
  base64ToBlob,
  generateGenericFilename,
  modelFromModelStore
} from 'src/utils';
import { ModelStore, Size, Coords } from 'src/types';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Isoflow } from 'src/Isoflow';
import { Loader } from 'src/components/Loader/Loader';
import { customVars } from 'src/styles/mantineTheme';
import { ColorPicker } from 'src/components/ColorSelector/ColorPicker';
import { DOMErrorBoundary } from 'src/components/DOMErrorBoundary';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'src/stores/localeStore';

interface Props {
  quality?: number;
  onClose: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ExportImageDialog = ({ onClose, quality = 1.5 }: Props) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const isExporting = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Coords | null>(null);
  const currentView = useUiStateStore((state) => state.view);
  const [imageData, setImageData] = React.useState<string>();
  const [svgData, setSvgData] = useState<string>();
  const [croppedImageData, setCroppedImageData] = useState<string>();
  const [exportError, setExportError] = useState(false);
  const { getUnprojectedBounds } = useDiagramUtils();
  const uiStateActions = useUiStateStore((state) => state.actions);
  const model = useModelStore((state): Omit<ModelStore, 'actions'> => {
    return modelFromModelStore(state);
  });
  const { colorScheme } = useMantineColorScheme();
  const blueprintMode = useUiStateStore((state) => state.blueprintMode);

  // Crop states
  const [cropToContent, setCropToContent] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isInCropMode, setIsInCropMode] = useState(false);

  // Scale/DPI state
  const [exportScale, setExportScale] = useState<number>(2);
  const [scaleMode, setScaleMode] = useState<'preset' | 'custom'>('preset');

  // DPI presets
  const dpiPresets = [
    { label: t('exportDialog.quality1x'), value: '1' },
    { label: t('exportDialog.quality2x'), value: '2' },
    { label: t('exportDialog.quality3x'), value: '3' },
    { label: t('exportDialog.quality4x'), value: '4' },
    { label: t('exportDialog.qualityCustom'), value: 'custom' }
  ];

  // Use original bounds for the base image
  const bounds = useMemo(() => {
    return getUnprojectedBounds();
  }, [getUnprojectedBounds]);

  const [transparentBackground, setTransparentBackground] = useState(false);

  // Compute the effective color scheme
  const effectiveScheme = useMemo(() => {
    return colorScheme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : colorScheme;
  }, [colorScheme]);

  // Get diagram background color based on current theme and blueprint mode
  const diagramBgColor = useMemo(() => {
    // If blueprint mode is enabled, use blueprint background
    if (blueprintMode) {
      return effectiveScheme === 'dark'
        ? customVars.blueprint.background.dark
        : customVars.blueprint.background.light;
    }

    // Otherwise use regular diagram background
    if (typeof customVars.customPalette.diagramBg === 'string') {
      return customVars.customPalette.diagramBg;
    }
    return effectiveScheme === 'dark'
      ? customVars.customPalette.diagramBg.dark
      : customVars.customPalette.diagramBg.light;
  }, [effectiveScheme, blueprintMode]);

  // Initialize with computed value using lazy initializer
  const [backgroundColor, setBackgroundColor] = useState<string>(() => {
    const scheme = colorScheme === 'auto'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : colorScheme;

    if (blueprintMode) {
      return scheme === 'dark'
        ? customVars.blueprint.background.dark
        : customVars.blueprint.background.light;
    }

    if (typeof customVars.customPalette.diagramBg === 'string') {
      return customVars.customPalette.diagramBg;
    }
    return scheme === 'dark'
      ? customVars.customPalette.diagramBg.dark
      : customVars.customPalette.diagramBg.light;
  });

  // Update backgroundColor when theme or blueprint mode changes
  useEffect(() => {
    if (!transparentBackground) {
      setBackgroundColor(diagramBgColor);
    }
  }, [diagramBgColor, transparentBackground]);

  const exportImage = useCallback(async () => {
    if (!containerRef.current || isExporting.current) {
      return;
    }

    isExporting.current = true;

    const containerSize = {
      width: bounds.width,
      height: bounds.height
    };

    const bgColor = transparentBackground ? 'transparent' : backgroundColor;

    try {
      const [pngData, svgDataResult] = await Promise.all([
        exportAsImage(containerRef.current as HTMLDivElement, containerSize, exportScale, bgColor),
        exportAsSVG(containerRef.current as HTMLDivElement, containerSize, bgColor)
      ]);

      setImageData(pngData);
      setSvgData(svgDataResult);
      isExporting.current = false;
    } catch (err) {
      console.error(err);
      setExportError(true);
      isExporting.current = false;
    }
  }, [bounds, exportScale, transparentBackground, backgroundColor]);

  const cropImage = useCallback((cropArea: CropArea, sourceImage: string) => {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        const displayCanvas = cropCanvasRef.current;
        if (!displayCanvas) {
          reject(new Error('Display canvas not found'));
          return;
        }

        const scaleX = img.width / displayCanvas.width;
        const scaleY = img.height / displayCanvas.height;

        const actualCropArea = {
          x: cropArea.x * scaleX,
          y: cropArea.y * scaleY,
          width: cropArea.width * scaleX,
          height: cropArea.height * scaleY
        };

        canvas.width = actualCropArea.width;
        canvas.height = actualCropArea.height;

        if (ctx) {
          ctx.drawImage(
            img,
            actualCropArea.x, actualCropArea.y, actualCropArea.width, actualCropArea.height,
            0, 0, actualCropArea.width, actualCropArea.height
          );

          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = sourceImage;
    });
  }, []);

  useEffect(() => {
    if (cropToContent && cropArea && imageData && !isInCropMode) {
      cropImage(cropArea, imageData)
        .then(setCroppedImageData)
        .catch(console.error);
    } else if (!cropToContent || !cropArea) {
      setCroppedImageData(undefined);
    }
  }, [cropArea, imageData, cropToContent, cropImage, isInCropMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInCropMode) return;

    e.preventDefault();
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setIsDragging(true);
    setCropArea(null);
  }, [isInCropMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !isInCropMode) return;

    e.preventDefault();
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCropArea: CropArea = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    };

    setCropArea(newCropArea);
  }, [isDragging, dragStart, isInCropMode]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    e.preventDefault();
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    const canvas = cropCanvasRef.current;
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (transparentBackground) {
        const squareSize = 10;
        for (let y = 0; y < canvas.height; y += squareSize) {
          for (let x = 0; x < canvas.width; x += squareSize) {
            ctx.fillStyle = (x / squareSize + y / squareSize) % 2 === 0 ? '#f0f0f0' : 'transparent';
            ctx.fillRect(x, y, squareSize, squareSize);
          }
        }
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (isInCropMode) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (cropArea && cropArea.width > 5 && cropArea.height > 5) {
          ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

          if (cropArea.y > 0) {
            ctx.fillRect(0, 0, canvas.width, cropArea.y);
          }
          if (cropArea.y + cropArea.height < canvas.height) {
            ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - (cropArea.y + cropArea.height));
          }
          if (cropArea.x > 0) {
            ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
          }
          if (cropArea.x + cropArea.width < canvas.width) {
            ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - (cropArea.x + cropArea.width), cropArea.height);
          }

          ctx.restore();

          ctx.strokeStyle = '#228be6';
          ctx.lineWidth = 2;
          ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        }

        if (!cropArea || cropArea.width <= 5 || cropArea.height <= 5) {
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(t('exportDialog.clickDragCrop'), 10, 25);
        }
      }
    };

    img.src = imageData;
  }, [imageData, isInCropMode, cropArea, transparentBackground]);

  const [showGrid, setShowGrid] = useState(false);
  const handleShowGridChange = (checked: boolean) => {
    setShowGrid(checked);
  };

  const [expandLabels, setExpandLabels] = useState(true);
  const handleExpandLabelsChange = (checked: boolean) => {
    setExpandLabels(checked);
  };

  const handleTransparentBackgroundChange = (checked: boolean) => {
    setTransparentBackground(checked);
    if (checked) {
      setBackgroundColor('transparent');
    } else {
      setBackgroundColor(diagramBgColor);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  const handleCropToContentChange = (checked: boolean) => {
    setCropToContent(checked);
    if (checked) {
      setIsInCropMode(true);
      setCropArea(null);
      setCroppedImageData(undefined);
      setIsDragging(false);
      setDragStart(null);
    } else {
      setIsInCropMode(false);
      setCropArea(null);
      setCroppedImageData(undefined);
      setIsDragging(false);
      setDragStart(null);
    }
  };

  const handleRecrop = () => {
    setIsInCropMode(true);
    setCropArea(null);
    setCroppedImageData(undefined);
    setIsDragging(false);
    setDragStart(null);
  };

  const handleAcceptCrop = () => {
    setIsInCropMode(false);
  };

  useEffect(() => {
    if (!cropToContent) {
      setImageData(undefined);
      setSvgData(undefined);
      setExportError(false);
      isExporting.current = false;
      const timer = setTimeout(() => {
        exportImage();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showGrid, backgroundColor, expandLabels, exportImage, cropToContent, exportScale, transparentBackground]);

  useEffect(() => {
    if (!imageData) {
      const timer = setTimeout(() => {
        exportImage();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [exportImage, imageData]);

  const downloadFile = useCallback(() => {
    const dataToDownload = croppedImageData || imageData;
    if (!dataToDownload) return;

    const data = base64ToBlob(
      dataToDownload.replace('data:image/png;base64,', ''),
      'image/png;charset=utf-8'
    );

    downloadFileUtil(data, generateGenericFilename('png'));
  }, [imageData, croppedImageData]);

  const downloadSvgFile = useCallback(async () => {
    if (!svgData) return;

    try {
      const response = await fetch(svgData);
      const blob = await response.blob();
      downloadFileUtil(blob, generateGenericFilename('svg'));
    } catch (error) {
      console.error('SVG download failed:', error);
      setExportError(true);
    }
  }, [svgData]);

  const displayImage = croppedImageData || imageData;

  return (
    <Modal opened onClose={onClose} size="lg" title={t('exportDialog.title')}>
      <Stack gap="md">
        <Alert color="blue">
          <strong>{t('exportDialog.browserNotice')}</strong>
          <br />
          {t('exportDialog.browserNoticeText')}
        </Alert>

        {!imageData && (
          <>
            <Box
              style={{
                position: 'absolute',
                width: 0,
                height: 0,
                overflow: 'hidden'
              }}
            >
              <Box
                ref={containerRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: bounds.width,
                  height: bounds.height
                }}
              >
                <DOMErrorBoundary>
                  <Isoflow
                    key="export-dialog-isoflow"
                    editorMode="NON_INTERACTIVE"
                    initialData={{
                      ...model,
                      fitToView: true,
                      view: currentView
                    }}
                    renderer={{
                      showGrid,
                      backgroundColor,
                      expandLabels
                    }}
                  />
                </DOMErrorBoundary>
              </Box>
            </Box>
            <Box
              style={{
                position: 'relative',
                top: 0,
                left: 0,
                width: 500,
                height: 300,
                backgroundColor: 'var(--mantine-color-body)'
              }}
            >
              <Loader size={2} />
            </Box>
          </>
        )}

        <Stack align="center" gap="md">
          {displayImage && (
            <Box style={{ position: 'relative', maxWidth: '100%' }}>
              {cropToContent && !croppedImageData ? (
                <Box>
                  <canvas
                    ref={cropCanvasRef}
                    width={500}
                    height={300}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      cursor: isInCropMode ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
                      border: isInCropMode ? '2px solid var(--mantine-color-blue-6)' : 'none',
                      userSelect: 'none'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {isInCropMode && (
                    <Box mt="xs">
                      <Text size="xs" c="blue">
                        {t('exportDialog.clickDragExport')}
                      </Text>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  component="img"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    backgroundImage: transparentBackground ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)' : undefined,
                    backgroundSize: transparentBackground ? '20px 20px' : undefined,
                    backgroundPosition: transparentBackground ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined
                  }}
                  src={displayImage}
                  alt="preview"
                />
              )}
            </Box>
          )}

          <Box style={{ width: '100%' }}>
            <Box component="fieldset" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 4, padding: 12 }}>
              <Text size="xs" component="legend" mb="xs">{t('exportDialog.options')}</Text>

              <Stack gap="xs">
                <Checkbox
                  label={t('exportDialog.showGrid')}
                  size="sm"
                  checked={showGrid}
                  onChange={(event) => handleShowGridChange(event.currentTarget.checked)}
                />
                <Checkbox
                  label={t('exportDialog.expandDescriptions')}
                  size="sm"
                  checked={expandLabels}
                  onChange={(event) => handleExpandLabelsChange(event.currentTarget.checked)}
                />
                <Checkbox
                  label={t('exportDialog.cropToContent')}
                  size="sm"
                  checked={cropToContent}
                  onChange={(event) => handleCropToContentChange(event.currentTarget.checked)}
                />
                <Group gap="xs" align="center">
                  <Text size="sm">{t('exportDialog.backgroundColor')}</Text>
                  <ColorPicker
                    value={backgroundColor}
                    onChange={handleBackgroundColorChange}
                  />
                </Group>
                <Checkbox
                  label={t('exportDialog.transparentBg')}
                  size="sm"
                  checked={transparentBackground}
                  onChange={(event) => handleTransparentBackgroundChange(event.currentTarget.checked)}
                />

                <Box mt="sm">
                  <Text size="xs" mb="xs">{t('exportDialog.exportQuality')}</Text>

                  <Select
                    size="sm"
                    value={scaleMode === 'preset' ? String(exportScale) : 'custom'}
                    onChange={(value) => {
                      if (value === 'custom') {
                        setScaleMode('custom');
                      } else if (value) {
                        setScaleMode('preset');
                        setExportScale(Number(value));
                      }
                    }}
                    data={dpiPresets}
                    mb="xs"
                    comboboxProps={{ withinPortal: true }}
                  />

                  {scaleMode === 'custom' && (
                    <Box px="xs">
                      <Text size="xs" mb="xs">
                        Scale: {exportScale.toFixed(1)}x ({(exportScale * 72).toFixed(0)} DPI)
                      </Text>
                      <Slider
                        value={exportScale}
                        onChange={(value) => setExportScale(value)}
                        min={1}
                        max={5}
                        step={0.1}
                        marks={[
                          { value: 1, label: '1x' },
                          { value: 2, label: '2x' },
                          { value: 3, label: '3x' },
                          { value: 4, label: '4x' },
                          { value: 5, label: '5x' }
                        ]}
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>

            {cropToContent && imageData && (
              <Box mt="md">
                {croppedImageData ? (
                  <Group gap="xs">
                    <Button variant="outline" size="sm" onClick={handleRecrop}>
                      {t('exportDialog.recrop')}
                    </Button>
                    <Text size="xs" style={{ alignSelf: 'center' }}>
                      {t('exportDialog.cropApplied')}
                    </Text>
                  </Group>
                ) : cropArea ? (
                  <Group gap="xs">
                    <Button size="sm" onClick={handleAcceptCrop}>
                      {t('exportDialog.applyCrop')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCropArea(null)}>
                      {t('exportDialog.clearSelection')}
                    </Button>
                  </Group>
                ) : isInCropMode ? (
                  <Text size="xs" c="dimmed">
                    {t('exportDialog.cropHint')}
                  </Text>
                ) : null}
              </Box>
            )}
          </Box>

          {displayImage && (
            <Group justify="flex-end" style={{ width: '100%' }}>
              <Button variant="subtle" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="outline"
                onClick={downloadSvgFile}
                disabled={!svgData || (cropToContent && isInCropMode && !croppedImageData)}
              >
                {t('exportDialog.downloadSvg')}
              </Button>
              <Button
                onClick={downloadFile}
                disabled={cropToContent && isInCropMode && !croppedImageData}
              >
                {t('exportDialog.downloadPng')}
              </Button>
            </Group>
          )}
        </Stack>

        {exportError && (
          <Alert color="red">{t('exportDialog.exportError')}</Alert>
        )}
      </Stack>
    </Modal>
  );
};
