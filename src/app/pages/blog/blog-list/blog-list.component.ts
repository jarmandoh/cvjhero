import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { BlogService } from '../../../services/blog.service';
import { BlogPost, BlogCategory, BlogTag, SearchResult, BlogFilters } from '../../../models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit, OnDestroy {
  posts: BlogPost[] = [];
  featuredPosts: BlogPost[] = [];
  categories: BlogCategory[] = [];
  tags: BlogTag[] = [];
  
  searchResult: SearchResult | null = null;
  isLoading = false;
  
  // Filters
  currentFilters: BlogFilters = {
    page: 1,
    limit: 6
  };
  
  searchTerm = '';
  selectedCategory = '';
  selectedTag = '';
  
  private destroy$ = new Subject<void>();

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    combineLatest([
      this.blogService.getFeaturedPosts(),
      this.blogService.getAllCategories(),
      this.blogService.getAllTags()
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([featured, categories, tags]) => {
        this.featuredPosts = featured;
        this.categories = categories;
        this.tags = tags;
      }
    });
  }

  private loadPosts(): void {
    this.isLoading = true;
    
    this.blogService.searchPosts(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.searchResult = result;
          this.posts = result.posts;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentFilters = {
      ...this.currentFilters,
      search: this.searchTerm || undefined,
      page: 1
    };
    this.loadPosts();
  }

  onCategoryFilter(categorySlug: string): void {
    this.selectedCategory = categorySlug;
    this.currentFilters = {
      ...this.currentFilters,
      category: categorySlug || undefined,
      page: 1
    };
    this.loadPosts();
  }

  onTagFilter(tagSlug: string): void {
    this.selectedTag = tagSlug;
    this.currentFilters = {
      ...this.currentFilters,
      tag: tagSlug || undefined,
      page: 1
    };
    this.loadPosts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedTag = '';
    this.currentFilters = {
      page: 1,
      limit: 6
    };
    this.loadPosts();
  }

  loadMore(): void {
    if (this.searchResult?.hasMore) {
      this.currentFilters.page = (this.currentFilters.page || 1) + 1;
      this.isLoading = true;
      
      this.blogService.searchPosts(this.currentFilters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.searchResult = {
              ...result,
              posts: [...this.posts, ...result.posts]
            };
            this.posts = this.searchResult.posts;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id;
  }

  trackByCategoryId(index: number, category: BlogCategory): string {
    return category.id;
  }

  trackByTagId(index: number, tag: BlogTag): string {
    return tag.id;
  }
}
