export type BlogCard = {
  path: string;
  h1: string;
  excerpt: string;
  publishedTime?: string;
  publishedLabel: string | null;
  src: string;
  alt: string;
  width: number;
  height: number;
  topic: string;
};
