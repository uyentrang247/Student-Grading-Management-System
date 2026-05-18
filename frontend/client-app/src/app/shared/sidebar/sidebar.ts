import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  isLoggedIn: boolean = true;

  logout(): void {
    this.isLoggedIn = false;
  }
}