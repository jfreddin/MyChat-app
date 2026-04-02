// store/useNotificationStore.js
import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: ({ type, title, message, avatar }) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type, title, message, avatar },
      ],
    }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 4000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));