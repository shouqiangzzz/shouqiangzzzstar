export type MediaType = 'image' | 'video' | 'mixed' | 'text';

export type PostCategory = 'life' | 'study' | 'milestone' | 'tech';

export type ProductCategory = 'electronics' | 'books' | 'snacks' | 'travel';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  date: string;
  likes: number;
}

export interface LifePost {
  id: string;
  title: string;
  category: PostCategory;
  date: string;
  location?: string;
  summary: string;
  content: string;
  mediaType: MediaType;
  coverImage: string;
  images: string[];
  videoUrl?: string;
  videoDuration?: string;
  tags: string[];
  likesCount: number;
  bookmarksCount: number;
  comments: Comment[];
  isFeatured?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  tag: string;
  highlightReason: string;
  description: string;
  specs?: Record<string, string>;
  inStock: boolean;
  buyLink?: string;
  likesCount: number;
  plantedCount: number;
  comments: Comment[];
  badge?: string;
}

export interface StoryItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  roleBadge?: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  coverImage?: string;
  videoUrl?: string;
  tags: string[];
  likesCount: number;
  comments: Comment[];
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  status: 'paid' | 'shipping' | 'completed';
}

export interface StudyInsight {
  id: string;
  title: string;
  subject: string; // '计算机底层' | '前端与架构' | '算法思想' | '学习方法论' | '工程实践'
  date: string;
  author?: string;
  authorAvatar?: string;
  difficulty?: '入门探索' | '进阶实战' | '底层硬核';
  takeaway: string; // 核心顿悟
  content: string;
  mediaType: MediaType;
  coverImage?: string;
  images?: string[];
  videoUrl?: string;
  videoDuration?: string;
  tags: string[];
  likesCount: number;
  comments: Comment[];
}
