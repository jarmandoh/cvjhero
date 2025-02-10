import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

@Component({
  selector: 'app-proyectos',
  imports: [
  ],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {
  projects: Project[] = [
    {
      name: 'Mi Portfolio',
      description: 'Un sitio web personal para mostrar mis proyectos y habilidades.',
      technologies: ['Angular', 'Tailwind CSS', 'TypeScript'],
      link: 'https://mi-portfolio.com'
    },
    {
      name: 'Aplicación de Tareas',
      description: 'Una aplicación para gestionar tareas pendientes.',
      technologies: ['Angular', 'Firebase', 'Material Design'],
      link: 'https://app-tareas.com'
    },
    {
      name: 'Blog de Desarrollo',
      description: 'Un blog donde comparto mis conocimientos sobre desarrollo web.',
      technologies: ['Angular', 'Markdown', 'Netlify'],
      link: 'https://mi-blog.com'
    }
  ];
}
