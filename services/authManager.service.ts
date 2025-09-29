let globalLogoutCallback: (() => void) | null = null;

export const authManager = {
  setLogoutCallback(callback: () => void) {
    globalLogoutCallback = callback;
  },
  
  triggerLogout() {
    if (globalLogoutCallback) {
      globalLogoutCallback();
    }
  },

  clearLogoutCallback() {
    globalLogoutCallback = null;
  }
};