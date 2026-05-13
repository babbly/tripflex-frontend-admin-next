const ACCESS_KEY = 'tripflex.admin.accessToken';
const REFRESH_KEY = 'tripflex.admin.refreshToken';

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;

const hasWindow = () => typeof window !== 'undefined';

export const authToken = {
  getAccess(): string | null {
    if (memoryAccess) return memoryAccess;
    if (!hasWindow()) return null;
    memoryAccess = window.localStorage.getItem(ACCESS_KEY);
    return memoryAccess;
  },

  getRefresh(): string | null {
    if (memoryRefresh) return memoryRefresh;
    if (!hasWindow()) return null;
    memoryRefresh = window.localStorage.getItem(REFRESH_KEY);
    return memoryRefresh;
  },

  set(accessToken: string, refreshToken: string) {
    memoryAccess = accessToken;
    memoryRefresh = refreshToken;
    if (!hasWindow()) return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear() {
    memoryAccess = null;
    memoryRefresh = null;
    if (!hasWindow()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
