export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('tomorrow_user') || 'null');
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Admins keep their session in a separate storage bucket from customers.
export const getAdminAuthHeader = () => {
  const admin = JSON.parse(localStorage.getItem('tomorrow_admin') || 'null');
  return admin?.token ? { Authorization: `Bearer ${admin.token}` } : {};
};

export const statusColor = (status) => {
  const map = {
    pending: 'status-pending',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };
  return map[status] || 'status-pending';
};
