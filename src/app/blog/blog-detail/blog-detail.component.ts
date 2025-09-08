import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogComment } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  post: BlogPost | null = null;
  comments: BlogComment[] = [];
  relatedPosts: BlogPost[] = [];
  isLoading = true;
  slug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.slug = params['slug'];
        this.loadPost();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPost(): void {
    this.isLoading = true;
    
    this.blogService.getPostBySlug(this.slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          if (post) {
            this.post = post;
            this.loadComments();
            this.loadRelatedPosts();
          } else {
            this.router.navigate(['/blog']);
          }
        },
        error: (error) => {
          console.error('Error loading post:', error);
          this.router.navigate(['/blog']);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private loadComments(): void {
    if (!this.post) return;
    
    this.blogService.getCommentsByPostId(this.post.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => {
        this.comments = comments;
      });
  }

  private loadRelatedPosts(): void {
    if (!this.post) return;
    
    this.blogService.getRelatedPosts(this.post.id, 3)
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.relatedPosts = posts;
      });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  onLike(): void {
    if (!this.post) return;
    
    this.blogService.likePost(this.post.id).subscribe(() => {
      if (this.post) {
        this.post.likes++;
      }
    });
  }

  onShare(platform: string): void {
    if (!this.post) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.post.title);
    const text = encodeURIComponent(this.post.excerpt);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'frontend': '#3b82f6',
      'backend': '#10b981',
      'angular': '#dc2626',
      'javascript': '#f59e0b',
      'typescript': '#0ea5e9',
      'css': '#8b5cf6',
      'html': '#ef4444',
      'tutorial': '#06b6d4',
      'tips': '#84cc16',
      'herramientas': '#6366f1'
    };
    return colors[category.toLowerCase()] || '#6b7280';
  }

  trackByCommentId(index: number, comment: BlogComment): string {
    return comment.id;
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id;
  }
}
