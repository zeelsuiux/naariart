// Local Storage utilities for Naari Art application

export const storage = {
  // Save authentication data
  setAuthData: (token, userData) => {
    localStorage.setItem('naari_token', token || '');
    localStorage.setItem('naari_user', JSON.stringify(userData || {}));
    // Store user permissions separately for easy access
    if (userData?.roleid?.permissions) {
      localStorage.setItem('naari_permissions', JSON.stringify(userData.roleid.permissions));
    } else if (Array.isArray(userData?.permissions)) {
      localStorage.setItem('naari_permissions', JSON.stringify(userData.permissions));
    }
  },

  // Get authentication token
  getToken: () => {
    return localStorage.getItem('naari_token');
  },

  // Get user data safely with try/catch
  getUser: () => {
    try {
      const userData = localStorage.getItem('naari_user');
      if (!userData || userData === 'undefined' || userData === 'null') return null;
      return JSON.parse(userData);
    } catch (e) {
      console.warn('Corrupted naari_user in localStorage, clearing...', e);
      localStorage.removeItem('naari_user');
      return null;
    }
  },

  // Get user permissions safely with try/catch
  getPermissions: () => {
    try {
      const permissions = localStorage.getItem('naari_permissions');
      if (!permissions || permissions === 'undefined' || permissions === 'null') return [];
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Corrupted naari_permissions in localStorage, clearing...', e);
      localStorage.removeItem('naari_permissions');
      return [];
    }
  },

  // Check if user has specific permission
  hasPermission: (collectionName, action) => {
    const permissions = storage.getPermissions();
    if (!permissions) return false;
    
    const permission = permissions.find(p => p.collectionName === collectionName);
    if (!permission) return false;
    
    switch (action) {
      case 'view':
        return permission.view === true;
      case 'insertUpdate':
        return permission.insertUpdate === true;
      case 'delete':
        return permission.delete === true;
      default:
        return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('naari_token');
      const user = storage.getUser();
      return !!(token && user);
    } catch (e) {
      return false;
    }
  },

  // Check if user is master admin
  isMaster: () => {
    try {
      const user = storage.getUser();
      return Boolean(user && user.roleid && user.roleid.ismaster === true);
    } catch (e) {
      return false;
    }
  },

  isAdmin: () => {
    try {
      const user = storage.getUser();
      if (!user) return false;
      const roleName = typeof user?.roleid === 'object'
        ? user.roleid?.name
        : user?.roleName || user?.role;

      return Boolean(
        user?.type?.toLowerCase() === 'admin' ||
        user?.roleid?.ismaster === true ||
        roleName?.toLowerCase().includes('admin') ||
        user?.fullName === 'Admin' ||
        user?.userName === 'admin@naariart.com'
      );
    } catch (e) {
      return false;
    }
  },

  // Get user role name
  getUserRole: () => {
    try {
      const user = storage.getUser();
      return user?.roleid?.name || user?.roleName || (storage.isAdmin() ? 'Administrator' : 'Staff');
    } catch (e) {
      return 'Staff';
    }
  },

  // Clear authentication data
  clearAuthData: () => {
    try {
      localStorage.removeItem('naari_token');
      localStorage.removeItem('naari_user');
      localStorage.removeItem('naari_permissions');
    } catch (e) {
      console.error('Error clearing auth data:', e);
    }
  },

  // Save any data
  setData: (key, data) => {
    try {
      localStorage.setItem(`naari_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving naari_${key}:`, e);
    }
  },

  // Get any data safely
  getData: (key) => {
    try {
      const data = localStorage.getItem(`naari_${key}`);
      if (!data || data === 'undefined' || data === 'null') return null;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`Corrupted naari_${key} in localStorage, clearing...`, e);
      localStorage.removeItem(`naari_${key}`);
      return null;
    }
  },

  // Remove any data
  removeData: (key) => {
    try {
      localStorage.removeItem(`naari_${key}`);
    } catch (e) {
      console.error(`Error removing naari_${key}:`, e);
    }
  }
};
