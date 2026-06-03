import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {


  constructor(private authService: AuthService) {}

  ngOnInit(): void {

  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  getRoleTitle(): string {
    if (this.isAdmin()) return 'Quản trị viên';
    if (this.isLecturer()) return 'Giảng viên';
    return 'Người dùng';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLecturer(): boolean {
    return this.authService.isLecturer();
  }

  
}