import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const studentGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof localStorage !== 'undefined') {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('userEmail') || '';
    
    const validAdminEmails = ['jorbeta04647@liceo.edu.ph', 'aencarguez89245@liceo.edu.ph'];
    const isAdminCompatible = validAdminEmails.includes(email);
    
    // If the user is logged in as an admin, redirect them to the admin dashboard
    if (isLoggedIn === 'true' && (role === 'admin' || isAdminCompatible)) {
      router.navigate(['/admin/dashboard']);
      return false;
    }
  }

  // Allow students to access student routes
  return true;
};
