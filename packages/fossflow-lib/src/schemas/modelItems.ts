import { z } from 'zod';
import { id, constrainedStrings } from './common';

/**
 * ModelItem contains the data definition for a diagram node.
 *
 * Architecture note:
 * - ModelItem.id is shared with ViewItem.id (same value)
 * - ModelItem stores the content (name, description, icon)
 * - ViewItem stores the placement (tile position in a view)
 * - A ModelItem is automatically deleted when no ViewItem references it
 *
 * Relationship: ModelItem 1:N ViewItem (one ModelItem can appear in multiple views)
 * Current limitation: Same ID means one ModelItem per view maximum
 */
export const modelItemSchema = z.object({
  id,
  name: constrainedStrings.name,
  description: constrainedStrings.description.optional(),
  icon: id.optional()
});

export const modelItemsSchema = z.array(modelItemSchema);
