export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: string[];
  tags: string[];
  coverImage?: string;
  readingTime: number; // en minutos
  views: number;
  likes: number;
  comments: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
  featured: boolean;
  sticky: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: Date;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
}

export interface BlogComment {
  id: string;
  postId: string;
  parentId?: string; // Para respuestas anidadas
  author: {
    name: string;
    email: string;
    website?: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies?: BlogComment[];
}

export interface BlogSettings {
  postsPerPage: number;
  allowComments: boolean;
  moderateComments: boolean;
  allowGuestComments: boolean;
  enableRss: boolean;
  enableSeo: boolean;
  defaultAuthor: {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
  };
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  avgReadingTime: number;
  topCategories: { name: string; count: number }[];
  topTags: { name: string; count: number }[];
}

export interface SearchResult {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  status?: string;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}
