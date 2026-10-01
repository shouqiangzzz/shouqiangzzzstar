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
  Github
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
import { PublishModal } from './components/PublishModal';
import { CartDrawer } from './components/CartDrawer';
import { PlantedGrassDrawer } from './components/PlantedGrassDrawer';

import { INITIAL_POSTS, INITIAL_PRODUCTS, INITIAL_STORIES } from './data/initialData';
import { LifePost, ProductItem, StoryItem, CartItem, OrderItem, Comment, ProductCategory, PostCategory } from './types';

export default function App() {
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
  const [activeTab, setActiveTab] = useState<'all' | 'life' | 'products' | 'stories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedPostCategory, setSelectedPostCategory] = useState<string>('all');
  const [selectedPostMedia, setSelectedPostMedia] = useState<string>('all');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [productSortBy, setProductSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Modal states
  const [selectedPost, setSelectedPost] = useState<LifePost | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  const [isShareStoryOpen, setIsShareStoryOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlantedOpen, setIsPlantedOpen] = useState(false);

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

  const handleAddPostComment = (postId: string, comment: Comment) => {
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [comment, ...prev.comments] } : null
      );
    }
  };

  const handleAddProductComment = (productId: string, comment: Comment) => {
    setProducts((currentProds) =>
      currentProds.map((prod) =>
        prod.id === productId ? { ...prod, comments: [comment, ...prod.comments] } : prod
      )
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, comments: [comment, ...prev.comments] } : null
      );
    }
  };

  const handleAddStoryComment = (storyId: string, comment: Comment) => {
    setStories((currentStories) =>
      currentStories.map((s) =>
        s.id === storyId ? { ...s, comments: [comment, ...s.comments] } : s
      )
    );
    if (selectedStory && selectedStory.id === storyId) {
      setSelectedStory((prev) =>
        prev ? { ...prev, comments: [comment, ...prev.comments] } : null
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

  const handleCheckoutSuccess = (order: OrderItem) => {
    setOrders((prev) => [order, ...prev]);
  };

  // Add items from modal
  const handleAddNewPost = (newPost: LifePost) => {
    setPosts((prev) => [newPost, ...prev]);
    setActiveTab('life');
  };

  const handleAddNewProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
    setActiveTab('products');
  };

  const handleAddNewStory = (newStory: StoryItem) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveTab('stories');
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
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPlanted={() => setIsPlantedOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
              正在搜索关键词：“<span className="font-bold">{searchQuery}</span>”，找到 {filteredPosts.length} 篇经历、{filteredProducts.length} 件好物、{filteredStories.length} 则故事。
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

            {/* Section 2: Curated Products Market Showcase */}
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

            {/* Section 3: Community Stories Wall Showcase */}
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
                  生活日常 · 深度学习与经历
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
        {/* TAB 3: CURATED PRODUCTS MARKET */}
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
        {/* TAB 4: STORIES WALL */}
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
              <h4 className="text-white font-semibold text-xs tracking-wider">好物品类快速通道</h4>
              <ul className="space-y-1 text-stone-400">
                <li><button onClick={() => { setActiveTab('products'); setSelectedProductCategory('electronics'); }} className="hover:text-amber-400">4K便携屏与客制化外设</button></li>
                <li><button onClick={() => { setActiveTab('products'); setSelectedProductCategory('books'); }} className="hover:text-amber-400">《CSAPP》与深度工作读物</button></li>
                <li><button onClick={() => { setActiveTab('products'); setSelectedProductCategory('snacks'); }} className="hover:text-amber-400">云南冷萃冻干与草原黄牛肉</button></li>
                <li><button onClick={() => { setActiveTab('products'); setSelectedProductCategory('travel'); }} className="hover:text-amber-400">川西318与云南旅居路书</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs tracking-wider">互动与交流社区</h4>
              <ul className="space-y-1 text-stone-400">
                <li><button onClick={() => setIsShareStoryOpen(true)} className="hover:text-rose-400">投递/分享你的故事</button></li>
                <li><button onClick={() => setIsPlantedOpen(true)} className="hover:text-rose-400">查看我的种草清单 ({plantedProductIds.length})</button></li>
                <li><button onClick={() => setIsPublishOpen(true)} className="hover:text-amber-400">创作者发布工作室</button></li>
                <li><button onClick={() => setIsCartOpen(true)} className="hover:text-amber-400">我的购物车与订单 ({orders.length})</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
            <span>© 2026 Shouqiang (shouqiangzzz). All rights reserved. Licensed under MIT.</span>
            <span>Made with Care for Creators, Readers & Explorers ✨</span>
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

      <ShareStoryModal
        isOpen={isShareStoryOpen}
        onClose={() => setIsShareStoryOpen(false)}
        onSubmit={handleAddNewStory}
      />

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onAddPost={handleAddNewPost}
        onAddProduct={handleAddNewProduct}
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
    </div>
  );
}
