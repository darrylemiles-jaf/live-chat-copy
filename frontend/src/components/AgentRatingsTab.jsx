import React from 'react';
import { Box, Typography, LinearProgress, Skeleton, Divider } from '@mui/material';

/* ── Reusable star row ─────────────────────────────────────────── */
export const Stars = ({ value, size = '1.1rem', color = '#f59e0b' }) => (
  <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Box
        key={s}
        component="span"
        sx={{ fontSize: size, color: s <= Math.round(value) ? color : '#d1d5db', lineHeight: 1 }}
      >
        &#9733;
      </Box>
    ))}
  </Box>
);

/* ── Single bar row in the breakdown ──────────────────────────── */
const BarRow = ({ star, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ width: 18, textAlign: 'right', fontWeight: 600, flexShrink: 0 }}>
        {star}
      </Typography>
      <Box component="span" sx={{ fontSize: '0.75rem', color, flexShrink: 0 }}>&#9733;</Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          flex: 1, height: 7, borderRadius: 4, bgcolor: '#f1f5f9',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ width: 30, textAlign: 'right', flexShrink: 0 }}>
        {count}
      </Typography>
    </Box>
  );
};

/* ── Main tab panel ────────────────────────────────────────────── */
const AgentRatingsTab = ({ ratingData, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const stats = ratingData?.stats;
  const reviews = ratingData?.ratings || [];
  const avg = parseFloat(stats?.average_rating) || 0;
  const total = parseInt(stats?.total_ratings) || 0;

  const starColor = avg >= 4.5 ? '#f59e0b' : avg >= 3.5 ? '#f59e0b' : avg >= 2.5 ? '#f97316' : '#ef4444';
  const label = avg >= 4.5 ? 'Excellent' : avg >= 3.5 ? 'Great' : avg >= 2.5 ? 'Good' : avg >= 1.5 ? 'Fair' : 'Poor';

  if (total === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography sx={{ fontSize: '2rem', lineHeight: 1, mb: 1 }}>&#9733;</Typography>
        <Typography variant="body2" color="text.disabled">
          No ratings yet. Ratings appear after clients rate ended chats.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Summary hero ── */}
      <Box
        sx={{
          display: 'flex', gap: 3, alignItems: 'center',
          p: 2, borderRadius: 2,
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a'
        }}
      >
        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
          <Typography variant="h2" fontWeight={800} sx={{ color: starColor, lineHeight: 1 }}>
            {avg.toFixed(1)}
          </Typography>
          <Stars value={avg} size="1.2rem" color={starColor} />
          <Typography variant="caption" sx={{ color: starColor, fontWeight: 700, display: 'block', mt: 0.5 }}>
            {label}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Breakdown bars */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const keyMap = { 5: 'five_star', 4: 'four_star', 3: 'three_star', 2: 'two_star', 1: 'one_star' };
            const count = parseInt(stats?.[keyMap[s]]) || 0;
            const barColor = s >= 4 ? '#22c55e' : s === 3 ? '#f59e0b' : '#ef4444';
            return <BarRow key={s} star={s} count={count} total={total} color={barColor} />;
          })}
        </Box>
      </Box>

      {/* ── Total pill ── */}
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        Based on{' '}
        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{total}</Box>
        {' '}{total === 1 ? 'review' : 'reviews'}
      </Typography>

      {/* ── Recent comments ── */}
      {reviews.filter((r) => r.comment).length > 0 && (
        <>
          <Divider />
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}
          >
            Recent Comments
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxHeight: 200, overflowY: 'auto' }}>
            {reviews
              .filter((r) => r.comment)
              .slice(0, 8)
              .map((r) => {
                const rColor = r.rating >= 4 ? '#22c55e' : r.rating === 3 ? '#f59e0b' : '#ef4444';
                return (
                  <Box
                    key={r.id}
                    sx={{
                      p: 1.25, borderRadius: 2, bgcolor: 'background.default',
                      border: '1px solid', borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Stars value={r.rating} size="0.85rem" color={rColor} />
                      <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      "{r.comment}"
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                      — {r.client_name || 'Anonymous'}
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AgentRatingsTab;
