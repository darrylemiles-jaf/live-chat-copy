import React, { useEffect, useMemo } from 'react';
import { Box, Divider, IconButton, Paper, Tooltip, useTheme } from '@mui/material';
import {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const Editor = ({ value = '', onChange, editable = true, minHeight = 200, showToolbar = true, placeholder = 'Write something...' }) => {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || '',
    editable,
    editorProps: {
      attributes: {
        class: 'tiptap'
      }
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (onChange) {
        onChange(editorInstance.getHTML());
      }
    }
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    const nextValue = value || '';
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }
  }, [editor, value]);

  const actions = useMemo(() => {
    if (!editor) return [];

    return [
      {
        label: 'Bold',
        icon: <BoldOutlined />,
        isActive: editor.isActive('bold'),
        isDisabled: !editor.can().chain().focus().toggleBold().run(),
        onClick: () => editor.chain().focus().toggleBold().run()
      },
      {
        label: 'Italic',
        icon: <ItalicOutlined />,
        isActive: editor.isActive('italic'),
        isDisabled: !editor.can().chain().focus().toggleItalic().run(),
        onClick: () => editor.chain().focus().toggleItalic().run()
      },
      {
        label: 'Strikethrough',
        icon: <StrikethroughOutlined />,
        isActive: editor.isActive('strike'),
        isDisabled: !editor.can().chain().focus().toggleStrike().run(),
        onClick: () => editor.chain().focus().toggleStrike().run()
      },
      {
        label: 'Code',
        icon: <CodeOutlined />,
        isActive: editor.isActive('code'),
        isDisabled: !editor.can().chain().focus().toggleCode().run(),
        onClick: () => editor.chain().focus().toggleCode().run()
      },
      {
        label: 'Bullet list',
        icon: <UnorderedListOutlined />,
        isActive: editor.isActive('bulletList'),
        isDisabled: !editor.can().chain().focus().toggleBulletList().run(),
        onClick: () => editor.chain().focus().toggleBulletList().run()
      },
      {
        label: 'Ordered list',
        icon: <OrderedListOutlined />,
        isActive: editor.isActive('orderedList'),
        isDisabled: !editor.can().chain().focus().toggleOrderedList().run(),
        onClick: () => editor.chain().focus().toggleOrderedList().run()
      },
      {
        label: 'Undo',
        icon: <UndoOutlined />,
        isActive: false,
        isDisabled: !editor.can().chain().focus().undo().run(),
        onClick: () => editor.chain().focus().undo().run()
      },
      {
        label: 'Redo',
        icon: <RedoOutlined />,
        isActive: false,
        isDisabled: !editor.can().chain().focus().redo().run(),
        onClick: () => editor.chain().focus().redo().run()
      }
    ];
  }, [editor]);

  return (
    <React.Fragment>
      <Paper
        variant="outlined"
        sx={{
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper
        }}
      >
        {showToolbar && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              p: 1,
              bgcolor: theme.palette.background.default
            }}
          >
            {actions.map((action) => (
              <Tooltip key={action.label} title={action.label} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={action.onClick}
                    disabled={action.isDisabled || !editable}
                    sx={{
                      borderRadius: 1,
                      bgcolor: action.isActive ? theme.palette.action.selected : 'transparent',
                      '&:hover': {
                        bgcolor: action.isActive ? theme.palette.action.selected : theme.palette.action.hover
                      }
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Box>
        )}

        <Divider />

        <Box
          sx={{
            '& .tiptap': {
              minHeight,
              padding: '12px 14px',
              outline: 'none',
              fontSize: theme.typography.body1.fontSize,
              lineHeight: 1.6
            },
            '& .tiptap p': {
              margin: 0,
              marginBottom: '0.75em'
            },
            '& .tiptap p:last-of-type': {
              marginBottom: 0
            },
            '& .tiptap p.is-editor-empty:first-of-type::before': {
              color: theme.palette.text.disabled,
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none'
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </React.Fragment>
  );
};

export default Editor;
