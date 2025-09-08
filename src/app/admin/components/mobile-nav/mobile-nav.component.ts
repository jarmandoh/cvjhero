import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.css']
})
export class MobileNavComponent {
  @Input() isOpen = false;
  @Output() toggleNav = new EventEmitter<void>();
  @Output() closeNav = new EventEmitter<void>();

  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  navigationItems = [
    {
      title: 'Dashboard',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      route: '/admin/dashboard',
      description: 'Panel principal'
    },
    {
      title: 'Contenido',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      route: '/admin/content',
      description: 'Gestionar proyectos y experiencias'
    },
    {
      title: 'Chat',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      route: '/admin/chat',
      description: 'Gestionar mensajes de chat'
    },
    {
      title: 'Email',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      route: '/admin/email',
      description: 'Gestionar correos electrónicos'
    }
  ];

  navigateToRoute(route: string) {
    this.router.navigate([route]);
    this.closeNav.emit();
  }

  onBackdropClick() {
    this.closeNav.emit();
  }

  getCurrentRoute(): string {
    return this.router.url;
  }

  isActiveRoute(route: string): boolean {
    return this.getCurrentRoute() === route;
  }
}
