import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function calculateReadingTime(content: any): number {
  if (!content || !content.blocks) return 1;
  let text = "";
  content.blocks.forEach((block: any) => {
    if (block.type === "paragraph" || block.type === "header") {
      if (block.data && typeof block.data.text === "string") {
        text += " " + block.data.text;
      }
    } else if (block.type === "quote") {
      if (block.data && typeof block.data.text === "string") {
        text += " " + block.data.text;
      }
      if (block.data && typeof block.data.caption === "string") {
        text += " " + block.data.caption;
      }
    } else if (block.type === "list") {
      if (block.data && Array.isArray(block.data.items)) {
        block.data.items.forEach((item: any) => {
          if (typeof item === "string") {
            text += " " + item;
          }
        });
      }
    }
  });
  
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 225; // standard adult reading speed
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
