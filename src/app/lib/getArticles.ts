import fs from 'fs/promises';
import path from 'path';
import { CATEGORY_I18N } from './commonI18n';

export interface Article {
  slug: string;
  title: string;
  date: string;
  content: string;
  category: string;
}

export async function getArticles(
  lang: string,
  category: string
): Promise<Article[]> {
  const filePath = path.join(process.cwd(), 'contents', lang, 'contents.json');
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const articles = (JSON.parse(jsonData) as Article[]).filter((article) => {
      return (
        article.category ===
        CATEGORY_I18N[category as keyof typeof CATEGORY_I18N][
          lang as keyof (typeof CATEGORY_I18N)['Articles']
        ]
      );
    });
    return articles;
  } catch (error) {
    console.error(`Error loading articles for ${lang}/${category}:`, error);
    return [];
  }
}
