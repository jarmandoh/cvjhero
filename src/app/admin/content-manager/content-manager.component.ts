import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContentService } from '../../services/content.service';
import { EditorComponent } from '../components/editor/editor.component';
import { MediaManagerComponent } from '../components/media-manager/media-manager.component';
import { Project, Service } from '../../models/content.model';

@Component({
  selector: 'app-content-manager',
  imports: [CommonModule, ReactiveFormsModule, EditorComponent, MediaManagerComponent],
  templateUrl: './content-manager.component.html',
  styleUrl: './content-manager.component.css'
})
export class ContentManagerComponent implements OnInit {
  activeTab: 'projects' | 'services' | 'info' = 'projects';
  editingItem: any = null;
  isCreating = false;
  
  projectForm!: FormGroup;
  serviceForm!: FormGroup;
  
  projects: Project[] = [];
  services: Service[] = [];
  
  editorContent = '';
  previewContent = '';
  
  // Media Manager
  showMediaManager = false;
  currentFieldForMedia = '';

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  private initForms(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technologies: ['', Validators.required],
      link: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      githubUrl: [''],
      imageUrl: [''],
      featured: [false],
      isActive: [true]
    });

    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      order: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  private loadData(): void {
    this.contentService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    this.contentService.getServices().subscribe(services => {
      this.services = services;
    });
  }

  // Tab management
  setActiveTab(tab: 'projects' | 'services' | 'info'): void {
    this.activeTab = tab;
    this.cancelEdit();
  }

  // Project management
  startCreateProject(): void {
    this.isCreating = true;
    this.editingItem = null;
    this.projectForm.reset({
      featured: false,
      isActive: true
    });
    this.editorContent = '';
  }

  startEditProject(project: Project): void {
    this.isCreating = false;
    this.editingItem = project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(', '),
      link: project.link,
      githubUrl: project.githubUrl || '',
      featured: project.featured,
      isActive: project.isActive
    });
    this.editorContent = project.description;
  }

  saveProject(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      const projectData = {
        name: formValue.name,
        description: this.editorContent || formValue.description,
        technologies: formValue.technologies.split(',').map((tech: string) => tech.trim()),
        link: formValue.link,
        githubUrl: formValue.githubUrl,
        featured: formValue.featured,
        isActive: formValue.isActive
      };

      if (this.isCreating) {
        this.contentService.addProject(projectData).subscribe(() => {
          this.cancelEdit();
        });
      } else if (this.editingItem) {
        this.contentService.updateProject(this.editingItem.id, projectData).subscribe(() => {
          this.cancelEdit();
        });
      }
    }
  }

  deleteProject(project: Project): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${project.name}"?`)) {
      this.contentService.deleteProject(project.id!).subscribe(() => {
        // Data is automatically updated through the observable
      });
    }
  }

  // Service management
  startCreateService(): void {
    this.isCreating = true;
    this.editingItem = null;
    this.serviceForm.reset({
      order: this.services.length + 1,
      isActive: true
    });
    this.editorContent = '';
  }

  startEditService(service: Service): void {
    this.isCreating = false;
    this.editingItem = service;
    this.serviceForm.patchValue({
      title: service.title,
      description: service.description,
      order: service.order,
      isActive: service.isActive
    });
    this.editorContent = service.description;
  }

  saveService(): void {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
      const serviceData = {
        title: formValue.title,
        description: this.editorContent || formValue.description,
        order: formValue.order,
        isActive: formValue.isActive
      };

      if (this.isCreating) {
        this.contentService.addService(serviceData).subscribe(() => {
          this.cancelEdit();
        });
      } else if (this.editingItem) {
        this.contentService.updateService(this.editingItem.id, serviceData).subscribe(() => {
          this.cancelEdit();
        });
      }
    }
  }

  deleteService(service: Service): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.title}"?`)) {
      this.contentService.deleteService(service.id!).subscribe(() => {
        // Data is automatically updated through the observable
      });
    }
  }

  // Common actions
  cancelEdit(): void {
    this.isCreating = false;
    this.editingItem = null;
    this.projectForm.reset();
    this.serviceForm.reset();
    this.editorContent = '';
    this.previewContent = '';
  }

  // Editor events
  onContentChange(content: string): void {
    this.editorContent = content;
    this.previewContent = content;
  }

  onContentSave(content: string): void {
    // Auto-save functionality can be implemented here
    console.log('Content saved:', content);
  }

  // Form validation helpers
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  // Media Manager Methods
  openMediaManager(fieldName: string): void {
    this.currentFieldForMedia = fieldName;
    this.showMediaManager = true;
  }

  closeMediaManager(): void {
    this.showMediaManager = false;
    this.currentFieldForMedia = '';
  }

  onMediaSelected(files: any): void {
    // Convertir a array si es un solo archivo
    const fileArray = Array.isArray(files) ? files : [files];
    
    if (fileArray.length > 0 && this.currentFieldForMedia) {
      const file = fileArray[0];
      
      // Actualizar el campo correspondiente en el formulario
      if (this.activeTab === 'projects' && this.projectForm) {
        this.projectForm.patchValue({
          [this.currentFieldForMedia]: file.url
        });
      } else if (this.activeTab === 'services' && this.serviceForm) {
        this.serviceForm.patchValue({
          [this.currentFieldForMedia]: file.url
        });
      }
    }
    this.closeMediaManager();
  }
}
