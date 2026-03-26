import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  login: (token) => {
    // decode JWT
    const payload = JSON.parse(atob(token.split(".")[1]));

    const user = {
      email: payload.sub || payload.email,
      role: payload.role,
    };

    localStorage.setItem("token", token);

    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const user = {
          email: payload.sub || payload.email,
          role: payload.role,
        };

        set({ user, token });
      } catch (err) {
        console.error("Invalid token");
      }
    }
  },
}));
