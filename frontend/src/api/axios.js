import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — catch 401/403, dispatch event to clear auth state,
// then redirect to /signin. Dispatching an event (rather than importing
// AuthContext directly) avoids a circular-import cycle.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message ?? '';

    const isUnauthorized =
      status === 401 ||
      status === 403 ||
      /not logged in|unauthorized|invalid token|token expired/i.test(message);

    if (isUnauthorized && !error?.config?._skipRedirect) {
      // 1. Clear localStorage directly (fast, synchronous)
      localStorage.removeItem('bf_user');

      // 2. Notify AuthContext to also clear the in-memory user state
      window.dispatchEvent(new Event('auth:unauthorized'));

      // 3. Redirect — skip if already on an auth page to avoid a redirect loop
      const path = window.location.pathname;
      if (path !== '/signin' && path !== '/signup' && path !== '/') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
