import { LifePost, ProductItem, StoryItem, StudyInsight } from '../types';

export const INITIAL_POSTS: LifePost[] = [
  {
    id: 'post-1',
    title: '我的2026全栈进化史：从底层探索到全域数字创造',
    category: 'study',
    date: '2026-09-18',
    location: '杭州 · 理想书房',
    summary: '梳理过去三年来从计算机底层架构到构建全栈应用、独立创造的系统认知与技术跃迁，附学习路径与实战反思。',
    content: `
### 引言：在复杂系统中寻找优雅的秩序

过去这几年，我的学习重点逐渐从“实现某个单一功能”转向了“从第一性原理理解系统演进”。编程不仅是写出代码，更是对思考模型、工程边界和用户体验的终极折射。

#### 1. 深度学习的三大支柱
- **系统底层意识**：无论前端框架如何更迭，计算机底层关于并发、内存模型、网络协议栈（QUIC/HTTP3）以及渲染流水线的本质从未改变。
- **工具链掌控力**：在工程中构建严谨的类型系统、模块解耦与自动化流水线，能将心智负担降低80%以上。
- **全栈产品思维**：从数据建模、安全防护（OAuth/RBAC）、到极致流畅的响应式微交互，每一次技术选型都必须服务于最终真实用户的价值体验。

#### 2. 我的每日沉浸式学习法
每天清晨6:30至8:30是我固定的“深度心流时间”，不碰手机，只读高密度经典书籍与开源工程源码。接着在白板上画出系统时序图，最后通过手写最小可行原型（PoC）验证。

坚持记录与输出，就是最好的学习放大器！
    `,
    mediaType: 'mixed',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:15',
    tags: ['技术学习', '系统架构', '全栈开发', '成长反思'],
    likesCount: 128,
    bookmarksCount: 64,
    isFeatured: true,
    comments: [
      {
        id: 'c1',
        author: '极客星人',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        content: '总结得太深刻了！特别是“深入第一性原理理解系统”这一点，深有同感。',
        date: '2026-09-19',
        likes: 14
      },
      {
        id: 'c2',
        author: '晨曦代码',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content: '想请教博主早起学习的方法，如何保持精力充沛？',
        date: '2026-09-20',
        likes: 6
      }
    ]
  },
  {
    id: 'post-2',
    title: '川西318国道自驾随笔：雪山、垭口与旷野的心灵洗礼',
    category: 'life',
    date: '2026-08-12',
    location: '四川 · 折多山 / 鱼子西 / 贡嘎群峰',
    summary: '用7天时间穿越甘孜高原，在海拔4200米守候日照金山。记录沿途的人文温度、自驾心得与摄影机位。',
    content: `
### 旷野的呼唤：在海拔四千米遇见纯粹

从成都出发沿雅叶高速一路向西，穿过二郎山隧道的那一刻，阳光瞬间倾泻而下，川西那苍茫雄浑的气魄扑面而来。

#### 1. 鱼子西的日照金山
傍晚18:45，气温骤降至零下2度。狂风在耳边呼啸，但当贡嘎雪山主峰被夕阳镀上一层玫瑰金的光芒时，周围所有人都不约而同屏住了呼吸。那是大自然最神圣的诗篇。

#### 2. 自驾注意事项与避坑指南
- **高反预防**：前两天切忌剧烈奔跑和洗澡，备好便携式氧气瓶和布洛芬。
- **路况与驾驶**：折多山垭口常年易有暗冰与大雾，一定要保持安全车距，下坡切勿长时间深踩刹车，多用发动机制动。
- **环保承诺**：带走自己的所有垃圾，绝不向草甸丢弃塑料制品，守护圣洁净土。
    `,
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '0:15',
    tags: ['川西自驾', '日照金山', '摄影记录', '户外旅行'],
    likesCount: 245,
    bookmarksCount: 119,
    isFeatured: true,
    comments: [
      {
        id: 'c3',
        author: '山野漫游家',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        content: '拍得太震撼了！视频里的云海翻滚简直绝美，十一我也准备冲了！',
        date: '2026-08-14',
        likes: 21
      }
    ]
  },
  {
    id: 'post-3',
    title: '我的极简高效工作台：2026居家数字生产力进化',
    category: 'tech',
    date: '2026-07-05',
    location: '上海 · 创客空间',
    summary: '历经三次迭代的桌面配置，兼顾代码开发、写作与影音剪辑，减少视线干扰，提升每天的专注心流。',
    content: `
### 桌面哲学：消除物理杂乱，专注精神输出

桌子是思维的物理延伸。一个整洁、响应迅速、光源温和的环境，能将工作阻力降到最低。

#### 核心搭建要素
1. **统一单线连接**：一根全功能雷电4线缆解决视频输出、96W供电与千兆网络，桌面看不到杂乱飞线。
2. **人体工学护脊**：升降桌配合人体工学椅，遵循45分钟站立/坐姿交替节律，腰部完全不再酸痛。
3. **暖调光影氛围**：背面4000K无频闪屏幕挂灯搭配柔光氛围灯带，深夜创作眼睛毫不疲劳。
    `,
    mediaType: 'image',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['数字生产力', '桌面搭配', '极简生活', '居家办公'],
    likesCount: 92,
    bookmarksCount: 53,
    comments: []
  },
  {
    id: 'post-4',
    title: '连续晨跑第500天里程碑：自律如何重塑一个人的精神面貌',
    category: 'milestone',
    date: '2026-05-20',
    location: '西湖 · 白堤晨曦',
    summary: '从最初气喘吁吁的3公里，到跑完半程马拉松。跑步教会我最有价值的事情是对困难的平静接纳。',
    content: `
晨跑不再只是一项运动，它是我与清晨的城市、微风与自己内心最坦诚的对话。

当你跑完第5公里，多巴胺与内啡肽分泌交织，所有的焦虑与思维卡点都在奔跑的呼吸中迎刃而解。自律不是强迫自己受苦，而是发现一种更轻盈、更有力量的生活节奏。
    `,
    mediaType: 'image',
    coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['晨跑自律', '生活里程碑', '健康活力', '心力锻炼'],
    likesCount: 167,
    bookmarksCount: 88,
    comments: []
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  // 1. 电子产品
  {
    id: 'prod-1',
    name: '15.6英寸4K OLED轻薄便携显示屏 (广色域/触控全功能Type-C)',
    category: 'electronics',
    price: 1399,
    originalPrice: 1699,
    rating: 4.9,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '数码好物',
    badge: '博主同款自用 2年+',
    highlightReason: '出差、咖啡馆写代码、微距修图必备神器。纯黑像素级控光，100% DCI-P3专业色域，一根Type-C直连手机和笔记本。',
    description: '采用高素质原厂三星OLED面板，分辨率3840x2160，最高峰值亮度550nit。重量仅680g，薄至5.2mm，CNC一体精雕铝合金机身。配备双全功能Type-C接口及Mini-HDMI，支持反向充电。无论连接MacBook、Windows轻薄本还是Switch游戏机，色彩纯净惊艳。',
    specs: {
      '屏幕尺寸': '15.6 英寸',
      '面板材质': '4K Samsung OLED',
      '色域覆盖': '100% DCI-P3 / 10-bit',
      '机身重量': '约 680g',
      '接口配置': '全功能Type-C x2, Mini HDMI x1, 3.5mm耳机孔'
    },
    inStock: true,
    likesCount: 182,
    plantedCount: 96,
    comments: [
      {
        id: 'cp1',
        author: '前端小张',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        content: '跟着博主买了同款，带去图书馆写代码爽翻了，双屏生产力翻倍！',
        date: '2026-09-22',
        likes: 8
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Gasket客制化机械键盘 (三模连接/厂润静音轴/PBT热升华键帽)',
    category: 'electronics',
    price: 389,
    originalPrice: 459,
    rating: 4.8,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '指尖艺术',
    badge: '敲击音天花板',
    highlightReason: '声音犹如石子雨，手感软弹温润。办公室或者宿舍深夜敲代码绝不扰人，4000mAh大电池续航两个月。',
    description: '采用75%黄金紧凑配列，保留独立方向键与旋钮。多层消音结构（Poron夹心棉+IXPE轴下垫+PET声优垫+硅胶底垫），全键热插拔，兼容3脚与5脚机械轴体。',
    specs: {
      '连接方式': '有线 Type-C / 蓝牙 5.2 / 2.4G无线',
      '轴体': '客制化出厂精润声优线性轴',
      '电池容量': '4000mAh 锂电池',
      '键帽材质': '加厚PBT原厂高度耐磨热升华'
    },
    inStock: true,
    likesCount: 145,
    plantedCount: 78,
    comments: []
  },

  // 2. 书籍
  {
    id: 'prod-3',
    name: '《深入理解计算机系统 (CSAPP) 原书第3版 精读笔记版》',
    category: 'books',
    price: 139,
    originalPrice: 179,
    rating: 5.0,
    reviewsCount: 320,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '技术经典',
    badge: '程序员必读镇山之作',
    highlightReason: '打通你对计算机底层软件与硬件协同的任督二脉。附博主个人精读高光手写笔记与课后实验实验手册导读。',
    description: '从程序员的视角出发，深度剖析硬件、指令集体系结构、编译器优化、存储器层次结构、链接、异常控制流、虚拟内存与系统级I/O。无论做业务层还是系统开发，读透它能让你看穿所有运行时的黑盒。',
    specs: {
      '作者': 'Randal E. Bryant / David R. O\'Hallaron',
      '出版社': '机械工业出版社',
      '页数': '737 页',
      '随书附赠': '博主手写全书思维导图 + 12个核心Lab调试代码'
    },
    inStock: true,
    likesCount: 290,
    plantedCount: 185,
    comments: [
      {
        id: 'cp2',
        author: 'CS大三学子',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content: '附赠的导读笔记救了我一命，Data Lab和Cache Lab终于做通了！',
        date: '2026-09-15',
        likes: 12
      }
    ]
  },
  {
    id: 'prod-4',
    name: '《深度工作 (Deep Work)：在浮躁时代专注成功的黄金法则》',
    category: 'books',
    price: 49,
    originalPrice: 59,
    rating: 4.9,
    reviewsCount: 168,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '思维成长',
    badge: '对抗碎片化信息利器',
    highlightReason: '彻底治好了我的手机短视频依赖与精力涣散。教你如何在无干扰状态下从事职业活动，创造真实持久价值。',
    description: '麻省理工计算机博士Cal Newport重磅力作。本书不仅分析了浅薄工作在当下环境中的诱惑与危害，更提出了四条切实可行的深度工作实践法则，帮你夺回时间与注意力主导权。',
    specs: {
      '作者': '卡尔·纽波特 (Cal Newport)',
      '译者': '宋伟',
      '装帧': '精装典藏版',
      '适读人群': '知识工作者、学生、终身学习者'
    },
    inStock: true,
    likesCount: 162,
    plantedCount: 110,
    comments: []
  },

  // 3. 零食
  {
    id: 'prod-5',
    name: '云南保山冷萃冻干无蔗糖纯黑咖啡粉 (24颗礼盒装/0糖0脂)',
    category: 'snacks',
    price: 79,
    originalPrice: 99,
    rating: 4.9,
    reviewsCount: 240,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '工位续命',
    badge: '每天清晨与熬夜伴侣',
    highlightReason: '100%阿拉比卡咖啡豆，零下40度航天级FD宇航冻干。3秒溶于冰水、燕麦奶或椰乳，口感醇厚回甘，无任何酸涩感。',
    description: '产自北纬25°云南保山高山小粒咖啡庄园。深烘焙工艺激发坚果与黑巧克力的浓郁风味。小罐便携保鲜，随时随地在办公室、自习室或露营时来一杯高品质鲜萃级美式。',
    specs: {
      '配料': '100% 云南高山阿拉比卡咖啡豆',
      '净含量': '2g x 24颗 (48g)',
      '保质期': '540 天',
      '冲调方式': '冷水/温水/牛奶/气泡水 3秒即溶'
    },
    inStock: true,
    likesCount: 230,
    plantedCount: 142,
    comments: []
  },
  {
    id: 'prod-6',
    name: '内蒙古呼伦贝尔原切风干手撕风干原味牛肉干 (低盐高蛋白/500g)',
    category: 'snacks',
    price: 118,
    originalPrice: 148,
    rating: 4.8,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '解馋解压',
    badge: '纯正草饲黄牛肉',
    highlightReason: '自习、熬夜写代码、户外徒步时的最佳优质蛋白补充！九成风干，肉丝分明，越嚼越香。',
    description: '选用纯正呼伦贝尔草原黄牛后腿米龙部位，传统古法天然风干，仅添加食用盐与天然香辛料，无添加防腐剂与淀粉充数。每100g含蛋白质高达52g以上。',
    specs: {
      '产地': '内蒙古呼伦贝尔',
      '干度': '九成干 (手撕纤维分明)',
      '规格': '500g 独立真空小包',
      '配料': '优质黄牛肉、饮用水、食用盐、天然香料'
    },
    inStock: true,
    likesCount: 175,
    plantedCount: 95,
    comments: []
  },

  // 4. 旅游攻略
  {
    id: 'prod-7',
    name: '《2026川西川藏南线7天6晚保姆级深度路书 & 摄影机位电子攻略》',
    category: 'travel',
    price: 39.9,
    originalPrice: 69.9,
    rating: 5.0,
    reviewsCount: 420,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '原创自驾路书',
    badge: '400+人亲测 0踩坑',
    highlightReason: '博主亲自踏勘自驾4次打磨成型！包含精确到米级的独家免费摄影机位、避坑加油站、高反平稳适应节奏与应急联络卡。',
    description: '购买后立即可在网页端查看全彩高清电子版，支持一键下载PDF离线手机查看。内含：每日公里数/海拔爬升表、高反预防指南、绝美日照金山最佳观测时间表、无人机限飞与拍摄报备提示、藏地文化习俗注意。',
    specs: {
      '格式': '高清全彩交互版 + PDF离线下载',
      '页数': '86 页完整详实攻略',
      '包含内容': '高德/腾讯地图点位离线导入包 + 摄影航拍指南',
      '售后支持': '可加入专属川西自驾交流讨论社群'
    },
    inStock: true,
    likesCount: 388,
    plantedCount: 260,
    comments: [
      {
        id: 'cp3',
        author: '摄影师阿远',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        content: '太详尽了！路书里给的格底拉姆和鱼子西秘密机位避开了90%的游客大巴，拍到了人生照片！',
        date: '2026-09-08',
        likes: 19
      }
    ]
  },
  {
    id: 'prod-8',
    name: '《云南慢调旅居指南：大理·沙溪·丽江白沙古镇自由行手札》',
    category: 'travel',
    price: 29.9,
    originalPrice: 49.9,
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    ],
    tag: '数字游民旅居',
    badge: '治愈精神内耗指南',
    highlightReason: '远离千篇一律的商业化步行街。带你走进沙溪古镇周五热闹集市、洱海西岸骑行野草甸、白沙古镇咖啡馆看玉龙雪山。',
    description: '博主旅居云南2个月的沉淀之作。精选30家安静适合办公的咖啡馆与书店、特色白族手艺人家访体验、高性价比长租院落筛选技巧。',
    specs: {
      '格式': '全彩电子攻略 + 地图点位标记',
      '适宜人群': '自由职业者、旅居爱好者、慢节奏度假游客',
      '特别附赠': '当地特色美食私房清单（去除非本地人口碑店）'
    },
    inStock: true,
    likesCount: 215,
    plantedCount: 130,
    comments: []
  }
];

export const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: '从文科跨考计算机：28岁那年，我决定重启人生程序',
    author: '林溪清',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    roleBadge: '社区好友 / 转行工程师',
    date: '2026-09-25',
    category: '学习蜕变',
    summary: '28岁辞去体制内文职，零基础自学前端与算法。经历了怀疑、失眠与上千次报错，如今终于成为心怀热爱的主力开发。',
    content: `
如果你问我这辈子做过最勇敢的决定是什么，那一定是在28岁生日那天，向自己承诺：不再为了所谓“稳定”而消耗对技术世界的好奇心。

#### 1. 冰冷的命令行与最初的热烈
刚开始学JavaScript时，一个闭包概念我能盯着代码发呆整整一下午。很多次调试到凌晨3点，看着终端红色的Error，眼泪忍不住在眼眶里打转。但我告诉自己：计算机从不骗人，它报错是因为你还没完全理解它。

#### 2. 在Shouqiang的博客找到灵感
那段时间经常看博主分享的架构思维和深度学习法，慢慢学会了不再浮躁地刷题，而是静下心来手写底层原理。现在我已经入职心仪的互联网公司半年了，生活充满了探索与创造的愉悦。

想告诉每一个心怀梦想的朋友：任何时候开始，都不算晚！
    `,
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    tags: ['人生重启', '转行编程', '女性力量', '学习励志'],
    likesCount: 312,
    comments: [
      {
        id: 'sc1',
        author: 'Shouqiang',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        content: '非常敬佩你的勇气与毅力！代码赋予我们改变世界的力量，愿你一直眼里有光！',
        date: '2026-09-25',
        likes: 45
      },
      {
        id: 'sc2',
        author: '梦想飞行家',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        content: '看完眼眶湿润了，我也正在准备跨考，给了我巨大的勇气！',
        date: '2026-09-26',
        likes: 18
      }
    ]
  },
  {
    id: 'story-2',
    title: '一个人带上帐篷，徒步环乌孙古道的7天生死记忆',
    author: '孤独的徒步者',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    roleBadge: '户外探险家',
    date: '2026-09-10',
    category: '野性自然',
    summary: '穿越天山深处的天堂湖，冰河齐腰深的刺骨寒冷，在群星闪耀的荒原与大自然无声对话。',
    content: `
乌孙古道，贯通天山南北的千年通道。

当你在冰冷刺骨的科克苏河中涉水而过，腿脚几乎失去知觉；当你翻越阿克布拉克达坂，突然眼前展开那一片湛蓝深邃的天堂湖时，人世间的一切烦恼都被这极致的壮丽吞噬殆尽。

我们在城市里习惯了温室与算法推荐，唯有在大自然面前，我们才能重新找回人类作为生命体最本初的野性与谦卑。
    `,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tags: ['重装徒步', '天堂湖', '户外生存', '心灵旷野'],
    likesCount: 198,
    comments: []
  },
  {
    id: 'story-3',
    title: '手冲咖啡这一年：生活节奏慢下来后，我找回了对细微事物的感知',
    author: '慢调苏苏',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    roleBadge: '生活美学达人',
    date: '2026-08-30',
    category: '生活美学',
    summary: '每天用15分钟磨豆、注水、闷蒸，看水流在咖啡粉上泛起温柔的涟漪，这是现代都市人最好的正念冥想。',
    content: `
从以前工作时只喝加浓美式为了提神，到如今享受每一粒耶加雪菲或瑰夏花果香的绽放。

水温92度、粉水比1:15、细水慢注。当香气升腾在晨光中，我学会了用心感受每一天的温热。推荐大家买博主推荐的云南高山咖啡，风味真的不输进口精品豆！
    `,
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    tags: ['手冲咖啡', '慢生活', '正念日常', '精致美学'],
    likesCount: 142,
    comments: []
  }
];

export const INITIAL_INSIGHTS: StudyInsight[] = [
  {
    id: 'insight-1',
    title: '深入理解虚拟内存机制：为什么说现代操作系统的一切优雅皆源于“地址欺骗”？',
    subject: '计算机底层',
    difficulty: '底层硬核',
    date: '2026-09-28',
    author: 'Shouqiang',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    takeaway: '虚拟内存本质上是用“空间换时间、用间接层换安全”的哲学典范。当你看懂了多级页表与TLB，就真正看穿了进程隔离的物理本质。',
    content: `
### 1. 为什么我们需要虚拟内存？
刚接触编程时，很多人以为指针存储的地址就是主板内存条上的物理针脚位置。但如果真是这样，两个进程同时写入同一地址就会造成严重的内存污染和系统崩溃。

虚拟内存（Virtual Memory）通过软硬件协作，为每一个进程提供了独享整个48位/64位巨大连续地址空间的幻觉。

### 2. 核心架构认知要点
- **页表与多级分页**：为了解决扁平单级页表占用几百兆物理内存的问题，现代x86-64采用4级或5级页表结构。未使用的虚拟内存区域甚至不需要分配中间页表，极大地节省了空间。
- **TLB（快表）的硬件加速**：内存访问本身就需要先查页表才能拿到物理地址，这本应让每次内存读写时间翻倍。但TLB命中率通常高于98%，让虚拟地址转换近乎零开销。
- **缺页异常（Page Fault）与延迟加载（mmap）**：可执行文件在启动时并不会把所有字节装入内存，而是只映射虚拟地址。只有当CPU第一次访问对应页面触发缺页中断时，内核才会从磁盘将页面换入物理内存。

### 3. 学习反思
不要害怕汇编与硬件规范。拿起《CSAPP》第9章，对照Linux内核源码写一遍简易的物理页分配模拟器，所有的模糊感都会消散。
    `,
    mediaType: 'mixed',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:15',
    tags: ['CSAPP', '虚拟内存', '操作系统内核', '底层原理'],
    likesCount: 176,
    comments: [
      {
        id: 'ic-1',
        author: 'Linux爱好者',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        content: '讲得太通透了！特别是“用间接层换安全”这一句点醒了我，很多软件架构设计思想其实就是操作系统的复现。',
        date: '2026-09-29',
        likes: 12
      }
    ]
  },
  {
    id: 'insight-2',
    title: '费曼学习法践行第1000天：如何向非技术朋友讲透分布式共识算法（Raft协议）？',
    subject: '学习方法论',
    difficulty: '进阶实战',
    date: '2026-09-22',
    author: 'Shouqiang',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    takeaway: '如果你无法用厨房做饭或者班级选班长的比喻把一个概念讲给8岁小孩听懂，说明你自己的理解还停留在死记硬背的表层。',
    content: `
### 1. 概念的重构：把分布式节点当做一群朋友
Paxos协议以晦涩难懂著称，而Raft的设计哲学就是：**为了让人类更容易理解**。

我们可以把分布式共识想象成一个3个人的徒步小队在荒野决策：
- **Leader（队长）**：负责接收大家的意见并做决策。
- **Follower（队员）**：听从队长指令，按部就班执行。
- **Candidate（竞选者）**：如果队员很久没听到队长的哨声（心跳超时），就会举手自荐：“我来当队长，大家投票！”

### 2. 保证日志一致性的双重承诺
1. **多数派胜出（Quorum）**：3个人里必须有2票赞成，新指令才被提交（Commit）。即使1个人掉线，系统依然坚不可摧。
2. **任期编号（Term）**：永远认准最新的任期，过期的旧队长重新连线后必须乖乖降级为队员。

### 3. 我的费曼心法卡片
每当读完一篇分布式论文或源码，我会在白纸上画出3个小人角色，录一段3分钟语音向朋友解释。这个过程会瞬间暴露我的知识盲区。
    `,
    mediaType: 'image',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['费曼技巧', 'Raft共识算法', '心智模型', '认知跃迁'],
    likesCount: 204,
    comments: [
      {
        id: 'ic-2',
        author: '小鹿学长',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content: '“班级选班长”的比喻太绝了！原来分布式心跳和选举这么简单易懂。',
        date: '2026-09-23',
        likes: 9
      }
    ]
  },
  {
    id: 'insight-3',
    title: 'TypeScript类型体操从抗拒到真香：类型系统即命题逻辑的工程美学',
    subject: '前端与架构',
    difficulty: '进阶实战',
    date: '2026-09-14',
    author: 'Shouqiang',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    takeaway: '静态类型不是给代码加枷锁，而是在编译期为你架设一层万无一失的防坠安全网。善用条件类型和infer，能大幅减少运行时防御代码。',
    content: `
### 1. 认知的转变：类型是一等公民的图灵完备语言
刚开始学TypeScript时，很多人把类型当做负担，甚至到处使用 \`any\`。

但真正进阶后你会发现，TS类型系统本身就是一种无副作用的纯函数式编程语言：
- 泛型是函数参数：\`type F<T> = ...\`
- 条件类型是三元运算符：\`T extends U ? X : Y\`
- \`infer\` 是模式匹配与解构赋值
- 联合类型是集合论的并集

### 2. 实战体会：类型驱动开发（TDD: Type-Driven Development）
在写任何复杂业务逻辑或API客户端之前，先把核心数据结构和请求响应类型写得精确严密。你会惊奇地发现，当类型定义完美闭环时，实际业务代码只需顺着编辑器的智能推导自然流淌。
    `,
    mediaType: 'text',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['TypeScript', '类型体操', '前端架构', '代码美学'],
    likesCount: 145,
    comments: []
  },
  {
    id: 'insight-4',
    title: '算法不刷死题的框架思维：双指针与动态规划的状态转移本质探究',
    subject: '算法思想',
    difficulty: '进阶实战',
    date: '2026-08-25',
    author: 'Shouqiang',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    takeaway: '动态规划不是玄学，它本质上就是“带备忘录的暴力搜索 + 寻找状态转移拓扑序”。分类归纳模式比盲目做500道题有用十倍。',
    content: `
### 1. 刷题的误区与破解之道
很多同学刷LeetCode容易陷入“看题解觉得会了，自己写两眼一抹黑”的窘境。其根本原因是没有抽象出算法背后的数学模型与搜索剪枝逻辑。

### 2. 动态规划的4步固定思考框架
1. **确定状态（dp数组的物理意义）**：这一步最关键。例如 \`dp[i][j]\` 到底是代表前i个物品容量为j的最大价值，还是字符串s[0..i]与p[0..j]的匹配度？
2. **推导状态转移方程**：最后一步的选择是什么？穷举所有可能性。
3. **初始化与边界条件**：0号位置或者空字符串的基本状态。
4. **确定计算遍历方向**：必须保证在计算当前状态时，所依赖的子状态已经被计算完毕。

建立这套系统思考框架后，再遇到中等或困难题目，大脑就会自动进入结构化解题状态。
    `,
    mediaType: 'image',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['动态规划', '算法框架', 'LeetCode解题法', '数学思维'],
    likesCount: 189,
    comments: []
  }
];

