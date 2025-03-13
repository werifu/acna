import Link from 'next/link';
import { getArticles } from '../lib/getArticles';

export default async function HomePage({ params }: { params: { lang: string } }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  const categories = [
    'articles',
    'briefings-statements',
    'fact-sheets',
    'presidential-actions',
    'remarks'
  ];
  // Load articles for all categories
  const articlesData = await Promise.all(
    categories.map(category => getArticles(lang, category))
  );
  const latestArticles = articlesData.map(articles => articles[0]); // Take the first (latest) article

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <img src="/acna-logo.png" alt="Logo" className="h-10" />
        <nav className="space-x-4">
          <Link href="/kp" className="hover:underline">KP</Link>
          <Link href="/en" className="hover:underline">EN</Link>
          <Link href="/cn" className="hover:underline">CN</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Articles Block (Largest) */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row items-start">
            <img
              src="/trump-talk.webp"
              alt="Articles Image"
              className="w-full md:w-1/2 h-64 object-cover mb-4 md:mb-0 md:mr-4"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2">{latestArticles[0]?.title}</h2>
              <p className="text-gray-600 mb-2">{latestArticles[0]?.date}</p>
              <p className="text-gray-800">
                {latestArticles[0]?.content.substring(0, 100)}...
              </p>
              <Link href={`/${lang}/articles/${latestArticles[0]?.slug}`} className="text-blue-500 hover:underline">
                阅读更多
              </Link>
            </div>
          </div>
        </section>

        {/* Other Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.slice(1).map((category, index) => (
            <div key={category} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold capitalize mb-2">{category}</h3>
              <p className="text-gray-800">{latestArticles[index + 1]?.title}</p>
              <p className="text-gray-600 mb-2">{latestArticles[index + 1]?.date}</p>
              <Link href={`/${lang}/${category}`} className="text-blue-500 hover:underline">
                更多
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center text-gray-600">
        <p>Copyright © 2025</p>
      </footer>
    </div>
  );
}
