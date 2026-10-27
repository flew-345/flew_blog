export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  code?: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured?: boolean;
  sections: ArticleSection[];
}
