import { posts } from "../mocks/posts";
import type { Post } from "../types";

export function getPosts(): Post[] {
  return posts;
}

export function getPost(slug: string | undefined): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getCategories(): string[] {
  return [...new Set(posts.map((post) => post.category))];
}

export function getTags(): string[] {
  return [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}
