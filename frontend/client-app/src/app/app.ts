import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { SidebarComponent } from './shared/sidebar/sidebar';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, SidebarComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}