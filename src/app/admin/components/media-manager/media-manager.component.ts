import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  url: string;
  size: number;
  uploadDate: Date;
  folder?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  createdDate: Date;
}

@Component({
  selector: 'app-media-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './media-manager.component.html',
  styleUrl: './media-manager.component.css'
})
export class MediaManagerComponent implements OnInit {
  @Input() isModal = false;
  @Input() allowMultipleSelection = false;
  @Input() allowedTypes: string[] = ['image', 'document', 'video'];
  
  @Output() onFileSelected = new EventEmitter<MediaFile | MediaFile[]>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  files: MediaFile[] = [];
  folders: MediaFolder[] = [];
  selectedFiles: MediaFile[] = [];
  currentFolder: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;

  // Filtros y búsqueda
  searchTerm = '';
  filterType: 'all' | 'image' | 'document' | 'video' = 'all';
  sortBy: 'name' | 'date' | 'size' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.loadMediaFiles();
    this.loadFolders();
  }

  // Carga inicial de archivos (simulada)
  private loadMediaFiles(): void {
    this.files = [
      {
        id: '1',
        name: 'profile-photo.jpg',
        type: 'image',
        url: '/assets/profcafe.png',
        size: 245760,
        uploadDate: new Date('2023-12-01'),
        folder: undefined
      },
      {
        id: '2', 
        name: 'project-screenshot.png',
        type: 'image',
        url: '/assets/project1.png',
        size: 512000,
        uploadDate: new Date('2023-12-15'),
        folder: 'projects'
      }
    ];
  }

  private loadFolders(): void {
    this.folders = [
      {
        id: 'projects',
        name: 'Proyectos',
        createdDate: new Date('2023-11-01')
      },
      {
        id: 'profile',
        name: 'Perfil',
        createdDate: new Date('2023-11-01')
      }
    ];
  }

  // Gestión de archivos
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]): void {
    if (files.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simular subida de archivos
    files.forEach((file, index) => {
      this.uploadFile(file, index, files.length);
    });
  }

  private uploadFile(file: File, index: number, total: number): void {
    // Validar tipo de archivo
    const fileType = this.getFileType(file);
    if (!this.allowedTypes.includes(fileType)) {
      console.warn(`Tipo de archivo no permitido: ${file.type}`);
      return;
    }

    // Simular progreso de subida
    const interval = setInterval(() => {
      this.uploadProgress += Math.random() * 30;
      
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        
        // Crear URL temporal para el archivo
        const fileUrl = URL.createObjectURL(file);
        
        const newFile: MediaFile = {
          id: this.generateId(),
          name: file.name,
          type: fileType as 'image' | 'document' | 'video',
          url: fileUrl,
          size: file.size,
          uploadDate: new Date(),
          folder: this.currentFolder || undefined
        };

        this.files.unshift(newFile);
        
        // Resetear progreso cuando se complete el último archivo
        if (index === total - 1) {
          setTimeout(() => {
            this.isUploading = false;
            this.uploadProgress = 0;
          }, 500);
        }
      }
    }, 100);
  }

  private getFileType(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  }

  // Selección de archivos
  selectFile(file: MediaFile): void {
    if (this.allowMultipleSelection) {
      const index = this.selectedFiles.findIndex(f => f.id === file.id);
      if (index > -1) {
        this.selectedFiles.splice(index, 1);
      } else {
        this.selectedFiles.push(file);
      }
    } else {
      this.selectedFiles = [file];
    }
  }

  isFileSelected(file: MediaFile): boolean {
    return this.selectedFiles.some(f => f.id === file.id);
  }

  confirmSelection(): void {
    if (this.selectedFiles.length > 0) {
      const result = this.allowMultipleSelection ? this.selectedFiles : this.selectedFiles[0];
      this.onFileSelected.emit(result);
    }
  }

  // Gestión de carpetas
  enterFolder(folderId: string): void {
    this.currentFolder = folderId;
  }

  goBack(): void {
    this.currentFolder = null;
  }

  createFolder(): void {
    const folderName = prompt('Nombre de la nueva carpeta:');
    if (folderName) {
      const newFolder: MediaFolder = {
        id: this.generateId(),
        name: folderName,
        parentId: this.currentFolder || undefined,
        createdDate: new Date()
      };
      this.folders.push(newFolder);
    }
  }

  // Filtros y ordenamiento
  get filteredFiles(): MediaFile[] {
    let filtered = this.files.filter(file => {
      // Filtro por carpeta actual
      if (file.folder !== this.currentFolder) return false;
      
      // Filtro por tipo
      if (this.filterType !== 'all' && file.type !== this.filterType) return false;
      
      // Filtro por búsqueda
      if (this.searchTerm && !file.name.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
      
      return true;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  get currentFolders(): MediaFolder[] {
    return this.folders.filter(folder => folder.parentId === this.currentFolder);
  }

  // Acciones de archivo
  deleteFile(file: MediaFile): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${file.name}"?`)) {
      this.files = this.files.filter(f => f.id !== file.id);
      this.selectedFiles = this.selectedFiles.filter(f => f.id !== file.id);
    }
  }

  renameFile(file: MediaFile): void {
    const newName = prompt('Nuevo nombre:', file.name);
    if (newName && newName !== file.name) {
      file.name = newName;
    }
  }

  downloadFile(file: MediaFile): void {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  // Utilidades
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: MediaFile): string {
    switch (file.type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📄';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getCurrentFolderName(): string {
    if (!this.currentFolder) return '';
    const folder = this.folders.find(f => f.id === this.currentFolder);
    return folder?.name || '';
  }

  closeModal(): void {
    this.onClose.emit();
  }
}
