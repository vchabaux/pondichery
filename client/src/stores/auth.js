import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loaded: false,
    changeMailRequestSent: false,
  }),

  getters: {
    currentUser() {
      return this.user;
    },

    isLoggedIn() {
      return !!this.user;
    },

    initialized() {
      return !!this.loaded;
    },

    mailRequestOnGoing() {
      return this.changeMailRequestSent;
    },

    isAdmin() {
      return (
        this.user &&
        (this.user.role === "super-admin" || this.user.role === "admin")
      );
    },

    isSuperAdmin() {
      return this.user && this.user.role === "superadmin";
    }
  },

  actions: {
    async signin(credentials) {
      try {
        const { data: user } = await api.post("/auth/signin", credentials);
        this.user = user;
    
        return Promise.resolve();
      } catch (err) {
        if (err.response) {
          // Gérer les erreurs liées à la réponse du serveur
          console.error("Erreur de connexion:", err.response.data);
          throw new Error(`Erreur de connexion: ${err.response.data.message}`);
        } else if (err.request) {
          // La requête a été faite, mais aucune réponse n'a été reçue
          console.error("Erreur de requête (CORS, serveur inaccessible, etc.):", err.request);
          throw new Error("Erreur de requête (CORS, serveur inaccessible, etc.)");
        } else {
          // Une erreur lors de la configuration de la requête a eu lieu
          console.error("Erreur inconnue:", err.message);
          throw new Error(`Erreur inconnue: ${err.message}`);
        }
      }
    },

    async initialize() {
      try {
        const { data: user } = await api.get("/account/me");
        this.user = user;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          this.user = null;
        }
      } finally {
        this.loaded = true;
        return Promise.resolve();
      }
    },

    async signup(credentials) {
      await api.post("/auth/signup", credentials);
      Promise.resolve();
    },

    async signout() {
      await api.post("/auth/logout");
      window.location.reload();
    },

    async updateName(name) {
      const { data } = await api.patch("/account/me", { name });
      this.user = data;
    },

    async updatePassword(password, newPassword) {
      const { data } = await api.patch("/account/me/password", {
        password,
        newPassword,
      });

      this.user = data;
    },

    async sendMailToken(mail) {
      const { data } = await api.post("/account/me/email", { mail });
      await this.getToken();
    },

    async validateCode(code) {
      const { data } = await api.post("/account/me/email/code", { code });
    },

    getToken() {
      return new Promise(async (resolve) => {
        try {
          await api.get("/account/me/email/token");
          this.changeMailRequestSent = true;
        } catch (err) {
          this.changeMailRequestSent = false;
        }
      });
    },

    verifyPassword(password) {
      return new Promise(async (resolve) => {
        try {
          await api.post("/account/me/password", { password });
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      });
    },
  },
});
