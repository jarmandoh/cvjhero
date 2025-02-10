import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ExperienciaComponent } from './pages/experiencia/experiencia.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';

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
        path: '**', redirectTo: ''
    }
];
