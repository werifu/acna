import { getArticles, Article } from '../../../lib/getArticles';

export default async function ArticlePage({ params }: { params: { lang: string; category: string; slug: string } }) {
  const resolvedParams = await params; // Resolve the params Promise
  const { lang, category, slug } = resolvedParams; // Destructure after resolution
  const articles = await getArticles(lang, category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return <div className="p-4 text-center">文章未找到</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <article className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <p className="text-gray-600 mb-4">{article.date}</p>
        <div className="text-gray-800 whitespace-pre-wrap">{article.content}</div>
      </article>
    </div>
  );
}