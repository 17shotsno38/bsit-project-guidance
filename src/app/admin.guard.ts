import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof localStorage !== 'undefined') {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('userEmail') || '';
    
    // Strict compatibility check: only flag these exact two emails
    const validAdminEmails = ['jorbeta04647@liceo.edu.ph', 'aencarguez89245@liceo.edu.ph'];
    const isAdminCompatible = validAdminEmails.includes(email);
    
    if (isLoggedIn === 'true' && (role === 'admin' || isAdminCompatible)) {
      return true;
    }
  }

  // If not an authorized admin account, block them and route them to student panel instead
  router.navigate(['/dashboard']);
  return false;
};
