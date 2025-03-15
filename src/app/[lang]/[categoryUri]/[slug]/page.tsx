import { URI_CATEGORIES_MAP } from '@/app/lib/category';
import { getArticles } from '@/app/lib/getArticles';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { TrumpFormater } from '@/app/lib/format';
import { Metadata } from 'next';
import { SITE_TITLE } from '@/app/lib/commonI18n';

// Replace static metadata with a dynamic function
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Default to 'en' if no language is specified
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  return {
    title: `${SITE_TITLE[lang as keyof typeof SITE_TITLE] || SITE_TITLE.en}`,
    description: SITE_TITLE[lang as keyof typeof SITE_TITLE] || SITE_TITLE.en,
    icons: {
      icon: '/acna-icon.png',
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; categoryUri: string; slug: string }>;
}) {
  const resolvedParams = await params; // Resolve the params Promise
  const { lang, categoryUri, slug } = resolvedParams; // Destructure after resolution
  const category =
    URI_CATEGORIES_MAP[categoryUri as keyof typeof URI_CATEGORIES_MAP];
  const articles = await getArticles(lang, category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return <div className="p-4 text-center">文章未找到: {slug}</div>;
  }

  const paragraphs = article.content.split('\n').filter((p) => p.trim());

  // Function to highlight Trump's name
  const formatParagraph = TrumpFormater('font-bold text-xl');
  const formatTitle = TrumpFormater('text-4xl');
  return (
    <>
      <Header lang={lang} categoryUri={categoryUri} slug={slug}></Header>
      <div className="min-h-screen bg-white mt-10">
        <article className="bg-white rounded-lg max-w-3xl mx-auto">
          <h1
            className="text-3xl font-bold mb-4 text-center text-[#255291]"
            dangerouslySetInnerHTML={{ __html: formatTitle(article.title) }}
          ></h1>
          {/* <div className="flex justify-end mb-4">
            <i className="fas fa-camera text-[#4678b2] text-2xl hover:text-[#255291]"></i>
          </div> */}
          <div className="text-gray-800">
            {paragraphs.map((paragraph, i) =>
              paragraph.startsWith('-') ? (
                <p
                  key={i}
                  className="ml-4 mb-[1em]"
                  dangerouslySetInnerHTML={{
                    __html: formatParagraph(paragraph),
                  }}
                ></p>
              ) : (
                <p
                  key={i}
                  className="mb-[1em]"
                  dangerouslySetInnerHTML={{
                    __html: formatParagraph(paragraph),
                  }}
                ></p>
              )
            )}
          </div>
          <p className="text-gray-800 text-sm">
            www.us-acna.info ({article.date.replaceAll(/-/g, '.') + '.'})
          </p>
        </article>
      </div>
      <Footer></Footer>
    </>
  );
}
