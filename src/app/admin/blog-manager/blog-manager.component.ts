import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogCategory, BlogTag } from '../../models/blog.model';
import { MarkdownEditorComponent } from '../components/markdown-editor/markdown-editor.component';

interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  featured: boolean;
  sticky: boolean;
  coverImage?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
}

@Component({
  selector: 'app-blog-manager',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, MarkdownEditorComponent],
  templateUrl: './blog-manager.component.html',
  styleUrl: './blog-manager.component.css'
})
export class BlogManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State
  currentView: 'list' | 'edit' | 'create' | 'settings' = 'list';
  currentPost: BlogPost | null = null;
  posts: BlogPost[] = [];
  categories: BlogCategory[] = [];
  tags: BlogTag[] = [];
  
  // Forms
  postForm!: FormGroup;
  categoryForm!: FormGroup;
  tagForm!: FormGroup;
  settingsForm!: FormGroup;
  
  // Editor
  markdownContent = '';
  showPreview = true;
  
  // Filters and pagination
  searchTerm = '';
  selectedStatus: 'all' | 'draft' | 'published' | 'scheduled' = 'all';
  selectedCategory = '';
  currentPage = 1;
  pageSize = 10;
  totalPosts = 0;
  
  // Loading states
  isLoading = false;
  isSaving = false;
  
  // RSS Feed
  rssUrl = '';
  sitemapUrl = '';

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
    this.setupRouting();
    this.generateUrls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      excerpt: ['', [Validators.maxLength(300)]],
      categories: [[], Validators.required],
      tags: [[]],
      status: ['draft', Validators.required],
      publishedAt: [null],
      scheduledAt: [null],
      featured: [false],
      sticky: [false],
      coverImage: [''],
      seo: this.fb.group({
        metaTitle: ['', Validators.maxLength(60)],
        metaDescription: ['', Validators.maxLength(160)],
        keywords: [[]],
        canonicalUrl: ['', Validators.pattern(/^https?:\/\/.+/)]
      })
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [''],
      color: ['#3b82f6']
    });

    this.tagForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });

    // Auto-generate slug from title
    this.postForm.get('title')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(title => {
        if (title && !this.postForm.get('slug')?.dirty) {
          const slug = this.generateSlug(title);
          this.postForm.patchValue({ slug }, { emitEvent: false });
        }
      });

    // Auto-generate SEO meta title from title
    this.postForm.get('title')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(title => {
        const metaTitle = this.postForm.get('seo.metaTitle');
        if (title && !metaTitle?.dirty) {
          metaTitle?.patchValue(title.substring(0, 60), { emitEvent: false });
        }
      });

    // Auto-generate excerpt from content
    this.postForm.get('content')?.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(content => {
        const excerpt = this.postForm.get('excerpt');
        if (content && !excerpt?.dirty) {
          const generatedExcerpt = this.blogService.generateExcerpt(content, 160);
          excerpt?.patchValue(generatedExcerpt, { emitEvent: false });
        }
      });
  }

  private setupRouting(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadPost(params['id']);
        this.currentView = 'edit';
      } else if (this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path === 'new') {
        this.currentView = 'create';
        this.createNewPost();
      }
    });
  }

  private generateUrls(): void {
    const baseUrl = window.location.origin;
    this.rssUrl = `${baseUrl}/api/rss.xml`;
    this.sitemapUrl = `${baseUrl}/api/sitemap.xml`;
  }

  private loadData(): void {
    this.isLoading = true;

    // Load posts
    this.blogService.posts$.pipe(takeUntil(this.destroy$)).subscribe(posts => {
      this.posts = posts;
      this.totalPosts = posts.length;
      this.isLoading = false;
    });

    // Load categories
    this.blogService.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      this.categories = categories;
    });

    // Load tags
    this.blogService.tags$.pipe(takeUntil(this.destroy$)).subscribe(tags => {
      this.tags = tags;
    });
  }

  // Post management
  createNewPost(): void {
    this.currentPost = null;
    this.postForm.reset({
      status: 'draft',
      featured: false,
      sticky: false,
      categories: [],
      tags: [],
      seo: {
        keywords: []
      }
    });
    this.markdownContent = '';
    this.currentView = 'create';
  }

  loadPost(id: string): void {
    this.blogService.getPostById(id).subscribe(post => {
      if (post) {
        this.currentPost = post;
        this.postForm.patchValue({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          categories: post.categories,
          tags: post.tags,
          status: post.status,
          publishedAt: post.publishedAt,
          scheduledAt: post.scheduledAt,
          featured: post.featured,
          sticky: post.sticky,
          coverImage: post.coverImage,
          seo: post.seo
        });
        this.markdownContent = post.content;
      }
    });
  }

  savePost(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    this.isSaving = true;
    const formData: BlogPostFormData = this.postForm.value;

    if (this.currentPost) {
      // Update existing post
      this.blogService.updatePost(this.currentPost.id, {
        ...formData,
        readingTime: this.blogService.calculateReadingTime(formData.content)
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/admin/blog']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating post:', error);
        }
      });
    } else {
      // Create new post
      this.blogService.createPost({
        ...formData,
        author: {
          name: 'Admin',
          email: 'admin@cvjhero.com'
        },
        readingTime: this.blogService.calculateReadingTime(formData.content)
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/admin/blog']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error creating post:', error);
        }
      });
    }
  }

  deletePost(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      this.blogService.deletePost(id).subscribe(() => {
        if (this.currentPost?.id === id) {
          this.router.navigate(['/admin/blog']);
        }
      });
    }
  }

  // Markdown editor handlers
  onMarkdownChange(content: string): void {
    this.markdownContent = content;
    this.postForm.patchValue({ content });
  }

  onMarkdownSave(content: string): void {
    this.markdownContent = content;
    this.postForm.patchValue({ content });
    this.savePost();
  }

  // Category management
  createCategory(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }

    const categoryData = this.categoryForm.value;
    this.blogService.createCategory(categoryData).subscribe(() => {
      this.categoryForm.reset();
    });
  }

  // Tag management
  createTag(): void {
    if (this.tagForm.invalid) {
      this.markFormGroupTouched(this.tagForm);
      return;
    }

    const tagData = this.tagForm.value;
    this.blogService.createTag(tagData).subscribe(() => {
      this.tagForm.reset();
    });
  }

  // RSS Feed management
  generateRSSFeed(): void {
    const options = {
      title: 'CVJHero Blog',
      description: 'Artículos sobre desarrollo web, tecnología y programación',
      link: window.location.origin,
      language: 'es-ES',
      managingEditor: 'admin@cvjhero.com',
      webMaster: 'admin@cvjhero.com',
      copyright: `© ${new Date().getFullYear()} CVJHero`,
      maxItems: 20
    };

    this.blogService.generateRSSFeed(options).subscribe(rssXml => {
      this.downloadFile(rssXml, 'rss.xml', 'application/rss+xml');
    });
  }

  generateSitemap(): void {
    const baseUrl = window.location.origin;
    this.blogService.generateSitemap(baseUrl).subscribe(sitemapXml => {
      this.downloadFile(sitemapXml, 'sitemap.xml', 'application/xml');
    });
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for template
  get filteredPosts(): BlogPost[] {
    return this.posts.filter(post => {
      const matchesSearch = !this.searchTerm || 
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || post.status === this.selectedStatus;
      
      const matchesCategory = !this.selectedCategory || post.categories.includes(this.selectedCategory);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  get paginatedPosts(): BlogPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize);
  }

  // Additional methods for template
  onCategoryChange(event: Event, categoryName: string): void {
    const target = event.target as HTMLInputElement;
    const categories = this.postForm.get('categories')?.value || [];
    
    if (target.checked) {
      this.postForm.patchValue({ categories: [...categories, categoryName] });
    } else {
      this.postForm.patchValue({ 
        categories: categories.filter((cat: string) => cat !== categoryName) 
      });
    }
  }

  addTag(event: Event): void {
    const target = event.target as HTMLInputElement;
    const tagName = target.value.trim();
    
    if (tagName && !this.postForm.get('tags')?.value?.includes(tagName)) {
      const currentTags = this.postForm.get('tags')?.value || [];
      this.postForm.patchValue({ tags: [...currentTags, tagName] });
      target.value = '';
    }
  }

  removeTag(tagToRemove: string): void {
    const currentTags = this.postForm.get('tags')?.value || [];
    this.postForm.patchValue({ 
      tags: currentTags.filter((tag: string) => tag !== tagToRemove) 
    });
  }
}