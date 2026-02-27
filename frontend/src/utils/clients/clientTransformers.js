/**
 * Transform a raw API user object into the client UI shape.
 * @param {object} user
 * @returns {object}
 */
export const transformClient = (user) => ({
  id: user.id,
  name: user.name || user.username,
  email: user.email,
  phone: user.phone || 'N/A',
  profile_picture: user.profile_picture,
  role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Client',
  status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'
});
