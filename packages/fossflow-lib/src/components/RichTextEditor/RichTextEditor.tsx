import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import { Box } from '@mantine/core';
import RichTextEditorErrorBoundary from './RichTextEditorErrorBoundary';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number;
  styles?: React.CSSProperties;
}

// Rich text formatting tools
const tools = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  { header: [1, 2, 3, false] },
  { list: 'ordered' },
  { list: 'bullet' },
  'blockquote',
  'code-block'
];

// Formats that Quill should recognize
const formats = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'header',
  'list',
  'bullet',
  'blockquote',
  'code-block'
];

export const RichTextEditor = ({
  value,
  onChange,
  readOnly,
  height = 120,
  styles
}: Props) => {
  const modules = useMemo(() => {
    if (!readOnly)
      return {
        toolbar: tools
      };

    return { toolbar: false };
  }, [readOnly]);

  return (
    <RichTextEditorErrorBoundary>
      <Box
        className="rich-text-editor-container"
        style={{
          // Using CSS variables for styling that would be in sx
          // These styles will be applied via a global CSS class or inline
        }}
      >
        <style>{`
          .rich-text-editor-container .ql-toolbar.ql-snow {
            border: none;
            padding-top: 0;
            padding-left: 0;
            padding-right: 0;
            padding-bottom: var(--mantine-spacing-xs);
          }
          .rich-text-editor-container .ql-toolbar.ql-snow + .ql-container.ql-snow {
            border: 1px solid var(--mantine-color-gray-3);
            border-top: auto;
            border-radius: var(--mantine-radius-sm);
            height: ${height}px;
            color: var(--mantine-color-dimmed);
          }
          .rich-text-editor-container .ql-container.ql-snow {
            ${readOnly ? 'border: none;' : ''}
          }
          .rich-text-editor-container .ql-editor {
            white-space: pre-wrap;
            ${readOnly ? 'padding: 0;' : ''}
            padding: 12px 15px;
          }
          .rich-text-editor-container .ql-tooltip {
            z-index: 1000;
          }
        `}</style>
        <ReactQuill
          theme="snow"
          value={value ?? ''}
          readOnly={readOnly}
          onChange={onChange}
          formats={formats}
          modules={modules}
        />
      </Box>
    </RichTextEditorErrorBoundary>
  );
};
