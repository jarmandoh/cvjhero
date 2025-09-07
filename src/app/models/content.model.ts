export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  imageUrl?: string;
  githubUrl?: string;
  isActive: boolean;
  featured: boolean;
  completedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Experience {
  id?: string;
  titulo: string;
  descripcion: string;
  puntuacion: number;
  autor: string;
  fecha: string;
  isVisible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
