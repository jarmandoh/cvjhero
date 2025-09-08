import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { BlogPost, BlogCategory, BlogTag, BlogComment, BlogSettings, BlogStats, SearchResult, BlogFilters } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly POSTS_KEY = 'cvjhero_blog_posts';
  private readonly CATEGORIES_KEY = 'cvjhero_blog_categories';
  private readonly TAGS_KEY = 'cvjhero_blog_tags';
  private readonly COMMENTS_KEY = 'cvjhero_blog_comments';
  private readonly SETTINGS_KEY = 'cvjhero_blog_settings';
  private readonly STORAGE_KEY = 'cvjhero_blog_posts';

  private postsSubject = new BehaviorSubject<BlogPost[]>([]);
  private categoriesSubject = new BehaviorSubject<BlogCategory[]>([]);
  private tagsSubject = new BehaviorSubject<BlogTag[]>([]);

  public posts$ = this.postsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public tags$ = this.tagsSubject.asObservable();

  // Datos de ejemplo para desarrollo
  private defaultPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Introducción a Angular 17: Nuevas características y mejoras',
      slug: 'introduccion-angular-17-nuevas-caracteristicas',
      content: `# Introducción a Angular 17

Angular 20 marca un hito importante en la evolución del framework, introduciendo características revolucionarias que transforman la manera en que desarrollamos aplicaciones web.

## Control Flow Syntax

Una de las características más destacadas es la nueva sintaxis de control flow:

\`\`\`typescript
// Antes
*ngIf="condition"
*ngFor="let item of items"

// Ahora
@if (condition) {
  <div>Contenido</div>
}
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
\`\`\`

## Standalone Components

Los componentes standalone simplifican la arquitectura:

\`\`\`typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`<div>Mi componente</div>\`
})
export class MyComponent {}
\`\`\`

## Conclusión

Angular 17 representa un paso adelante significativo en términos de developer experience y performance.`,
      excerpt: 'Descubre las nuevas características de Angular 17 que están revolucionando el desarrollo web.',
      author: {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        avatar: '/assets/profcafe.png'
      },
      status: 'published',
      publishedAt: new Date('2024-11-15'),
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-15'),
      categories: ['Angular', 'Frontend'],
      tags: ['angular17', 'frontend', 'javascript', 'typescript'],
      coverImage: '/assets/angular-17-cover.jpg',
      readingTime: 8,
      views: 1250,
      likes: 45,
      comments: 12,
      seo: {
        metaTitle: 'Angular 17: Nuevas características y mejoras - Blog de Janier Hernández',
        metaDescription: 'Descubre las revolucionarias características de Angular 17 incluyendo la nueva sintaxis de control flow y componentes standalone.',
        keywords: ['Angular 17', 'frontend', 'javascript', 'typescript', 'desarrollo web']
      },
      featured: true,
      sticky: false
    },
    {
      id: '2',
      title: 'Guía completa de Tailwind CSS para principiantes',
      slug: 'guia-completa-tailwind-css-principiantes',
      content: `# Guía completa de Tailwind CSS

Tailwind CSS ha revolucionado la manera en que escribimos CSS, ofreciendo un enfoque utility-first que acelera el desarrollo.

## ¿Por qué Tailwind CSS?

- **Utility-First**: Clases predefinidas para estilos comunes
- **Responsivo**: Sistema de breakpoints integrado
- **Customizable**: Configuración completamente personalizable
- **Performance**: Purge automático de CSS no utilizado

## Instalación

\`\`\`bash
npm install -D tailwindcss
npx tailwindcss init
\`\`\`

## Ejemplos básicos

\`\`\`html
<!-- Botón básico -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Botón
</button>

<!-- Card responsive -->
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div class="md:flex">
    <div class="p-8">
      <h3 class="text-lg font-medium text-black">Card Title</h3>
      <p class="text-gray-500">Card content</p>
    </div>
  </div>
</div>
\`\`\`

## Conclusión

Tailwind CSS ofrece una experiencia de desarrollo superior para crear interfaces modernas y responsivas.`,
      excerpt: 'Aprende Tailwind CSS desde cero con esta guía completa para principiantes.',
      author: {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        avatar: '/assets/profcafe.png'
      },
      status: 'published',
      publishedAt: new Date('2024-11-10'),
      createdAt: new Date('2024-11-08'),
      updatedAt: new Date('2024-11-10'),
      categories: ['CSS', 'Frontend'],
      tags: ['tailwindcss', 'css', 'frontend', 'responsive'],
      coverImage: '/assets/tailwind-cover.jpg',
      readingTime: 12,
      views: 890,
      likes: 32,
      comments: 8,
      seo: {
        metaTitle: 'Guía completa de Tailwind CSS - Blog de Desarrollo',
        metaDescription: 'Aprende Tailwind CSS desde cero con ejemplos prácticos y mejores prácticas para desarrollo frontend.',
        keywords: ['Tailwind CSS', 'CSS', 'frontend', 'responsive design', 'utility first']
      },
      featured: false,
      sticky: false
    },
    {
      id: '3',
      title: 'Mejores prácticas para desarrollo Full Stack con Node.js y Angular',
      slug: 'mejores-practicas-full-stack-nodejs-angular',
      content: `# Desarrollo Full Stack: Node.js + Angular

La combinación de Node.js y Angular ofrece un stack completo para desarrollo web moderno.

## Arquitectura del proyecto

\`\`\`
project/
├── backend/
│   ├── src/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── frontend/
    ├── src/
    ├── app/
    └── assets/
\`\`\`

## Backend con Node.js

\`\`\`javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/posts', (req, res) => {
  res.json({ posts: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Frontend con Angular

\`\`\`typescript
// blog.service.ts
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(\`\${this.apiUrl}/posts\`);
  }
}
\`\`\`

## Mejores prácticas

1. **Separación de responsabilidades**
2. **Validación en ambos lados**
3. **Manejo de errores consistente**
4. **Autenticación JWT**
5. **Testing automatizado**`,
      excerpt: 'Descubre las mejores prácticas para crear aplicaciones full stack robustas con Node.js y Angular.',
      author: {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        avatar: '/assets/profcafe.png'
      },
      status: 'draft',
      createdAt: new Date('2024-11-05'),
      updatedAt: new Date('2024-11-12'),
      categories: ['Full Stack', 'Node.js', 'Angular'],
      tags: ['nodejs', 'angular', 'fullstack', 'javascript', 'backend'],
      readingTime: 15,
      views: 0,
      likes: 0,
      comments: 0,
      seo: {
        metaTitle: 'Desarrollo Full Stack con Node.js y Angular - Mejores Prácticas',
        metaDescription: 'Guía completa de mejores prácticas para desarrollo full stack usando Node.js en el backend y Angular en el frontend.',
        keywords: ['Node.js', 'Angular', 'Full Stack', 'JavaScript', 'desarrollo web']
      },
      featured: false,
      sticky: false
    }
  ];

  private defaultCategories: BlogCategory[] = [
    { id: '1', name: 'Angular', slug: 'angular', description: 'Todo sobre Angular framework', color: '#dd0031', postCount: 1, createdAt: new Date() },
    { id: '2', name: 'Frontend', slug: 'frontend', description: 'Desarrollo frontend moderno', color: '#61dafb', postCount: 2, createdAt: new Date() },
    { id: '3', name: 'CSS', slug: 'css', description: 'Estilos y diseño web', color: '#1572b6', postCount: 1, createdAt: new Date() },
    { id: '4', name: 'Full Stack', slug: 'full-stack', description: 'Desarrollo completo', color: '#68217a', postCount: 1, createdAt: new Date() },
    { id: '5', name: 'Node.js', slug: 'nodejs', description: 'Backend con Node.js', color: '#339933', postCount: 1, createdAt: new Date() }
  ];

  private defaultTags: BlogTag[] = [
    { id: '1', name: 'angular17', slug: 'angular17', postCount: 1, createdAt: new Date() },
    { id: '2', name: 'frontend', slug: 'frontend', postCount: 2, createdAt: new Date() },
    { id: '3', name: 'javascript', slug: 'javascript', postCount: 2, createdAt: new Date() },
    { id: '4', name: 'typescript', slug: 'typescript', postCount: 2, createdAt: new Date() },
    { id: '5', name: 'tailwindcss', slug: 'tailwindcss', postCount: 1, createdAt: new Date() },
    { id: '6', name: 'css', slug: 'css', postCount: 1, createdAt: new Date() },
    { id: '7', name: 'responsive', slug: 'responsive', postCount: 1, createdAt: new Date() },
    { id: '8', name: 'nodejs', slug: 'nodejs', postCount: 1, createdAt: new Date() },
    { id: '9', name: 'fullstack', slug: 'fullstack', postCount: 1, createdAt: new Date() },
    { id: '10', name: 'backend', slug: 'backend', postCount: 1, createdAt: new Date() }
  ];

  private defaultComments: BlogComment[] = [
    {
      id: '1',
      postId: '1',
      author: {
        name: 'María García',
        email: 'maria.garcia@example.com'
      },
      content: '¡Excelente artículo! Angular 17 realmente ha mejorado mucho la experiencia de desarrollo.',
      status: 'approved',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      likes: 3,
      replies: []
    },
    {
      id: '2',
      postId: '1',
      author: {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        avatar: '/assets/profcafe.png'
      },
      content: 'Gracias María! Me alegra que te haya gustado. Angular 17 definitivamente marca un antes y después.',
      status: 'approved',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      likes: 1,
      replies: []
    },
    {
      id: '3',
      postId: '2',
      author: {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@example.com'
      },
      content: 'Gran tutorial de Tailwind CSS. Los ejemplos están muy bien explicados.',
      status: 'approved',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      likes: 2,
      replies: []
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadData();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadData(): void {
    try {
      if (!this.isBrowser()) {
        // En el servidor, usar datos por defecto
        this.postsSubject.next(this.defaultPosts);
        this.categoriesSubject.next(this.defaultCategories);
        this.tagsSubject.next(this.defaultTags);
        return;
      }

      const posts = JSON.parse(localStorage.getItem(this.POSTS_KEY) || 'null') || this.defaultPosts;
      const categories = JSON.parse(localStorage.getItem(this.CATEGORIES_KEY) || 'null') || this.defaultCategories;
      const tags = JSON.parse(localStorage.getItem(this.TAGS_KEY) || 'null') || this.defaultTags;

      this.postsSubject.next(posts);
      this.categoriesSubject.next(categories);
      this.tagsSubject.next(tags);
    } catch (error) {
      console.error('Error loading blog data:', error);
      this.postsSubject.next(this.defaultPosts);
      this.categoriesSubject.next(this.defaultCategories);
      this.tagsSubject.next(this.defaultTags);
    }
  }

  private saveData(): void {
    if (!this.isBrowser()) {
      return; // No guardar en el servidor
    }
    
    try {
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(this.postsSubject.value));
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(this.categoriesSubject.value));
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.tagsSubject.value));
    } catch (error) {
      console.error('Error saving blog data:', error);
    }
  }

  // Posts management
  getAllPosts(): Observable<BlogPost[]> {
    return this.posts$;
  }

  getPublishedPosts(): Observable<BlogPost[]> {
    return this.posts$.pipe(
      map(posts => posts.filter(post => post.status === 'published').sort((a, b) => 
        new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      ))
    );
  }

  getFeaturedPosts(): Observable<BlogPost[]> {
    return this.posts$.pipe(
      map(posts => posts.filter(post => post.featured && post.status === 'published'))
    );
  }

  getPostById(id: string): Observable<BlogPost | null> {
    return this.posts$.pipe(
      map(posts => posts.find(post => post.id === id) || null)
    );
  }

  getPostBySlug(slug: string): Observable<BlogPost | null> {
    return this.posts$.pipe(
      map(posts => posts.find(post => post.slug === slug) || null)
    );
  }

  searchPosts(filters: BlogFilters): Observable<SearchResult> {
    return this.posts$.pipe(
      map(posts => {
        let filteredPosts = [...posts];

        // Filter by status
        if (filters.status) {
          filteredPosts = filteredPosts.filter(post => post.status === filters.status);
        } else {
          filteredPosts = filteredPosts.filter(post => post.status === 'published');
        }

        // Filter by category
        if (filters.category) {
          filteredPosts = filteredPosts.filter(post => 
            post.categories.some(cat => cat.toLowerCase().includes(filters.category!.toLowerCase()))
          );
        }

        // Filter by tag
        if (filters.tag) {
          filteredPosts = filteredPosts.filter(post => 
            post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
          );
        }

        // Filter by search term
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by featured
        if (filters.featured !== undefined) {
          filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
        }

        // Sort by date
        filteredPosts.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        });

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        return {
          posts: paginatedPosts,
          total: filteredPosts.length,
          page,
          limit,
          hasMore: endIndex < filteredPosts.length
        };
      }),
      delay(500) // Simulate API delay
    );
  }

  createPost(post: Partial<BlogPost>): Observable<BlogPost> {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: post.title || '',
      slug: this.generateSlug(post.title || ''),
      content: post.content || '',
      excerpt: post.excerpt || this.generateExcerpt(post.content || ''),
      author: post.author || {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        avatar: '/assets/profcafe.png'
      },
      status: post.status || 'draft',
      publishedAt: post.status === 'published' ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      categories: post.categories || [],
      tags: post.tags || [],
      coverImage: post.coverImage,
      readingTime: this.calculateReadingTime(post.content || ''),
      views: 0,
      likes: 0,
      comments: 0,
      seo: post.seo || {},
      featured: post.featured || false,
      sticky: post.sticky || false
    };

    const currentPosts = this.postsSubject.value;
    const updatedPosts = [newPost, ...currentPosts];
    this.postsSubject.next(updatedPosts);
    this.saveData();

    return of(newPost).pipe(delay(500));
  }

  updatePost(id: string, updates: Partial<BlogPost>): Observable<BlogPost | null> {
    const currentPosts = this.postsSubject.value;
    const postIndex = currentPosts.findIndex(post => post.id === id);

    if (postIndex === -1) {
      return of(null);
    }

    const updatedPost = {
      ...currentPosts[postIndex],
      ...updates,
      updatedAt: new Date(),
      slug: updates.title ? this.generateSlug(updates.title) : currentPosts[postIndex].slug,
      readingTime: updates.content ? this.calculateReadingTime(updates.content) : currentPosts[postIndex].readingTime
    };

    if (updates.status === 'published' && currentPosts[postIndex].status !== 'published') {
      updatedPost.publishedAt = new Date();
    }

    const updatedPosts = [...currentPosts];
    updatedPosts[postIndex] = updatedPost;
    this.postsSubject.next(updatedPosts);
    this.saveData();

    return of(updatedPost).pipe(delay(500));
  }

  deletePost(id: string): Observable<boolean> {
    const currentPosts = this.postsSubject.value;
    const filteredPosts = currentPosts.filter(post => post.id !== id);
    
    if (filteredPosts.length === currentPosts.length) {
      return of(false);
    }

    this.postsSubject.next(filteredPosts);
    this.saveData();

    return of(true).pipe(delay(500));
  }

  // Categories management
  getAllCategories(): Observable<BlogCategory[]> {
    return this.categories$;
  }

  createCategory(category: Partial<BlogCategory>): Observable<BlogCategory> {
    const newCategory: BlogCategory = {
      id: Date.now().toString(),
      name: category.name || '',
      slug: this.generateSlug(category.name || ''),
      description: category.description,
      color: category.color || '#6b7280',
      postCount: 0,
      createdAt: new Date()
    };

    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = [...currentCategories, newCategory];
    this.categoriesSubject.next(updatedCategories);
    this.saveData();

    return of(newCategory).pipe(delay(500));
  }

  // Tags management
  getAllTags(): Observable<BlogTag[]> {
    return this.tags$;
  }

  createTag(tag: Partial<BlogTag>): Observable<BlogTag> {
    const newTag: BlogTag = {
      id: Date.now().toString(),
      name: tag.name || '',
      slug: this.generateSlug(tag.name || ''),
      postCount: 0,
      createdAt: new Date()
    };

    const currentTags = this.tagsSubject.value;
    const updatedTags = [...currentTags, newTag];
    this.tagsSubject.next(updatedTags);
    this.saveData();

    return of(newTag).pipe(delay(500));
  }

  // Statistics
  getBlogStats(): Observable<BlogStats> {
    return this.posts$.pipe(
      map(posts => {
        const publishedPosts = posts.filter(p => p.status === 'published');
        const draftPosts = posts.filter(p => p.status === 'draft');

        const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
        const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
        const avgReadingTime = posts.length > 0 ? 
          posts.reduce((sum, post) => sum + post.readingTime, 0) / posts.length : 0;

        // Count categories
        const categoryCount: { [key: string]: number } = {};
        posts.forEach(post => {
          post.categories.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          });
        });

        // Count tags
        const tagCount: { [key: string]: number } = {};
        posts.forEach(post => {
          post.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });

        return {
          totalPosts: posts.length,
          publishedPosts: publishedPosts.length,
          draftPosts: draftPosts.length,
          totalViews,
          totalComments,
          totalLikes,
          avgReadingTime,
          topCategories: Object.entries(categoryCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          topTags: Object.entries(tagCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        };
      })
    );
  }

  // Utility functions
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim();
  }

  private generateExcerpt(content: string, maxLength: number = 160): string {
    const text = content.replace(/[#*`]/g, '').replace(/\n/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Blog settings
  getBlogSettings(): BlogSettings {
    if (!this.isBrowser()) {
      return this.getDefaultSettings();
    }
    
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  saveBlogSettings(settings: BlogSettings): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }
    
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return of(true).pipe(delay(500));
    } catch {
      return of(false);
    }
  }

  private getDefaultSettings(): BlogSettings {
    return {
      postsPerPage: 10,
      allowComments: true,
      moderateComments: true,
      allowGuestComments: false,
      enableRss: true,
      enableSeo: true,
      defaultAuthor: {
        name: 'Janier Hernández',
        email: 'contact@cvjhero.com',
        bio: 'Desarrollador Full Stack especializado en Angular y Node.js',
        avatar: '/assets/profcafe.png'
      }
    };
  }

  // Obtener comentarios por post ID
  getCommentsByPostId(postId: string): Observable<BlogComment[]> {
    return of(this.defaultComments.filter((comment: BlogComment) => comment.postId === postId));
  }

  // Obtener posts relacionados
  getRelatedPosts(postId: string, limit: number = 3): Observable<BlogPost[]> {
    return this.posts$.pipe(
      map(posts => {
        const currentPost = posts.find(post => post.id === postId);
        if (!currentPost) return [];

        const related = posts
          .filter(post => 
            post.id !== postId && 
            post.status === 'published' &&
            (post.categories.some(cat => currentPost.categories.includes(cat)) ||
             post.tags.some(tag => currentPost.tags.includes(tag)))
          )
          .slice(0, limit);

        return related;
      })
    );
  }

  // Dar like a un post
  likePost(postId: string): Observable<void> {
    const posts = this.postsSubject.value;
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
      this.postsSubject.next([...posts]);
      this.saveToStorage();
    }
    return of(undefined);
  }

  // Incrementar vistas de un post
  incrementViews(postId: string): Observable<void> {
    const posts = this.postsSubject.value;
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.views++;
      this.postsSubject.next([...posts]);
      this.saveToStorage();
    }
    return of(undefined);
  }

  private saveToStorage(): void {
    if (!this.isBrowser()) {
      return; // No guardar en el servidor
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.postsSubject.value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}
