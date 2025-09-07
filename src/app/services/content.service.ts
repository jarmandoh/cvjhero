import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Project, Experience, Service } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private experiencesSubject = new BehaviorSubject<Experience[]>([]);
  private servicesSubject = new BehaviorSubject<Service[]>([]);

  public projects$ = this.projectsSubject.asObservable();
  public experiences$ = this.experiencesSubject.asObservable();
  public services$ = this.servicesSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  // Projects CRUD
  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProject(id: string): Observable<Project | undefined> {
    const projects = this.projectsSubject.value;
    return of(projects.find(p => p.id === id));
  }

  addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentProjects = this.projectsSubject.value;
    this.projectsSubject.next([...currentProjects, newProject]);
    
    return of(newProject);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project | null> {
    const projects = this.projectsSubject.value;
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return of(null);
    }

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date()
    };

    projects[index] = updatedProject;
    this.projectsSubject.next([...projects]);
    
    return of(updatedProject);
  }

  deleteProject(id: string): Observable<boolean> {
    const projects = this.projectsSubject.value;
    const filteredProjects = projects.filter(p => p.id !== id);
    this.projectsSubject.next(filteredProjects);
    
    return of(true);
  }

  // Experiences CRUD
  getExperiences(): Observable<Experience[]> {
    return this.experiences$;
  }

  addExperience(experience: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Observable<Experience> {
    const newExperience: Experience = {
      ...experience,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentExperiences = this.experiencesSubject.value;
    this.experiencesSubject.next([...currentExperiences, newExperience]);
    
    return of(newExperience);
  }

  updateExperience(id: string, updates: Partial<Experience>): Observable<Experience | null> {
    const experiences = this.experiencesSubject.value;
    const index = experiences.findIndex(e => e.id === id);
    
    if (index === -1) {
      return of(null);
    }

    const updatedExperience = {
      ...experiences[index],
      ...updates,
      updatedAt: new Date()
    };

    experiences[index] = updatedExperience;
    this.experiencesSubject.next([...experiences]);
    
    return of(updatedExperience);
  }

  deleteExperience(id: string): Observable<boolean> {
    const experiences = this.experiencesSubject.value;
    const filteredExperiences = experiences.filter(e => e.id !== id);
    this.experiencesSubject.next(filteredExperiences);
    
    return of(true);
  }

  // Services CRUD
  getServices(): Observable<Service[]> {
    return this.services$;
  }

  addService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Observable<Service> {
    const newService: Service = {
      ...service,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentServices = this.servicesSubject.value;
    this.servicesSubject.next([...currentServices, newService]);
    
    return of(newService);
  }

  updateService(id: string, updates: Partial<Service>): Observable<Service | null> {
    const services = this.servicesSubject.value;
    const index = services.findIndex(s => s.id === id);
    
    if (index === -1) {
      return of(null);
    }

    const updatedService = {
      ...services[index],
      ...updates,
      updatedAt: new Date()
    };

    services[index] = updatedService;
    this.servicesSubject.next([...services]);
    
    return of(updatedService);
  }

  deleteService(id: string): Observable<boolean> {
    const services = this.servicesSubject.value;
    const filteredServices = services.filter(s => s.id !== id);
    this.servicesSubject.next(filteredServices);
    
    return of(true);
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadInitialData(): void {
    // Cargar datos existentes (simulado por ahora)
    const initialProjects: Project[] = [
      {
        id: '1',
        name: 'Mi Portfolio',
        description: 'Un sitio web personal para mostrar mis proyectos y habilidades.',
        technologies: ['Angular', 'Tailwind CSS', 'TypeScript'],
        link: 'https://mi-portfolio.com',
        isActive: true,
        featured: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: '2',
        name: 'Aplicación de Tareas',
        description: 'Una aplicación para gestionar tareas pendientes.',
        technologies: ['Angular', 'Firebase', 'Material Design'],
        link: 'https://app-tareas.com',
        isActive: true,
        featured: false,
        createdAt: new Date('2023-02-01')
      }
    ];

    const initialServices: Service[] = [
      {
        id: '1',
        title: 'Desarrollo Web',
        description: 'Creación de sitios web modernos y responsivos.',
        isActive: true,
        order: 1,
        createdAt: new Date('2023-01-01')
      },
      {
        id: '2',
        title: 'Desarrollo Backend',
        description: 'APIs robustas y escalables con Node.js y Python.',
        isActive: true,
        order: 2,
        createdAt: new Date('2023-01-01')
      }
    ];

    this.projectsSubject.next(initialProjects);
    this.servicesSubject.next(initialServices);
  }
}
