/**
 * Transform a raw API user object into the agent UI shape.
 * @param {object} user
 * @returns {object}
 */
export const transformAgent = (user) => ({
  id: user.id,
  name: user.name || user.username,
  email: user.email,
  phone: user.phone,
  profile_picture: user.profile_picture,
  role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Support',
  status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Available',
  successfulAssists: 0
});

/**
 * Return status display info (label + dot colour) for a given status string.
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'Available':
      return { label: 'Available', color: 'var(--palette-success-main)' };
    case 'Away':
      return { label: 'Away', color: 'var(--palette-warning-main)' };
    case 'Busy':
      return { label: 'Busy', color: 'var(--palette-error-main)' };
    default:
      return { label: status || 'Unknown', color: 'var(--palette-text-disabled)' };
  }
};
