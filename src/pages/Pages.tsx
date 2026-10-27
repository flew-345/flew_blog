import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3, Search, Tag } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CursorTrailCanvas } from "../components/CursorTrailCanvas";
import { JellyTitleCanvas } from "../components/JellyTitleCanvas";
import { PostList, formatDate } from "../components/PostList";
import { Reveal } from "../components/Reveal";
import { getCategories, getPost, getPosts, getTags } from "../services/blog";
import type { Post } from "../types";

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Flew`;
    return () => {
      document.title = "Flew · 个人博客";
    };
  }, [title]);
}

export function HomePage() {
  usePageTitle("首页");
  const heroRef = useRef<HTMLElement | null>(null);
  const posts = getPosts();
  const categories = getCategories();

  return (
    <div className="home-page">
      <section className="hero" ref={heroRef}>
        <CursorTrailCanvas targetRef={heroRef} />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-topline">
            <span><i className="status-dot" /> PERSONAL NOTES</span>
            <span>技术实践 <b>·</b> 产品思考 <b>·</b> 日常观察</span>
          </div>

          <div className="hero-title-area">
            <JellyTitleCanvas />
            <span className="hero-title-index">01 — FLEW / A DIGITAL NOTEBOOK</span>
          </div>

          <div className="hero-bottom">
            <p>把正在学习、设计与构建的事，<br />慢慢写下来。</p>
            <div className="hero-actions">
              <Link className="button button-lime" to="/articles">
                浏览文章 <ArrowUpRight size={16} />
              </Link>
              <span className="hero-motion-note"><span className="motion-cross">+</span> MOVE THROUGH THE TITLE</span>
            </div>
          </div>
        </div>
        <div className="hero-side-index" aria-hidden="true">F / 2026</div>
      </section>

      <section className="content-section home-latest">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE JOURNAL / 01</span>
              <h2>最近写下的</h2>
            </div>
            <Link className="text-link" to="/articles">全部文章 <ArrowRight size={16} /></Link>
          </div>
          <PostList posts={posts.slice(0, 3)} />
        </Reveal>
      </section>

      <section className="content-section category-section">
        <Reveal>
          <div className="section-heading compact-heading">
            <div>
              <span className="section-kicker">BROWSE BY TOPIC / 02</span>
              <h2>从一个方向开始</h2>
            </div>
            <Link className="text-link" to="/categories">浏览分类 <ArrowRight size={16} /></Link>
          </div>
          <div className="category-links">
            {categories.map((category, index) => (
              <Link className="category-tile" key={category} to={`/categories/${encodeURIComponent(category)}`}>
                <span className="category-number">0{index + 1}</span>
                <span>{category}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="closing-band">
        <div className="closing-inner">
          <span className="section-kicker">KEEP EXPLORING</span>
          <p>一篇文章，一个问题，<br />再往前一点。</p>
          <Link className="round-link" to="/archive" aria-label="浏览文章归档"><ArrowDown size={18} /></Link>
        </div>
      </section>
    </div>
  );
}

export function ArticlesPage() {
  usePageTitle("文章");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const posts = getPosts();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <PageFrame kicker="THE JOURNAL" title="文章" description="技术实践、产品思考，以及持续整理中的笔记。">
      <form className="search-form" onSubmit={submit} role="search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、摘要或标签"
          aria-label="搜索文章"
        />
        <button className="search-submit" type="submit">搜索</button>
      </form>
      <div className="list-count">全部内容 <span>{String(posts.length).padStart(2, "0")}</span></div>
      <PostList posts={posts} />
    </PageFrame>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const selectedTag = searchParams.get("tag") ?? "";
  usePageTitle(query || selectedTag ? "搜索结果" : "搜索");
  const [input, setInput] = useState(query);

  useEffect(() => setInput(query), [query]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return getPosts().filter((post) => {
      const matchesText = !normalized || [post.title, post.excerpt, post.category, ...post.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      return matchesText && matchesTag;
    });
  }, [query, selectedTag]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <PageFrame
      kicker="FIND A NOTE"
      title="搜索"
      description={selectedTag ? `标签：${selectedTag}` : query ? `关于“${query}”的内容` : "从标题、摘要和标签里查找。"}
    >
      <form className="search-form" onSubmit={submit} role="search">
        <Search size={18} />
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入关键词" aria-label="搜索关键词" />
        <button className="search-submit" type="submit">搜索</button>
      </form>
      <div className="list-count">找到 <span>{String(results.length).padStart(2, "0")}</span> 篇</div>
      <PostList posts={results} emptyTitle="没有匹配的文章" emptyText="换一个关键词，或清除当前筛选条件。" />
      {selectedTag && <Link className="clear-filter" to="/search">清除标签筛选 <ArrowRight size={15} /></Link>}
    </PageFrame>
  );
}

export function CategoriesPage() {
  usePageTitle("分类");
  const categories = getCategories();
  const tags = getTags();
  return (
    <PageFrame kicker="INDEX / TOPICS" title="分类与标签" description="按主题浏览写过的内容。">
      <div className="taxonomy-list">
        {categories.map((category, index) => {
          const count = getPosts().filter((post) => post.category === category).length;
          return (
            <Link className="taxonomy-row" key={category} to={`/categories/${encodeURIComponent(category)}`}>
              <span className="taxonomy-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="taxonomy-name">{category}</span>
              <span className="taxonomy-count">{count} 篇</span>
              <ArrowUpRight size={18} />
            </Link>
          );
        })}
      </div>
      <div className="all-tags">
        <div className="subsection-heading"><Tag size={16} /><h2>标签</h2></div>
        <div className="tag-cloud">
          {tags.map((tag) => <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`}>{tag}</Link>)}
        </div>
      </div>
    </PageFrame>
  );
}

export function CategoryPage() {
  const { category = "" } = useParams();
  const decodedCategory = decodeURIComponent(category);
  usePageTitle(decodedCategory || "分类");
  const posts = getPosts().filter((post) => post.category === decodedCategory);
  return (
    <PageFrame kicker="TOPIC / FILTERED VIEW" title={decodedCategory} description={`${posts.length} 篇相关内容`}>
      <PostList posts={posts} emptyTitle="还没有这个分类的文章" />
      <Link className="back-link" to="/categories"><ArrowLeft size={16} /> 所有分类</Link>
    </PageFrame>
  );
}

export function ArchivePage() {
  usePageTitle("归档");
  const grouped = getPosts().reduce<Record<string, Post[]>>((result, post) => {
    const year = post.publishedAt.slice(0, 4);
    result[year] ??= [];
    result[year].push(post);
    return result;
  }, {});

  return (
    <PageFrame kicker="TIMELINE" title="归档" description="按时间回看每一篇记录。">
      <div className="archive-list">
        {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([year, yearPosts]) => (
          <section className="archive-year" key={year}>
            <h2>{year}<span>{String(yearPosts.length).padStart(2, "0")}</span></h2>
            <div>
              {yearPosts.map((post) => (
                <article className="archive-row" key={post.slug}>
                  <time dateTime={post.publishedAt}>{post.publishedAt.slice(5).replace("-", ".")}</time>
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                  <span>{post.category}</span>
                  <ArrowUpRight size={16} />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageFrame>
  );
}

export function AboutPage() {
  usePageTitle("关于");
  return (
    <PageFrame kicker="ABOUT THIS SPACE" title="关于 Flew" description="一个用来整理想法、记录过程的个人博客。">
      <div className="about-layout">
        <div className="about-stamp">F<span>.</span></div>
        <div className="about-copy">
          <p className="about-lead">这里记录正在学习、设计与构建的事。</p>
          <p>当前页面使用本地演示文章，个人简介、头像和社交方式尚未配置。后续可以在不改变页面结构的情况下补充真实资料，并接入独立后端。</p>
          <Link className="text-link" to="/articles">从文章开始 <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="about-facts">
        <div><span>内容</span><strong>技术 · 产品 · 日常</strong></div>
        <div><span>当前阶段</span><strong>前端本地开发</strong></div>
        <div><span>项目仓库</span><a href="https://github.com/flew-345/flew_blog" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a></div>
      </div>
    </PageFrame>
  );
}

export function PostPage() {
  const { slug } = useParams();
  const post = getPost(slug);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  usePageTitle(post?.title ?? "文章不存在");

  useEffect(() => {
    if (!post) return;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [post]);

  useEffect(() => {
    if (!post) return;
    const sections = document.querySelectorAll(".article-body section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (current) setActiveSection(Number(current.target.id.replace("section-", "")));
      },
      { rootMargin: "-15% 0px -68% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [post]);

  if (!post) return <NotFoundPage />;
  const index = getPosts().findIndex((item) => item.slug === post.slug);
  const previous = getPosts()[index + 1];
  const next = getPosts()[index - 1];

  return (
    <article className="article-page">
      <div className="reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="article-topline page-container">
        <Link className="back-link" to="/articles"><ArrowLeft size={16} /> 返回文章</Link>
        <span>FLEW / JOURNAL</span>
      </div>
      <header className="article-header page-container">
        <Link className="article-category" to={`/categories/${encodeURIComponent(post.category)}`}>{post.category}</Link>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        <div className="article-meta">
          <span><CalendarDays size={15} /> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>
          <span><Clock3 size={15} /> {post.readTime} 分钟阅读</span>
        </div>
        <ul className="tag-list article-tags">
          {post.tags.map((tag) => <li key={tag}><Link to={`/search?tag=${encodeURIComponent(tag)}`}>{tag}</Link></li>)}
        </ul>
      </header>

      <div className="article-layout page-container">
        <div className="article-body">
          <div className="article-intro"><span>NOTE / {post.publishedAt.slice(0, 4)}</span><p>{post.excerpt}</p></div>
          {post.sections.map((section, sectionIndex) => (
            <section id={`section-${sectionIndex}`} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.code && <pre><code>{section.code}</code></pre>}
            </section>
          ))}
          <div className="article-endmark"><span /> END OF NOTE <span /></div>
          <div className="article-pagination">
            {previous ? <Link to={`/posts/${previous.slug}`}><ArrowLeft size={16} /><span><small>上一篇</small>{previous.title}</span></Link> : <span />}
            {next ? <Link className="next-article" to={`/posts/${next.slug}`}><span><small>下一篇</small>{next.title}</span><ArrowRight size={16} /></Link> : <span />}
          </div>
        </div>
        <aside className="article-toc">
          <span className="toc-kicker">ON THIS PAGE</span>
          {post.sections.map((section, sectionIndex) => (
            <a
              className={activeSection === sectionIndex ? "is-active" : ""}
              href={`#section-${sectionIndex}`}
              key={section.heading}
              aria-current={activeSection === sectionIndex ? "location" : undefined}
            >
              {String(sectionIndex + 1).padStart(2, "0")} {section.heading}
            </a>
          ))}
          <Link className="toc-all" to="/articles">全部文章 <ArrowUpRight size={14} /></Link>
        </aside>
      </div>
    </article>
  );
}

export function NotFoundPage() {
  usePageTitle("页面不存在");
  return (
    <div className="not-found page-container">
      <span className="section-kicker">404 / LOST IN THE NOTES</span>
      <strong>404</strong>
      <h1>这个页面暂时找不到。</h1>
      <p>地址可能已经变化，或者内容还没有发布。</p>
      <Link className="button button-dark" to="/">返回首页 <ArrowUpRight size={16} /></Link>
    </div>
  );
}

function PageFrame({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page-container page-frame">
      <header className="page-heading">
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </div>
  );
}
