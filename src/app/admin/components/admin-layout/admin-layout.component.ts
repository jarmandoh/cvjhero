import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileNavComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  isMobileNavOpen = false;
  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simular usuario actual - esto debería venir de tu servicio de autenticación
    this.currentUser = {
      name: 'Janier Hernández',
      email: 'admin@cvjhero.com',
      lastLogin: new Date()
    };
  }

  toggleMobileNav() {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav() {
    this.isMobileNavOpen = false;
  }

  logout() {
    // Implementar lógica de logout
    this.router.navigate(['/admin/login']);
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    switch (true) {
      case url.includes('/admin/dashboard'):
        return 'Dashboard';
      case url.includes('/admin/content'):
        return 'Gestión de Contenido';
      case url.includes('/admin/chat'):
        return 'Gestión de Chat';
      case url.includes('/admin/email'):
        return 'Gestión de Email';
      default:
        return 'Panel de Administración';
    }
  }
}
