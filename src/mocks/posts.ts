import type { Post } from "../types";

export const posts: Post[] = [
  {
    slug: "jelly-particle-title",
    title: "让粒子标题像果冻一样回应鼠标",
    excerpt: "从文字蒙版取样开始，用局部力场与阻尼弹簧做出按压、波动和回弹。",
    category: "前端实验",
    tags: ["Canvas", "交互", "动效"],
    publishedAt: "2026-10-26",
    readTime: 6,
    featured: true,
    sections: [
      {
        heading: "先让文字变成粒子",
        paragraphs: [
          "在离屏 Canvas 上绘制标题，再读取像素蒙版。按固定间距扫描不透明像素，就能得到组成字形的一组稳定采样点。可见层绘制 0 和 1，真实标题仍留在 HTML 中提供语义。",
          "粒子记录原始位置、当前位置和速度。这样画面可以响应指针，同时保留一个明确的回位目标。",
        ],
        code: "const image = context.getImageData(0, 0, width, height);\nconst alpha = image.data[(y * width + x) * 4 + 3];\nif (alpha > 96) points.push({ x, y });",
      },
      {
        heading: "局部推压与弹性回位",
        paragraphs: [
          "指针进入粒子附近时，按距离计算一个平滑衰减的力。只影响半径内的点，力度在中心更明显，边缘逐渐消失，字形外轮廓就会像柔软材质一样被压出凹陷。",
          "弹簧把粒子拉回原位，阻尼逐帧消耗速度。鼠标快速移动时会有轻微余振，停留时则自然安静下来。",
        ],
        code: "particle.vx += (particle.homeX - particle.x) * stiffness;\nparticle.vy += (particle.homeY - particle.y) * stiffness;\nparticle.vx *= damping;\nparticle.vy *= damping;",
      },
      {
        heading: "动效需要有边界",
        paragraphs: [
          "画布应限制像素比，离开视口或切到后台时暂停。系统启用减少动态效果后，保留静态标题即可。移动端没有悬停指针，标题仍必须完整可读。",
        ],
      },
    ],
  },
  {
    slug: "pointer-trails-canvas",
    title: "用 Canvas 画一条轻柔的彩色光痕",
    excerpt: "对指针坐标做插值，再让短寿命线段逐渐透明，避免轨迹断裂或喧宾夺主。",
    category: "前端实验",
    tags: ["Canvas", "鼠标交互"],
    publishedAt: "2026-10-21",
    readTime: 4,
    sections: [
      {
        heading: "把移动轨迹变得连续",
        paragraphs: [
          "浏览器上报的指针事件并不总是等间距。相邻位置距离较大时，可以在两点间插入若干采样点，让画面上的线条保持连贯。",
          "每个采样点拥有自己的颜色、宽度和生命值。随着生命值衰减，光痕逐渐变淡并最终从队列移除。",
        ],
      },
      {
        heading: "控制视觉强度",
        paragraphs: [
          "使用低透明度和有限的颜色数量，就能让轨迹像柔光一样留在背景里。光痕应该衬托页面主标题，而不是盖住文字或长期占据屏幕。",
        ],
      },
    ],
  },
  {
    slug: "local-first-blog-content",
    title: "前后端分离时，先把内容模型定下来",
    excerpt: "文章、标签与归档使用稳定的数据类型，模拟数据就能和未来接口平滑切换。",
    category: "架构笔记",
    tags: ["TypeScript", "API"],
    publishedAt: "2026-10-17",
    readTime: 5,
    sections: [
      {
        heading: "展示组件不关心数据从哪里来",
        paragraphs: [
          "文章列表只需要标题、摘要、标签与日期。组件通过服务层获取这些字段，底层可以先返回本地模拟数据，之后再接入 HTTP API。",
          "统一使用 slug 访问文章详情，日期使用带时区的 ISO 8601 字符串，避免列表和归档各自维护一套规则。",
        ],
        code: "interface PostSummary {\n  slug: string;\n  title: string;\n  excerpt: string;\n  publishedAt: string;\n  tags: string[];\n}",
      },
      {
        heading: "让错误状态也成为页面的一部分",
        paragraphs: [
          "空列表、搜索无结果和文章不存在都是正常状态。提前设计这些反馈，后续接入真实网络请求时就不需要临时拼接页面。",
        ],
      },
    ],
  },
  {
    slug: "motion-accessibility",
    title: "让界面动起来，也让动效可以停下来",
    excerpt: "减少动态效果设置、键盘焦点和静态回退，都是互动体验的一部分。",
    category: "设计观察",
    tags: ["无障碍", "CSS"],
    publishedAt: "2026-10-12",
    readTime: 4,
    sections: [
      {
        heading: "动效不应该成为唯一的信息渠道",
        paragraphs: [
          "标题文字应在 Canvas 之外保留语义文本。导航当前项也要通过文字或图形状态表达，不能只靠颜色变化。",
          "为系统减少动态效果设置提供静态模式，避免页面依赖持续运动来传递重要信息。",
        ],
        code: "@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    scroll-behavior: auto;\n    animation-duration: 0.01ms !important;\n  }\n}",
      },
    ],
  },
  {
    slug: "readable-code-blocks",
    title: "长文里的代码块，先照顾阅读节奏",
    excerpt: "正文宽度、行距和横向滚动处理，比增加装饰更能改善技术文章体验。",
    category: "设计观察",
    tags: ["阅读体验", "代码"],
    publishedAt: "2026-10-08",
    readTime: 3,
    sections: [
      {
        heading: "让正文保持稳定的行长",
        paragraphs: [
          "文章阅读区限制最大宽度，段落保持足够行距，代码块则允许局部横向滚动。这样长代码不会把整个页面撑宽，也不会挤压普通正文。",
        ],
      },
    ],
  },
  {
    slug: "static-blog-deploy",
    title: "从本地预览到云服务器部署",
    excerpt: "先构建静态文件，再由 Nginx 提供页面；接口路径可以留给后端服务。",
    category: "架构笔记",
    tags: ["部署", "Nginx"],
    publishedAt: "2026-10-02",
    readTime: 5,
    sections: [
      {
        heading: "前端构建产物是静态文件",
        paragraphs: [
          "Vite 生产构建会生成 HTML、JavaScript、CSS 和静态资源。把这些文件放到服务器目录后，Nginx 可以负责静态文件和历史路由回退。",
          "如果前后端部署在同一台服务器，Nginx 还可以把 /api 请求转发给后端服务。开发阶段先保持 API 服务独立，避免把部署假设写进页面组件。",
        ],
      },
    ],
  },
];
