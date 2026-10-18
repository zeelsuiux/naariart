import defaultData from '../data/collaborator.json';

const STORAGE_KEY = 'naari_collaborators';

export const getCollaborators = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading collaborators storage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
};

export const saveCollaborators = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('naari-collaborators-changed', { detail: list }));
  } catch (err) {
    console.error('Error saving collaborators storage:', err);
  }
};

export const addCollaboratorInquiry = async (data) => {
  const current = getCollaborators();
  const newItem = {
    ...data,
    id: `collab-${Date.now()}`,
    createdAt: new Date().toISOString(),
    converted: 'Pending',
    reason: '',
    statusNotes: 'New application received via website.',
  };
  const updated = [newItem, ...current];
  saveCollaborators(updated);
  return { success: true, item: newItem };
};

export const updateCollaboratorStatus = async (id, { converted, reason, statusNotes }) => {
  const current = getCollaborators();
  const updated = current.map((item) => {
    if (String(item.id) === String(id)) {
      return {
        ...item,
        converted: converted !== undefined ? converted : item.converted,
        reason: reason !== undefined ? reason : item.reason,
        statusNotes: statusNotes !== undefined ? statusNotes : item.statusNotes,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveCollaborators(updated);
  return { success: true };
};

export const deleteCollaboratorInquiry = async (id) => {
  const current = getCollaborators();
  const updated = current.filter((item) => String(item.id) !== String(id));
  saveCollaborators(updated);
  return { success: true };
};
