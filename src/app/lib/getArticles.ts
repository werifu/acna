import fs from 'fs/promises';
import path from 'path';

export interface Article {
  slug: string;
  title: string;
  date: string;
  content: string;
}

export async function getArticles(lang: string, category: string): Promise<Article[]> {
  const filePath = path.join(process.cwd(), 'contents', lang, category, 'content.json');
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData) as Article[];
  } catch (error) {
    console.error(`Error loading articles for ${lang}/${category}:`, error);
    return [];
  }
}