import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = localStorage.getItem('userRole'); 
  // Lấy mảng các role được phép, ví dụ: ['Admin', 'Lecturer']
  const allowedRoles = route.data['roles'] as Array<string>; 

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  // Kiểm tra xem role của user có nằm trong danh sách được phép không
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  alert('Bạn không có quyền truy cập trang này!');
  router.navigate(['/home']);
  return false;
};