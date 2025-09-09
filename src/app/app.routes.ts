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
        path: 'agendar', loadComponent() {
            return import('./pages/agendar/agendar.component').then(m => m.AgendarComponent);
        }
    },
    {
        path: 'blog', loadComponent() {
            return import('./blog/blog-list/blog-list.component').then(m => m.BlogListComponent);
        }
    },
    {
        path: 'blog/:slug', loadComponent() {
            return import('./blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent);
        }
    },
    {
        path: 'admin/login', loadComponent() {
            return import('./admin/login/login.component').then(m => m.LoginComponent);
        }
    },
    {
        path: 'admin',
        loadComponent() {
            return import('./admin/components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent);
        },
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard', 
                loadComponent() {
                    return import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent);
                }
            },
            {
                path: 'content', 
                loadComponent() {
                    return import('./admin/content-manager/content-manager.component').then(m => m.ContentManagerComponent);
                }
            },
            {
                path: 'newsletter', 
                loadComponent() {
                    return import('./admin/newsletter-manager/newsletter-manager.component').then(m => m.NewsletterManagerComponent);
                }
            },
            {
                path: 'chat', 
                loadComponent() {
                    return import('./admin/chat-manager/chat-manager.component').then(m => m.ChatManagerComponent);
                }
            },
            {
                path: 'email', 
                loadComponent() {
                    return import('./admin/email-manager/email-manager.component').then(m => m.EmailManagerComponent);
                }
            },
            {
                path: '', redirectTo: 'dashboard', pathMatch: 'full'
            }
        ]
    },
    {
        path: '**', redirectTo: ''
    }
];
