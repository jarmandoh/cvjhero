import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ExperienciaComponent } from './pages/experiencia/experiencia.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    {
        path: 'contacto', component: ContactoComponent
    },
    {
        path: 'experiencia', component: ExperienciaComponent
    },
    {
        path: 'proyectos', component: ProyectosComponent
    },
    {
        path: 'servicios', loadComponent() {
            return import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent);
        }
    },
    {
        path: 'admin/login', loadComponent() {
            return import('./admin/login/login.component').then(m => m.LoginComponent);
        }
    },
    {
        path: 'admin/dashboard', 
        loadComponent() {
            return import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent);
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/content', 
        loadComponent() {
            return import('./admin/content-manager/content-manager.component').then(m => m.ContentManagerComponent);
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full'
    },
    {
        path: '**', redirectTo: ''
    }
];
