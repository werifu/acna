import Link from 'next/link';
import { getArticles, Article } from '../../lib/getArticles';

export default async function CategoryPage({ params }: { params: { lang: string; category: string } }) {
  const resolvedParams = await params; // Resolve the params Promise
  const { lang, category } = resolvedParams;
  const articles = await getArticles(lang, category);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category}</h1>
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.slug} className="bg-white p-4 rounded-lg shadow-md">
            <Link href={`/${lang}/${category}/${article.slug}`} className="text-blue-500 hover:underline text-lg">
              {article.title}
            </Link>
            <p className="text-gray-600">{article.date}</p>
            <p className="text-gray-800">{article.content.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
}