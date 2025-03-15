import Link from 'next/link';
import { getArticles } from '@/app/lib/getArticles';
import {
  URI_CATEGORIES_MAP,
  CATEGORIES,
  CATEGORIES_URL_MAP,
} from '@/app/lib/category';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { TrumpFormater } from '@/app/lib/format';
import Pagination from '@/app/components/Pagination';
import { CATEGORY_I18N, SITE_TITLE } from '@/app/lib/commonI18n';
import { Metadata } from 'next';

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
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; categoryUri: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { lang, categoryUri } = resolvedParams;
  const category =
    URI_CATEGORIES_MAP[categoryUri as keyof typeof URI_CATEGORIES_MAP];

  // Pagination
  const page = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const articlesPerPage = 20;

  const allArticles = await getArticles(lang, category);
  const totalPages = Math.ceil(allArticles.length / articlesPerPage);
  const articles = allArticles.slice(
    (page - 1) * articlesPerPage,
    page * articlesPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header lang={lang} categoryUri={categoryUri} />

      {/* Main Content */}
      <main className="p-4 bg-white">
        <div className="flex flex-col lg:flex-row">
          {/* Category sidebar - only visible on lg screens */}
          <div className="hidden lg:block lg:w-1/5">
            <div className="bg-white border border-gray-400 rounded-lg overflow-hidden sticky top-4">
              <div className="border-b bg-[#999999] p-3 font-bold text-center"></div>
              <ul>
                {CATEGORIES.map((cat) => {
                  const catUri =
                    CATEGORIES_URL_MAP[cat as keyof typeof CATEGORIES_URL_MAP];
                  return (
                    <li
                      key={cat}
                      className={`${categoryUri === catUri ? 'bg-[#dddddd]' : ''}`}
                    >
                      <Link
                        href={`/${lang}/${catUri}`}
                        className="hover:text-orange-500 px-3 block py-2 flex items-center"
                      >
                        {
                          CATEGORY_I18N[cat as keyof typeof CATEGORY_I18N][
                            lang as keyof (typeof CATEGORY_I18N)['Articles']
                          ]
                        }
                      </Link>
                      <div className="border-b border-dotted border-gray-300 mx-2"></div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Articles list */}
          <div className="w-full lg:w-4/5 lg:ml-[10%]">
            <h1 className="text-2xl font-bold mb-1 mt-2 p-2 rounded-lg text-center text-[#2757a0] md:w-[70%] md:mx-auto">
              {
                CATEGORY_I18N[category as keyof typeof CATEGORY_I18N][
                  lang as keyof (typeof CATEGORY_I18N)['Articles']
                ]
              }
            </h1>

            <div className="p-6 rounded-lg  bg-white">
              {articles.map((article) => (
                <div key={article.slug} className="mb-3">
                  <Link
                    href={`/${lang}/${categoryUri}/${article.slug}`}
                    className=""
                  >
                    <span
                      className="font-medium hover:text-orange-500"
                      dangerouslySetInnerHTML={{
                        __html: TrumpFormater('text-xl font-bold')(
                          article.title
                        ),
                      }}
                    ></span>
                    <span className="text-gray-600 text-sm inline-block ml-2">
                      [{article.date.replaceAll(/-/g, '.') + '.'}]
                    </span>
                  </Link>
                  <div className="border-b border-dotted border-gray-300 my-2"></div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl={`/${lang}/${categoryUri}`}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
