import { z } from 'zod';
import { id, constrainedStrings, coords } from './common';
import { rectangleSchema } from './rectangle';
import { connectorSchema } from './connector';
import { textBoxSchema } from './textBox';

/**
 * ViewItem represents a placement of a ModelItem on the canvas.
 *
 * Architecture note:
 * - ViewItem.id === ModelItem.id (they share the same ID)
 * - A ModelItem defines the data (name, description, icon)
 * - A ViewItem defines the position (tile) of that ModelItem in a specific view
 * - When a ViewItem is deleted, the corresponding ModelItem is automatically
 *   cleaned up if no other ViewItem references it
 */
export const viewItemSchema = z.object({
  id, // References ModelItem.id
  tile: coords,
  labelHeight: z.number().optional(),
  layerId: z.string().optional() // Reference to layer
});

/**
 * Layer represents a visual layer in the view.
 * Items can be assigned to layers for organization and visibility control.
 */
export const layerSchema = z.object({
  id,
  name: constrainedStrings.name,
  order: z.number() // Lower number = further back
});

/**
 * ItemGroup represents a group of items that can be selected together.
 * Groups enable treating multiple items as a single unit for selection.
 */
export const itemGroupSchema = z.object({
  id,
  name: constrainedStrings.name,
  items: z.array(z.object({
    type: z.enum(['ITEM', 'CONNECTOR', 'TEXTBOX', 'RECTANGLE']),
    id: z.string()
  }))
});

export const viewSchema = z.object({
  id,
  lastUpdated: z.string().datetime().optional(),
  name: constrainedStrings.name,
  description: constrainedStrings.description.optional(),
  items: z.array(viewItemSchema),
  rectangles: z.array(rectangleSchema).optional(),
  connectors: z.array(connectorSchema).optional(),
  textBoxes: z.array(textBoxSchema).optional(),
  groups: z.array(itemGroupSchema).optional(),
  layers: z.array(layerSchema).optional()
});

export const viewsSchema = z.array(viewSchema);
