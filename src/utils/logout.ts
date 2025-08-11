import type { Router } from 'vue-router';

export const logout = (router: Router) => {
  
  if (!router) {
    console.error('Router is not available.');
    return;
  }
  
  router.push('/login');
};
