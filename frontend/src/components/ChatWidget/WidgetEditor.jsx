import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

/* ── Tiny SVG toolbar icons ─────────────────────── */
const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.6 11.8c.9-.6 1.5-1.6 1.5-2.8 0-2.2-1.8-4-4-4H7v14h6.5c2.1 0 3.8-1.7 3.8-3.8 0-1.5-.8-2.8-1.7-3.4zM10 7.5h3c.8 0 1.5.7 1.5 1.5S13.8 10.5 13 10.5h-3v-3zm3.5 9H10v-3h3.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5z" />
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
  </svg>
);

const StrikeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34.87-2.34 1.5 0 .28.04 1.13 1.77 1.69.53.16 1.09.31 1.67.44H3v2h18v-2h-3.85c.29-.26.53-.57.71-.89zm-1.29 7.77c.45 1.49 1.88 2.39 4.05 2.39 1.13 0 2.07-.26 2.67-.74.68-.55.95-1.22.95-1.98l-.04-.44h-3.07c.05.31.03.52-.06.76-.23.55-.88.87-1.8.87-1.48 0-2.1-.71-2.1-1.39 0-.09.01-.17.02-.25H4.51c.02.26.05.52.11.78z" />
  </svg>
);

const BulletListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
  </svg>
);

const OrderedListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
  </svg>
);

/* ── Component ──────────────────────────────────── */
const WidgetEditor = forwardRef(({ onChange, onTyping, placeholder = 'Type a message…', disabled = false, quickReplyText = null }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder })
    ],
    editable: !disabled,
    editorProps: {
      attributes: { class: 'cw-editor-content' },
      handleKeyDown(view, event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          view.dom.closest('form')?.requestSubmit?.();
          return true;
        }
        return false;
      }
    },
    onUpdate({ editor: e }) {
      onChange?.(e.getHTML(), e.isEmpty);
      onTyping?.();
    }
  });

  /* expose helpers to parent via ref */
  useImperativeHandle(ref, () => ({
    clear: () => editor?.commands.clearContent(true),
    focus: () => editor?.commands.focus(),
    isEmpty: () => editor?.isEmpty ?? true,
    setContent: (html) => editor?.commands.setContent(html)
  }));

  /* sync disabled ↔ editable */
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  /* handle quick reply injection */
  useEffect(() => {
    if (!quickReplyText || !editor) return;
    editor.commands.setContent(`<p>${quickReplyText}</p>`);
    editor.commands.focus('end');
    onChange?.(editor.getHTML(), false);
  }, [quickReplyText]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const btn = (label, isActive, onClick) => (
    <button
      key={label}
      type="button"
      title={label}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`cw-editor-tool${isActive ? ' active' : ''}`}
      aria-label={label}
      tabIndex={-1}
    >
      {label === 'Bold' && <BoldIcon />}
      {label === 'Italic' && <ItalicIcon />}
      {label === 'Strike' && <StrikeIcon />}
      {label === 'Bullet list' && <BulletListIcon />}
      {label === 'Ordered list' && <OrderedListIcon />}
    </button>
  );

  return (
    <div className="cw-editor-wrapper">
      <div className="cw-editor-toolbar">
        {btn('Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {btn('Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        {btn('Strike', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run())}
        <span className="cw-editor-sep" />
        {btn('Bullet list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
        {btn('Ordered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
      </div>
      <EditorContent editor={editor} className="cw-editor-body" />
    </div>
  );
});

WidgetEditor.displayName = 'WidgetEditor';
export default WidgetEditor;
