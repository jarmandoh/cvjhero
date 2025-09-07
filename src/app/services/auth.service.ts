import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly TOKEN_KEY = 'cvjhero_admin_token';
  private readonly USER_KEY = 'cvjhero_admin_user';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Verificar si hay un usuario guardado en localStorage al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Simula el login (temporal hasta implementar backend)
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Credenciales temporales para desarrollo
    const DEMO_ADMIN = {
      email: 'admin@cvjhero.com',
      password: 'admin123'
    };

    if (credentials.email === DEMO_ADMIN.email && credentials.password === DEMO_ADMIN.password) {
      const user: User = {
        id: '1',
        email: credentials.email,
        name: 'Janier Hernández',
        role: 'admin',
        isActive: true,
        lastLogin: new Date()
      };

      const authResponse: AuthResponse = {
        token: this.generateDemoToken(),
        user,
        expiresIn: 3600 // 1 hora
      };

      this.setSession(authResponse);
      return of(authResponse);
    } else {
      return throwError(() => new Error('Credenciales inválidas'));
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Establecer la sesión
   */
  private setSession(authResponse: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const expiresAt = Date.now() + (authResponse.expiresIn * 1000);
    
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      ...authResponse.user,
      expiresAt
    }));
    
    this.currentUserSubject.next(authResponse.user);
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const userStr = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userStr && token) {
      try {
        const userData = JSON.parse(userStr);
        if (!this.isTokenExpired(token)) {
          this.currentUserSubject.next(userData);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Verificar si el token ha expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Generar token demo (reemplazar con JWT real)
   */
  private generateDemoToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: '1',
      email: 'admin@cvjhero.com',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }));
    const signature = btoa('demo_signature');
    
    return `${header}.${payload}.${signature}`;
  }
}
