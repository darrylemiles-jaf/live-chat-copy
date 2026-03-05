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
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  BoldOutlined,
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ItalicOutlined,
  LinkOutlined,
  NumberOutlined,
  OrderedListOutlined,
  PlusOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
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
const EMPTY_FORM = { title: '', response: '', is_active: true };

const QuickChats = () => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [viewTarget, setViewTarget] = useState(null);

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

  const handleOpenView = (row) => {
    setViewTarget(row);
  };

  const handleCloseView = () => {
    setViewTarget(null);
  };

  const handleOpenEdit = (row) => {
    setEditTarget(row);
    setForm({ title: row.title, response: row.response, is_active: Boolean(row.is_active) });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!stripHtml(form.response)) { setFormError('Response content is required.'); return; }
    if (form.is_active === undefined) { setFormError('Status is required.'); return; }

    setSaving(true);
    setFormError('');
    const payload = { ...form, is_active: form.is_active ? 1 : 0 };
    try {
      if (editTarget) {
        await updateQuickChat(editTarget.id, payload);
        showSnack('Quick chat updated successfully.', 'info');
      } else {
        await createQuickChat(payload);
        showSnack('Quick chat created successfully.', 'success');
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
      showSnack('Quick chat deleted.', 'warning');
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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These answer cards appear in the chat widget so clients can self-serve before talking to an agent.
      </Typography>

      <ReusableTable
        rows={rows}
        isLoading={loading}
        searchableColumns={['title']}
        noMessage="No quick chats yet."
        settings={{
          otherActionButton: (
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleOpenCreate} size="small">
              New Quick Chat
            </Button>
          )
        }}
        columns={[
          {
            id: 'title',
            label: 'Title',
            align: 'left',
            renderCell: (row) => (
              <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
            )
          },
          {
            id: 'is_active',
            label: 'Status',
            align: 'center',
            renderCell: (row) => (
              <Chip
                label={row.is_active ? 'Active' : 'Inactive'}
                size="small"
                color={row.is_active ? 'success' : 'default'}
                variant={row.is_active ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  ...(row.is_active && { bgcolor: '#2e7d32', color: '#fff' })
                }}
              />
            )
          },
          {
            id: 'created_at',
            label: 'Created',
            align: 'center',
            renderCell: (row) => (
              <Chip label={formatDate(row.created_at)} size="small" variant="outlined" />
            )
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            renderCell: (row) => (
              <Stack direction="row" spacing={0.5} justifyContent="center">
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.lighter' }
                    }}
                    onClick={(e) => { e.stopPropagation(); handleOpenView(row); }}
                  >
                    <EyeOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    sx={{
                      color: 'warning.main',
                      '&:hover': { bgcolor: 'warning.lighter' }
                    }}
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}
                  >
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
                    <DeleteOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
            )
          }
        ]}
      />

      {/* ── View Dialog ── */}
      <Dialog
        open={Boolean(viewTarget)}
        onClose={handleCloseView}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: '90vh',
            overflow: 'hidden',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
            color: 'white',
            pt: { xs: 3, sm: 4 },
            pb: { xs: 2.5, sm: 3 },
            px: { xs: 2, sm: 4 },
            position: 'relative',
            textAlign: 'center'
          }}
        >
          <IconButton
            onClick={handleCloseView}
            size="small"
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16 },
              top: { xs: 8, sm: 16 },
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
            }}
          >
            <CloseOutlined />
          </IconButton>

          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <ThunderboltOutlined style={{ fontSize: '1.75rem', color: 'white' }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.3, px: 4 }}>
            {viewTarget?.title}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
            <Chip
              icon={<NumberOutlined style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }} />}
              label={`ID #${viewTarget?.id}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
            />
            <Chip
              icon={<CalendarOutlined style={{ fontSize: '0.75rem' }} />}
              label={`Created ${viewTarget ? formatDate(viewTarget.created_at) : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
            />
            <Chip
              icon={<CalendarOutlined style={{ fontSize: '0.75rem' }} />}
              label={`Updated ${viewTarget ? formatDate(viewTarget.updated_at) : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
            />
            <Chip
              label={viewTarget?.is_active ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                bgcolor: viewTarget?.is_active ? 'rgba(46,125,50,0.75)' : 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            />
          </Stack>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 0, bgcolor: theme.vars.palette.background.paper, overflowY: 'auto' }}>
          <Box sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2.5, sm: 3 } }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.vars.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '1px',
                display: 'block',
                mb: 1.5
              }}
            >
              Response
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                bgcolor: theme.vars.palette.background.default,
                borderColor: theme.vars.palette.divider,
                '& a': { color: theme.vars.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' },
                '& ul': { paddingLeft: '1.5em', margin: '0.3em 0' },
                '& ol': { paddingLeft: '1.5em', margin: '0.3em 0' },
                '& li': { marginBottom: '0.25em' },
                '& p': { marginTop: 0, marginBottom: '0.6em', lineHeight: 1.75 },
                '& p:last-child': { marginBottom: 0 },
                '& strong': { fontWeight: 700, color: theme.vars.palette.text.primary },
                '& em': { fontStyle: 'italic' },
                '& s': { opacity: 0.6 },
                fontSize: '0.9rem',
                color: theme.vars.palette.text.secondary,
                lineHeight: 1.75,
                minHeight: 80
              }}
              dangerouslySetInnerHTML={{
                __html: viewTarget?.response || `<p style="color:inherit;opacity:0.5">No response content.</p>`
              }}
            />
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: theme.vars.palette.background.paper }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: 'warning.main',
              color: 'warning.main',
              '&:hover': { bgcolor: 'warning.lighter', borderColor: 'warning.main' }
            }}
            startIcon={<EditOutlined />}
            onClick={() => { handleCloseView(); handleOpenEdit(viewTarget); }}
          >
            Edit
          </Button>
          <Button variant="contained" onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={saving}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: '90vh',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
            color: 'white',
            pt: { xs: 2.5, sm: 3 },
            pb: { xs: 2, sm: 2.5 },
            px: { xs: 2, sm: 4 },
            position: 'relative'
          }}
        >
          <IconButton
            onClick={() => !saving && setDialogOpen(false)}
            size="small"
            disabled={saving}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16 },
              top: { xs: 8, sm: 16 },
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)' }
            }}
          >
            <CloseOutlined />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ pr: 5, mb: editTarget ? 0 : 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {editTarget ? <EditOutlined style={{ fontSize: '0.95rem', color: 'white' }} /> : <PlusOutlined style={{ fontSize: '0.95rem', color: 'white' }} />}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              {editTarget ? 'Edit Quick Chat' : 'New Quick Chat'}
            </Typography>
          </Stack>

          {editTarget && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1, mt: 1.5 }}>
              <Chip
                icon={<NumberOutlined style={{ fontSize: '0.7rem' }} />}
                label={`ID #${editTarget.id}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
              />
              <Chip
                icon={<CalendarOutlined style={{ fontSize: '0.7rem' }} />}
                label={`Created ${formatDate(editTarget.created_at)}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
              />
              <Chip
                icon={<CalendarOutlined style={{ fontSize: '0.7rem' }} />}
                label={`Updated ${formatDate(editTarget.updated_at)}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
              />
            </Stack>
          )}
        </Box>

        <DialogContent sx={{ pt: 3, bgcolor: theme.vars.palette.background.paper, overflowY: 'auto' }}>
          <Stack spacing={3}>
            {formError && (
              <Alert severity="error" onClose={() => setFormError('')}>{formError}</Alert>
            )}

            {/* Title field */}
            <Box>
              <Typography
                variant="overline"
                sx={{ color: theme.vars.palette.text.secondary, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', display: 'block', mb: 1 }}
              >
                Title
              </Typography>
              <TextField
                placeholder="e.g. How do I reset my password?"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                fullWidth
                required
                disabled={saving}
                inputProps={{ maxLength: 255 }}
                helperText="The question or topic shown on the card in the widget."
                size="small"
              />
            </Box>

            {/* Response editor */}
            <Box>
              <Typography
                variant="overline"
                sx={{ color: theme.vars.palette.text.secondary, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', display: 'block', mb: 0.5 }}
              >
                Response
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
                Rich text — supports bold, italic, lists and links
              </Typography>
              <QuickChatEditor
                value={form.response}
                onChange={(html) => setForm((f) => ({ ...f, response: html }))}
                placeholder="Write the full answer here. Format text, add bullet points, or insert links."
                disabled={saving}
              />
            </Box>

            {/* Active toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.vars.palette.divider}`,
                bgcolor: theme.vars.palette.background.default
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  When enabled, this quick chat is visible to clients in the widget.
                </Typography>
              </Box>
              <Switch
                checked={Boolean(form.is_active)}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                disabled={saving}
                color="success"
              />
            </Box>
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.vars.palette.background.paper }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
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
          sx={{
            width: '100%',
            boxShadow: 3,
            ...(snack.severity === 'success' && { bgcolor: '#2e7d32 !important', color: '#fff !important' }),
            ...(snack.severity === 'info'    && { bgcolor: '#0288d1 !important', color: '#fff !important' }),
            ...(snack.severity === 'warning' && { bgcolor: '#d32f2f !important', color: '#fff !important' }),
            ...(snack.severity === 'error'   && { bgcolor: '#c62828 !important', color: '#fff !important' }),
            '& .MuiAlert-icon':  { color: '#fff !important' },
            '& .MuiAlert-action': { color: '#fff !important' }
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickChats;