import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../types";

interface PostListProps {
  posts: Post[];
  emptyTitle?: string;
  emptyText?: string;
}

export function PostList({
  posts,
  emptyTitle = "还没有文章",
  emptyText = "新的内容整理好后会出现在这里。",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark">—</span>
        <h2>{emptyTitle}</h2>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post, index) => (
        <article className="post-row" key={post.slug}>
          <div className="post-index">{String(index + 1).padStart(2, "0")}</div>
          <div className="post-main">
            <div className="post-meta">
              <Link className="category-link" to={`/categories/${encodeURIComponent(post.category)}`}>
                {post.category}
              </Link>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>{post.readTime} 分钟</span>
            </div>
            <h2>
              <Link to={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <ul className="tag-list" aria-label="文章标签">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link to={`/search?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                </li>
              ))}
            </ul>
          </div>
          <Link className="post-arrow" to={`/posts/${post.slug}`} aria-label={`阅读：${post.title}`}>
            <ArrowUpRight size={19} strokeWidth={1.6} />
          </Link>
        </article>
      ))}
    </div>
  );
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
}
