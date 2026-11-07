/**
 * @file auth.js
 * Módulo de Autenticación y Control de Acceso basado en Roles (RBAC)
 */

import { Storage } from './storage.js';

export const Auth = {
  /** Obtiene el usuario autenticado actualmente */
  getUser() {
    return Storage.getCurrentUser();
  },

  /** Verifica si hay sesión activa */
  isAuthenticated() {
    return this.getUser() !== null;
  },

  /** Intenta iniciar sesión */
  login(email, password) {
    const users = Storage.getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (found) {
      Storage.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  },

  /** Cierra la sesión activa */
  logout() {
    Storage.setCurrentUser(null);
  },

  /** Determina si el usuario tiene un rol determinado */
  hasRole(...allowedRoles) {
    const user = this.getUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },

  /** Inicializa automáticamente sesión como ADMIN si es la primera vez que se ingresa */
  ensureDefaultSession() {
    if (!this.isAuthenticated()) {
      const users = Storage.getUsers();
      if (users.length > 0) {
        Storage.setCurrentUser(users[0]); // Ingresa como Administrador por defecto
      }
    }
  },
};
