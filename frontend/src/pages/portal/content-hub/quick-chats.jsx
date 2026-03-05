import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  BoldOutlined,
  DeleteOutlined,
  EditOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PlusOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import PageHead from '../../../components/PageHead';
import MainCard from '../../../components/MainCard';
import {
  getQuickChats,
  createQuickChat,
  updateQuickChat,
  deleteQuickChat
} from '../../../api/quickChatsApi';

/* ─── Inline Rich-Text Editor with Link support ─────────────────────────── */
const QuickChatEditor = ({ value, onChange, placeholder = 'Write the answer here…', disabled = false }) => {
  const theme = useTheme();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      })
    ],
    content: value || '',
    editable: !disabled,
    editorProps: { attributes: { class: 'qc-tiptap' } },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    }
  });

  /* sync external value changes (when editing an existing item) */
  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href || '';
    setLinkUrl(existing);
    setLinkDialogOpen(true);
    setTimeout(() => linkInputRef.current?.focus(), 80);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  if (!editor) return null;

  const toolBtn = (label, icon, isActive, isDisabled, onClick) => (
    <Tooltip key={label} title={label} arrow>
      <span>
        <IconButton
          size="small"
          onMouseDown={(e) => { e.preventDefault(); onClick(); }}
          disabled={isDisabled || disabled}
          sx={{
            borderRadius: 1,
            p: '5px',
            bgcolor: isActive ? theme.vars.palette.action.selected : 'transparent',
            '&:hover': {
              bgcolor: isActive
                ? theme.vars.palette.action.selected
                : theme.vars.palette.action.hover
            }
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <>
      <Paper variant="outlined" sx={{ borderColor: theme.vars.palette.divider }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            p: 0.75,
            bgcolor: theme.vars.palette.background.default,
            borderBottom: `1px solid ${theme.vars.palette.divider}`
          }}
        >
          {toolBtn('Bold', <BoldOutlined />, editor.isActive('bold'), !editor.can().toggleBold(), () => editor.chain().focus().toggleBold().run())}
          {toolBtn('Italic', <ItalicOutlined />, editor.isActive('italic'), !editor.can().toggleItalic(), () => editor.chain().focus().toggleItalic().run())}
          {toolBtn('Strikethrough', <StrikethroughOutlined />, editor.isActive('strike'), !editor.can().toggleStrike(), () => editor.chain().focus().toggleStrike().run())}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {toolBtn('Bullet list', <UnorderedListOutlined />, editor.isActive('bulletList'), false, () => editor.chain().focus().toggleBulletList().run())}
          {toolBtn('Ordered list', <OrderedListOutlined />, editor.isActive('orderedList'), false, () => editor.chain().focus().toggleOrderedList().run())}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {toolBtn('Add / edit link', <LinkOutlined />, editor.isActive('link'), false, openLinkDialog)}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {toolBtn('Undo', <UndoOutlined />, false, !editor.can().undo(), () => editor.chain().focus().undo().run())}
          {toolBtn('Redo', <RedoOutlined />, false, !editor.can().redo(), () => editor.chain().focus().redo().run())}
        </Box>

        {/* Editor body */}
        <Box
          sx={{
            '& .qc-tiptap': {
              minHeight: 200,
              padding: '12px 14px',
              outline: 'none',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              cursor: disabled ? 'not-allowed' : 'text'
            },
            '& .qc-tiptap p': { margin: 0, marginBottom: '0.6em' },
            '& .qc-tiptap p:last-child': { marginBottom: 0 },
            '& .qc-tiptap a': {
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              cursor: 'pointer'
            },
            '& .qc-tiptap ul, & .qc-tiptap ol': { paddingLeft: '1.4em', margin: '0.4em 0' },
            '& .qc-tiptap p.is-editor-empty:first-of-type::before': {
              color: theme.vars.palette.text.disabled,
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

      {/* Link dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert link</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={linkInputRef}
            autoFocus
            label="URL"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } }}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          {editor.isActive('link') && (
            <Button
              color="error"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setLinkDialogOpen(false);
              }}
            >
              Remove link
            </Button>
          )}
          <Button variant="contained" onClick={applyLink}>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const EMPTY_FORM = { title: '', response: '' };

const QuickChats = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  const fetchQuickChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuickChats();
      setRows(data.data || []);
    } catch {
      showSnack('Failed to load quick chats.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuickChats(); }, [fetchQuickChats]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditTarget(row);
    setForm({ title: row.title, response: row.response });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!stripHtml(form.response)) { setFormError('Response content is required.'); return; }

    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        await updateQuickChat(editTarget.id, form);
        showSnack('Quick chat updated successfully.');
      } else {
        await createQuickChat(form);
        showSnack('Quick chat created successfully.');
      }
      setDialogOpen(false);
      fetchQuickChats();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuickChat(deleteTarget.id);
      showSnack('Quick chat deleted.');
      setDeleteTarget(null);
      fetchQuickChats();
    } catch {
      showSnack('Failed to delete. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHead title="Quick Chats" description="Manage quick answer cards shown in the chat widget" />

      <MainCard
        title="Quick Chats"
        secondary={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleOpenCreate} size="small">
            New Quick Chat
          </Button>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These answer cards appear in the chat widget so clients can self-serve before talking to an agent.
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '32%' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Response Preview</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '130px' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '100px' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">No quick chats yet.</Typography>
                      <Button size="small" startIcon={<PlusOutlined />} onClick={handleOpenCreate}>
                        Create your first one
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const preview = stripHtml(row.response);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}
                        >
                          {preview.length > 120 ? `${preview.slice(0, 120)}…` : preview || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={formatDate(row.created_at)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={saving}
      >
        <DialogTitle>{editTarget ? 'Edit Quick Chat' : 'New Quick Chat'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {formError && (
              <Alert severity="error" onClose={() => setFormError('')}>{formError}</Alert>
            )}
            <TextField
              label="Title"
              placeholder="e.g. How do I reset my password?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              required
              disabled={saving}
              inputProps={{ maxLength: 255 }}
              helperText="The question or topic shown on the card in the widget."
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Response{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  (rich text — supports bold, italic, lists, and links)
                </Typography>
              </Typography>
              <QuickChatEditor
                value={form.response}
                onChange={(html) => setForm((f) => ({ ...f, response: html }))}
                placeholder="Write the full answer here. Format text, add bullet points, or insert links."
                disabled={saving}
              />
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Quick Chat?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickChats;