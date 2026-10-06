import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  MessageSquare, 
  Heart, 
  PlusCircle, 
  Filter, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Compass,
  Star,
  CheckCircle,
  HelpCircle,
  Github,
  GraduationCap,
  Lightbulb,
  Layers,
  UserCheck,
  Database,
  ShieldCheck,
  LogIn
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { LifePostCard } from './components/LifePostCard';
import { LifePostDetailModal } from './components/LifePostDetailModal';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoryCard } from './components/StoryCard';
import { StoryDetailModal } from './components/StoryDetailModal';
import { ShareStoryModal } from './components/ShareStoryModal';
import { StudyInsightCard } from './components/StudyInsightCard';
import { StudyInsightDetailModal } from './components/StudyInsightDetailModal';
import { ShareInsightModal } from './components/ShareInsightModal';
import { PublishModal } from './components/PublishModal';
import { CartDrawer } from './components/CartDrawer';
import { PlantedGrassDrawer } from './components/PlantedGrassDrawer';
import { AuthModal } from './components/AuthModal';
import { UserProfileDrawer } from './components/UserProfileDrawer';

import { INITIAL_POSTS, INITIAL_PRODUCTS, INITIAL_STORIES, INITIAL_INSIGHTS } from './data/initialData';
import { LifePost, ProductItem, StoryItem, StudyInsight, CartItem, OrderItem, Comment, ProductCategory, PostCategory } from './types';
import { useAuth } from './context/AuthContext';
import { db, doc, setDoc, collection, onSnapshot, testFirestoreConnection } from './lib/firebase';
import { mergePublishedRows, normalizeLifePost, normalizeStory, normalizeStudyInsight, publishContent, publishedDate } from './lib/publishContent';

export default function App() {
  const { currentUser, userProfile } = useAuth();

  // Test Firestore Connection on boot (as required by Firestore skill)
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      if (connected) {
        console.log("Firebase Firestore connected successfully.");
      }
    });
  }, []);

  // Persistence state
  const [posts, setPosts] = useState<LifePost[]>(() => {
    const saved = localStorage.getItem('sq_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('sq_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stories, setStories] = useState<StoryItem[]>(() => {
    const saved = localStorage.getItem('sq_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [insights, setInsights] = useState<StudyInsight[]>(() => {
    const saved = localStorage.getItem('sq_insights');
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  const [plantedProductIds, setPlantedProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sq_planted');
    return saved ? JSON.parse(saved) : ['prod-1', 'prod-3', 'prod-7'];
  });

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sq_bookmarked');
    return saved ? JSON.parse(saved) : ['post-1'];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sq_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('sq_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'all' | 'life' | 'insights' | 'products' | 'stories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudReadErrors, setCloudReadErrors] = useState<Record<string, string>>({});
  
  // Filter states
  const [selectedPostCategory, setSelectedPostCategory] = useState<string>('all');
  const [selectedPostMedia, setSelectedPostMedia] = useState<string>('all');

  const [selectedInsightSubject, setSelectedInsightSubject] = useState<string>('all');
  const [selectedInsightDifficulty, setSelectedInsightDifficulty] = useState<string>('all');
  const [selectedInsightMedia, setSelectedInsightMedia] = useState<string>('all');

  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [productSortBy, setProductSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Modal states
  const [selectedPost, setSelectedPost] = useState<LifePost | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<StudyInsight | null>(null);

  const [isShareStoryOpen, setIsShareStoryOpen] = useState(false);
  const [isShareInsightOpen, setIsShareInsightOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlantedOpen, setIsPlantedOpen] = useState(false);

  // Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Public reads let every visitor see the original media published by other users.
  useEffect(() => {
    const subscribe = <T extends { id: string; date?: string }>(
      name: 'posts' | 'stories' | 'insights',
      label: string,
      updateRows: React.Dispatch<React.SetStateAction<T[]>>,
      updateSelected: React.Dispatch<React.SetStateAction<T | null>>,
      normalize: (data: unknown, id: string) => T | null
    ) => onSnapshot(collection(db, name), { includeMetadataChanges: true }, (snapshot) => {
      const documents = snapshot.docs
        // setDoc emits a local event before the server accepts the publish.
        .filter((item) => !item.metadata.hasPendingWrites);
      const rows = documents
        .map((item) => normalize(item.data(), item.id))
        .filter((item): item is T => item !== null)
        .sort((a, b) => publishedDate(b).localeCompare(publishedDate(a)) || a.id.localeCompare(b.id));
      const skipped = documents.length - rows.length;
      updateRows((current) => mergePublishedRows(current, rows));
      updateSelected((current) => current ? rows.find((row) => row.id === current.id) || current : null);
      setCloudReadErrors((current) => {
        if (skipped > 0) {
          return { ...current, [name]: `${label}中有 ${skipped} 条内容数据不完整，暂未显示。` };
        }
        if (!(name in current)) return current;
        const next = { ...current };
        delete next[name];
        return next;
      });
    }, (error) => {
      console.warn(`Cloud ${name} read failed:`, error);
      setCloudReadErrors((current) => ({ ...current, [name]: `${label}暂时无法同步，请检查网络或刷新后重试。` }));
    });

    const unsubscribePosts = subscribe('posts', '生活动态', setPosts, setSelectedPost, normalizeLifePost);
    const unsubscribeStories = subscribe('stories', '故事', setStories, setSelectedStory, normalizeStory);
    const unsubscribeInsights = subscribe('insights', '学习心得', setInsights, setSelectedInsight, normalizeStudyInsight);
    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeInsights();
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sq_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sq_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sq_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('sq_insights', JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem('sq_planted', JSON.stringify(plantedProductIds));
  }, [plantedProductIds]);

  useEffect(() => {
    localStorage.setItem('sq_bookmarked', JSON.stringify(bookmarkedPostIds));
  }, [bookmarkedPostIds]);

  useEffect(() => {
    localStorage.setItem('sq_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sq_orders', JSON.stringify(orders));
  }, [orders]);

  // Handlers
  const handleTogglePlant = (productId: string) => {
    setPlantedProductIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];

      // Update product's planted count
      setProducts((currentProds) =>
        currentProds.map((prod) =>
          prod.id === productId
            ? { ...prod, plantedCount: Math.max(0, prod.plantedCount + (exists ? -1 : 1)) }
            : prod
        )
      );

      return updated;
    });
  };

  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPostIds((prev) => {
      const exists = prev.includes(postId);
      const updated = exists ? prev.filter((id) => id !== postId) : [...prev, postId];

      // Update post's bookmark count
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? { ...post, bookmarksCount: Math.max(0, post.bookmarksCount + (exists ? -1 : 1)) }
            : post
        )
      );

      return updated;
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
  };

  const handleLikeStory = (storyId: string) => {
    setStories((currentStories) =>
      currentStories.map((story) =>
        story.id === storyId ? { ...story, likesCount: story.likesCount + 1 } : story
      )
    );
    if (selectedStory && selectedStory.id === storyId) {
      setSelectedStory((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
  };

  const handleLikeInsight = (insightId: string) => {
    setInsights((currentInsights) =>
      currentInsights.map((insight) =>
        insight.id === insightId ? { ...insight, likesCount: insight.likesCount + 1 } : insight
      )
    );
    if (selectedInsight && selectedInsight.id === insightId) {
      setSelectedInsight((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
  };

  const handleAddPostComment = (postId: string, comment: Comment) => {
    const finalComment = {
      ...comment,
      author: userProfile?.displayName || comment.author,
      avatar: userProfile?.photoURL || comment.avatar
    };

    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId ? { ...p, comments: [finalComment, ...p.comments] } : p
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [finalComment, ...prev.comments] } : null
      );
    }
  };

  const handleAddProductComment = (productId: string, comment: Comment) => {
    const finalComment = {
      ...comment,
      author: userProfile?.displayName || comment.author,
      avatar: userProfile?.photoURL || comment.avatar
    };

    setProducts((currentProds) =>
      currentProds.map((prod) =>
        prod.id === productId ? { ...prod, comments: [finalComment, ...prod.comments] } : prod
      )
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, comments: [finalComment, ...prev.comments] } : null
      );
    }
  };

  const handleAddStoryComment = (storyId: string, comment: Comment) => {
    const finalComment = {
      ...comment,
      author: userProfile?.displayName || comment.author,
      avatar: userProfile?.photoURL || comment.avatar
    };

    setStories((currentStories) =>
      currentStories.map((s) =>
        s.id === storyId ? { ...s, comments: [finalComment, ...s.comments] } : s
      )
    );
    if (selectedStory && selectedStory.id === storyId) {
      setSelectedStory((prev) =>
        prev ? { ...prev, comments: [finalComment, ...prev.comments] } : null
      );
    }
  };

  const handleAddInsightComment = (insightId: string, comment: Comment) => {
    const finalComment = {
      ...comment,
      author: userProfile?.displayName || comment.author,
      avatar: userProfile?.photoURL || comment.avatar
    };

    setInsights((currentInsights) =>
      currentInsights.map((ins) =>
        ins.id === insightId ? { ...ins, comments: [finalComment, ...ins.comments] } : ins
      )
    );
    if (selectedInsight && selectedInsight.id === insightId) {
      setSelectedInsight((prev) =>
        prev ? { ...prev, comments: [finalComment, ...prev.comments] } : null
      );
    }
  };

  const handleAddToCart = (product: ProductItem, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleDirectBuy = (product: ProductItem, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutSuccess = async (order: OrderItem) => {
    setOrders((prev) => [order, ...prev]);

    // Persist to Cloud Firestore if logged in
    if (currentUser) {
      try {
        await setDoc(doc(db, 'orders', order.id), {
          ...order,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Cloud order write note:", err);
      }
    }
  };

  // Add items from modals
  const handleAddNewPost = async (newPost: LifePost) => {
    const published = await publishContent(newPost, currentUser?.uid, (data) =>
      setDoc(doc(db, 'posts', newPost.id), data)
    );
    setPosts((prev) => mergePublishedRows(prev, [published]));
    setActiveTab('life');
  };

  const handleAddNewProduct = async (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
    setActiveTab('products');

    if (currentUser) {
      try {
        await setDoc(doc(db, 'products', newProduct.id), {
          ...newProduct,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Cloud product write note:", err);
      }
    }
  };

  const handleAddNewStory = async (newStory: StoryItem) => {
    const finalStory = {
      ...newStory,
      author: userProfile?.displayName || newStory.author,
      authorAvatar: userProfile?.photoURL || newStory.authorAvatar
    };

    const published = await publishContent(finalStory, currentUser?.uid, (data) =>
      setDoc(doc(db, 'stories', finalStory.id), data)
    );
    setStories((prev) => mergePublishedRows(prev, [published]));
    setActiveTab('stories');
  };

  const handleAddNewInsight = async (newInsight: StudyInsight) => {
    const finalInsight = {
      ...newInsight,
      author: userProfile?.displayName || newInsight.author,
      authorAvatar: userProfile?.photoURL || newInsight.authorAvatar
    };

    const published = await publishContent(finalInsight, currentUser?.uid, (data) =>
      setDoc(doc(db, 'insights', finalInsight.id), data)
    );
    setInsights((prev) => mergePublishedRows(prev, [published]));
    setActiveTab('insights');
  };

  // Filtered queries
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedPostCategory === 'all' || post.category === selectedPostCategory;

      const matchMedia =
        selectedPostMedia === 'all' ||
        (selectedPostMedia === 'video' && (post.mediaType === 'video' || !!post.videoUrl)) ||
        (selectedPostMedia === 'image' && post.mediaType === 'image') ||
        (selectedPostMedia === 'mixed' && post.mediaType === 'mixed');

      return matchSearch && matchCat && matchMedia;
    });
  }, [posts, searchQuery, selectedPostCategory, selectedPostMedia]);

  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      const matchSearch =
        !searchQuery ||
        ins.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.takeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSubject =
        selectedInsightSubject === 'all' || ins.subject === selectedInsightSubject;

      const matchDiff =
        selectedInsightDifficulty === 'all' || ins.difficulty === selectedInsightDifficulty;

      const matchMedia =
        selectedInsightMedia === 'all' ||
        (selectedInsightMedia === 'video' && (ins.mediaType === 'video' || !!ins.videoUrl)) ||
        (selectedInsightMedia === 'image' && (ins.mediaType === 'image' || (ins.images && ins.images.length > 0))) ||
        (selectedInsightMedia === 'text' && ins.mediaType === 'text');

      return matchSearch && matchSubject && matchDiff && matchMedia;
    });
  }, [insights, searchQuery, selectedInsightSubject, selectedInsightDifficulty, selectedInsightMedia]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((prod) => {
      const matchSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.highlightReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.tag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedProductCategory === 'all' || prod.category === selectedProductCategory;

      return matchSearch && matchCat;
    });

    if (productSortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (productSortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return [...list].sort((a, b) => b.plantedCount - a.plantedCount);
  }, [products, searchQuery, selectedProductCategory, productSortBy]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      return (
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [stories, searchQuery]);

  const plantedProducts = useMemo(() => {
    return products.filter((p) => plantedProductIds.includes(p.id));
  }, [products, plantedProductIds]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as any);
          if (searchQuery) setSearchQuery('');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        plantedCount={plantedProductIds.length}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenShareStory={() => setIsShareStoryOpen(true)}
        onOpenShareInsight={() => setIsShareInsightOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPlanted={() => setIsPlantedOpen(true)}
        onOpenAuth={(mode = 'register') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
      />

      {/* Database & User Status Bar Banner (if not logged in) */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white py-2 px-4 border-b border-indigo-900/50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                <strong>云端数据库已就绪：</strong>支持注册账号并保存专属种草清单、订单记录与学习心得
              </span>
            </div>
            <button
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] shadow-xs transition-colors"
            >
              立即注册个人账号 →
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {Object.keys(cloudReadErrors).length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {Object.values(cloudReadErrors).join(' ')}
          </div>
        )}
        {/* Hero Section */}
        {activeTab === 'all' && !searchQuery && (
          <HeroBanner
            onSelectTab={(tab) => setActiveTab(tab as any)}
            onSelectProductCategory={(cat) => {
              setActiveTab('products');
              setSelectedProductCategory(cat);
            }}
          />
        )}

        {/* Global Search Notice if active */}
        {searchQuery && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
            <div className="text-xs sm:text-sm text-amber-900">
              正在搜索关键词：“<span className="font-bold">{searchQuery}</span>”，找到 {filteredPosts.length} 篇经历、{filteredInsights.length} 则学习心得、{filteredProducts.length} 件好物、{filteredStories.length} 则故事。
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: ALL / DISCOVERY OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'all' && (
          <div className="space-y-12">
            {/* Section 1: Life & Study Posts Preview */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                    <span>生活与经历展示</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    记录求索求知路上的顿悟、川西山川湖泊自驾、数字生产力搭建与日常反思
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('life')}
                  className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group"
                >
                  <span>查看全部 ({posts.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.slice(0, 3).map((post) => (
                  <LifePostCard
                    key={post.id}
                    post={post}
                    isBookmarked={bookmarkedPostIds.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onLike={handleLikePost}
                    onOpenDetail={(p) => setSelectedPost(p)}
                  />
                ))}
              </div>
            </section>

            {/* Section 2: Study Insights Showcase */}
            <section className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full mb-1">
                    <GraduationCap className="w-3.5 h-3.5" /> 深度认知 · 学习心得
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    <span>学习心得与感悟</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    计算机底层机制、费曼学习法、现代架构与算法思维复盘，支持超清视频与图文讲解
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsShareInsightOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>分享我的心得</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="text-xs sm:text-sm font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 group"
                  >
                    <span>研读全部心得 ({insights.length})</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.slice(0, 3).map((insight) => (
                  <StudyInsightCard
                    key={insight.id}
                    insight={insight}
                    onLike={handleLikeInsight}
                    onOpenDetail={(ins) => setSelectedInsight(ins)}
                  />
                ))}
              </div>
            </section>

            {/* Section 3: Curated Products Market Showcase */}
            <section className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                    <Sparkles className="w-3 h-3" /> 博主亲身自用推荐
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-amber-600" />
                    <span>精选好物集市</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    涵盖电子数码、高分书籍、工位解压零食、保姆级旅游自驾路书，支持即刻种草与购买
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 group"
                >
                  <span>逛逛完整集市 ({products.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isPlanted={plantedProductIds.includes(product.id)}
                    onTogglePlant={handleTogglePlant}
                    onAddToCart={handleAddToCart}
                    onOpenDetail={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            </section>

            {/* Section 4: Community Stories Wall Showcase */}
            <section className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-rose-600" />
                    <span>故事分享墙</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    倾听每一位朋友的生活感悟、转行进阶与户外旷野故事，在这里交换温暖与勇气
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsShareStoryOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>分享我的故事</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('stories')}
                    className="text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 group"
                  >
                    <span>查看全部 ({stories.length})</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.slice(0, 3).map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onLike={handleLikeStory}
                    onOpenDetail={(s) => setSelectedStory(s)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LIFE & STUDY POSTS */}
        {/* ============================================================== */}
        {activeTab === 'life' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                  生活日常 · 学习历程与探索
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  支持高清视频、摄影图集、深度手札与旅行路书多格式记录
                </p>
              </div>

              <button
                onClick={() => setIsPublishOpen(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>发布新经历</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-stone-400 text-[11px] mr-1">分类:</span>
                {[
                  { id: 'all', label: '全部经历' },
                  { id: 'study', label: '深度学习' },
                  { id: 'life', label: '生活日常' },
                  { id: 'tech', label: '数码探索' },
                  { id: 'milestone', label: '人生里程碑' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPostCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0 ${
                      selectedPostCategory === cat.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Media type filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-stone-400 text-[11px] mr-1">格式:</span>
                {[
                  { id: 'all', label: '全部' },
                  { id: 'video', label: '超清视频' },
                  { id: 'image', label: '图集' },
                  { id: 'mixed', label: '图文并茂' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPostMedia(m.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedPostMedia === m.id
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-stone-200">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 text-sm font-medium">没有找到符合条件的经历随笔</p>
                <p className="text-xs text-stone-400">试试切换分类或清空筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <LifePostCard
                    key={post.id}
                    post={post}
                    isBookmarked={bookmarkedPostIds.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onLike={handleLikePost}
                    onOpenDetail={(p) => setSelectedPost(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: STUDY INSIGHTS */}
        {/* ============================================================== */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    深度认知 · 学习心得
                  </span>
                  <span className="text-xs text-stone-400">支持超清视频、架构图解与长文</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                  学习心得与思考感悟
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  分享探索计算机底层体系、分布式共识、架构设计哲学与费曼自学法的心得顿悟
                </p>
              </div>

              <button
                onClick={() => setIsShareInsightOpen(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>分享我的学习心得</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              {/* Subject Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-stone-400 text-[11px] mr-1">学科领域:</span>
                {[
                  { id: 'all', label: '全部领域' },
                  { id: '计算机底层', label: '⚡ 计算机底层' },
                  { id: '前端与架构', label: '🌐 前端与架构' },
                  { id: '算法思想', label: '🧩 算法思想' },
                  { id: '学习方法论', label: '🎯 学习方法论' },
                  { id: '工程实践', label: '🛠️ 工程实践' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedInsightSubject(s.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0 ${
                      selectedInsightSubject === s.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Difficulty and Media filters */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={selectedInsightDifficulty}
                  onChange={(e) => setSelectedInsightDifficulty(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 outline-hidden"
                >
                  <option value="all">所有难度</option>
                  <option value="入门探索">🌱 入门探索</option>
                  <option value="进阶实战">🔥 进阶实战</option>
                  <option value="底层硬核">⚡ 底层硬核</option>
                </select>

                <select
                  value={selectedInsightMedia}
                  onChange={(e) => setSelectedInsightMedia(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 outline-hidden"
                >
                  <option value="all">所有格式</option>
                  <option value="video">🎬 包含视频</option>
                  <option value="image">🖼️ 图解图集</option>
                  <option value="text">📝 纯文字手札</option>
                </select>
              </div>
            </div>

            {/* Insights Grid */}
            {filteredInsights.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-stone-200">
                <GraduationCap className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 text-sm font-medium">暂无符合条件的学习心得</p>
                <button
                  onClick={() => setIsShareInsightOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  成为第一位分享心得的人
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight) => (
                  <StudyInsightCard
                    key={insight.id}
                    insight={insight}
                    onLike={handleLikeInsight}
                    onOpenDetail={(ins) => setSelectedInsight(ins)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: CURATED PRODUCTS MARKET */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                  精选自用好物集市
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  博主亲测好物：电子数码、高分经典书籍、工位解馋零食、自驾深度路书，支持种草与直接选购
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsPlantedOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>我的种草 ({plantedProductIds.length})</span>
                </button>

                <button
                  onClick={() => setIsPublishOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>上架新好物</span>
                </button>
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-stone-400 text-[11px] mr-1">品类:</span>
                {[
                  { id: 'all', label: '全部好物' },
                  { id: 'electronics', label: '💻 电子产品' },
                  { id: 'books', label: '📚 精选书籍' },
                  { id: 'snacks', label: '☕ 严选零食' },
                  { id: 'travel', label: '🧭 旅游攻略' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedProductCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0 ${
                      selectedProductCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400 text-[11px]">排序:</span>
                <select
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value as any)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 outline-hidden"
                >
                  <option value="popular">🔥 种草热度最高</option>
                  <option value="price-asc">💰 价格由低到高</option>
                  <option value="price-desc">💎 价格由高到低</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-stone-200">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 text-sm font-medium">该类目下暂无好物</p>
                <p className="text-xs text-stone-400">试试选择其他分类或点击右上角上架商品</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isPlanted={plantedProductIds.includes(product.id)}
                    onTogglePlant={handleTogglePlant}
                    onAddToCart={handleAddToCart}
                    onOpenDetail={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: STORIES WALL */}
        {/* ============================================================== */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                  故事分享墙 · 大家的动人故事
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  欢迎每一位读者在此分享自己的学习蜕变、跨界转行、生活美学与旷野冒险
                </p>
              </div>

              <button
                onClick={() => setIsShareStoryOpen(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>我也要讲一个故事</span>
              </button>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-stone-200">
                <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 text-sm font-medium">暂无符合条件的故事</p>
                <button
                  onClick={() => setIsShareStoryOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                >
                  成为第一位故事分享者
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onLike={handleLikeStory}
                    onOpenDetail={(s) => setSelectedStory(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-10 mt-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold font-serif text-base">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ShouqiangStar (星芒生活志)</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed max-w-md">
                展示自己的生活、学习和经历。同时售卖自己用的好的一些产品，如电子产品、书籍、零食、旅游攻略，大家可以在上面进行留言、种草，同时也分享别人的一些故事。支持视频、图片、文字等多种文本格式。
              </p>
              <div className="flex items-center gap-3 pt-1 text-stone-400">
                <a 
                  href="https://github.com/shouqiangzzz/shouqiangzzzstar" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>shouqiangzzz/shouqiangzzzstar</span>
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs tracking-wider">专栏导航</h4>
              <ul className="space-y-1 text-stone-400">
                <li><button onClick={() => setActiveTab('life')} className="hover:text-emerald-400">生活日常与自驾探索</button></li>
                <li><button onClick={() => setActiveTab('insights')} className="hover:text-indigo-400">学习心得与思维复盘</button></li>
                <li><button onClick={() => setActiveTab('products')} className="hover:text-amber-400">自用好物集市与路书</button></li>
                <li><button onClick={() => setActiveTab('stories')} className="hover:text-rose-400">社区故事分享墙</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs tracking-wider">用户与创作中心</h4>
              <ul className="space-y-1 text-stone-400">
                {currentUser ? (
                  <li><button onClick={() => setIsProfileDrawerOpen(true)} className="hover:text-amber-400 text-amber-300">👤 我的用户中心 ({userProfile?.displayName})</button></li>
                ) : (
                  <li><button onClick={() => { setAuthModalMode('register'); setIsAuthModalOpen(true); }} className="hover:text-amber-400 text-amber-300">✨ 注册专属个人账号</button></li>
                )}
                <li><button onClick={() => setIsShareInsightOpen(true)} className="hover:text-indigo-400">+ 发布学习心得</button></li>
                <li><button onClick={() => setIsShareStoryOpen(true)} className="hover:text-rose-400">+ 分享人生故事</button></li>
                <li><button onClick={() => setIsPlantedOpen(true)} className="hover:text-rose-400">我的种草清单 ({plantedProductIds.length})</button></li>
                <li><button onClick={() => setIsCartOpen(true)} className="hover:text-amber-400">购物车与订单 ({orders.length})</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
            <span>© 2026 Shouqiang (shouqiangzzz). All rights reserved. Licensed under MIT.</span>
            <span>Cloud Database Active · Made with Care for Explorers ✨</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LifePostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        isBookmarked={selectedPost ? bookmarkedPostIds.includes(selectedPost.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onLike={handleLikePost}
        onAddComment={handleAddPostComment}
      />

      <StudyInsightDetailModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
        onLike={handleLikeInsight}
        onAddComment={handleAddInsightComment}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isPlanted={selectedProduct ? plantedProductIds.includes(selectedProduct.id) : false}
        onTogglePlant={handleTogglePlant}
        onAddToCart={handleAddToCart}
        onDirectBuy={handleDirectBuy}
        onAddComment={handleAddProductComment}
      />

      <StoryDetailModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onLike={handleLikeStory}
        onAddComment={handleAddStoryComment}
      />

      <ShareInsightModal
        key={`insight-${currentUser?.uid || 'guest'}`}
        isOpen={isShareInsightOpen}
        onClose={() => setIsShareInsightOpen(false)}
        onSubmit={handleAddNewInsight}
      />

      <ShareStoryModal
        key={`story-${currentUser?.uid || 'guest'}`}
        isOpen={isShareStoryOpen}
        onClose={() => setIsShareStoryOpen(false)}
        onSubmit={handleAddNewStory}
      />

      <PublishModal
        key={`publish-${currentUser?.uid || 'guest'}`}
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onAddPost={handleAddNewPost}
        onAddProduct={handleAddNewProduct}
        onAddInsight={handleAddNewInsight}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <PlantedGrassDrawer
        isOpen={isPlantedOpen}
        onClose={() => setIsPlantedOpen(false)}
        plantedProducts={plantedProducts}
        onTogglePlant={handleTogglePlant}
        onAddToCart={handleAddToCart}
        onOpenDetail={(prod) => setSelectedProduct(prod)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        plantedCount={plantedProductIds.length}
        ordersCount={orders.length}
        onOpenPlanted={() => setIsPlantedOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
