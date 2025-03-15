import Link from 'next/link';
import { getArticles } from '../lib/getArticles';
import { CATEGORIES, CATEGORIES_URL_MAP } from '../lib/category';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrumpFormater } from '../lib/format';
import { CATEGORY_I18N, SITE_TITLE } from '../lib/commonI18n';
import Image from 'next/image';
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  // Load articles for all categories
  const articlesData = await Promise.all(
    CATEGORIES.map((category) => getArticles(lang, category))
  );

  const formatTitle = TrumpFormater('font-bold text-xl');
  const headline = (lang: string) => {
    if (lang === 'kp') {
      return formatTitle('트럼프 대통령이 중요한 연설을 하고 있습니다.');
    } else if (lang === 'cn') {
      return formatTitle('特朗普总统正在发表重要讲话');
    } else if (lang === 'jp') {
      return formatTitle('トランプ大統領が重要な演説を行っています。');
    } else {
      return formatTitle('President Trump is delivering an important speech.');
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header lang={lang} />

      {/* Main Content */}
      <main className="p-4 bg-white">
        {/* Articles Block (Largest) */}
        <section className="mb-8">
          <Link href={`/${lang}/articles`} className="block">
            <h2 className=" text-l font-bold mb-4 p-2 rounded-lg shadow-md bg-[#f9eded] border border-[#f9e5e4] text-center text-[#cb3528] md:w-[70%] md:mx-auto">
              {
                CATEGORY_I18N['Articles' as keyof typeof CATEGORY_I18N][
                  lang as keyof (typeof CATEGORY_I18N)['Articles']
                ]
              }
            </h2>
          </Link>
          <div className="p-6 rounded-lg border-1 border-[#f4cac9] bg-[#f9eded]">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex flex-col md:w-1/2 pr-5 items-center justify-center md:pr-5">
                <div className="w-full relative">
                  <Image
                    src="/trump-talk.webp"
                    alt="Articles Image"
                    width={500}
                    height={300}
                    className="w-full object-cover mb-2"
                  />
                </div>
                <span
                  className="text-gray-600 text-sm mb-4 text-center"
                  dangerouslySetInnerHTML={{ __html: headline(lang) }}
                ></span>
              </div>
              <div className="w-full md:w-1/2">
                {articlesData[0].slice(0, 7).map((article) => {
                  return (
                    <div key={article.slug} className="mb-3">
                      <Link
                        href={`/${lang}/articles/${article.slug}`}
                        className=""
                      >
                        <span
                          className="hover:text-orange-500"
                          dangerouslySetInnerHTML={{
                            __html: formatTitle(article.title),
                          }}
                        ></span>
                        <span className="text-gray-600 text-sm inline-block ml-2">
                          [{article.date.replaceAll(/-/g, '.') + '.'}]
                        </span>
                      </Link>
                      <div className="border-b border-dotted border-gray-300 my-2"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Other Category Blocks */}
        <div className="flex flex-col lg:flex-row-reverse gap-4">
          {/* Right column (1/3) */}
          <div className="w-full lg:w-1/3">
            {CATEGORIES.slice(3).map((category, index) => {
              const categoryUri =
                CATEGORIES_URL_MAP[category as keyof typeof CATEGORIES_URL_MAP];
              const categoryArticles = articlesData[index + 3] || [];

              return (
                <div key={category} className="mb-6">
                  <Link href={`/${lang}/${categoryUri}`} className="block">
                    <h2 className="text-l font-bold mb-4 p-2 rounded-lg shadow-md bg-[#f9eded] border border-[#f9e5e4] text-center text-[#cb3528] md:w-[70%] md:mx-auto">
                      {
                        CATEGORY_I18N[category as keyof typeof CATEGORY_I18N][
                          lang as keyof (typeof CATEGORY_I18N)['Articles']
                        ]
                      }
                    </h2>
                  </Link>
                  <div className="p-6 rounded-lg border-1 border-[#e4e3e3] bg-white">
                    {categoryArticles.slice(0, 3).map((article) => (
                      <div key={article.slug} className="mb-3">
                        <Link
                          href={`/${lang}/${categoryUri}/${article.slug}`}
                          className=""
                        >
                          <span
                            className="font-medium hover:text-orange-500"
                            dangerouslySetInnerHTML={{
                              __html: formatTitle(article.title),
                            }}
                          ></span>
                          <div className="text-gray-600 text-sm inline-block ml-2">
                            [{article.date.replaceAll(/-/g, '.') + '.'}]
                          </div>
                        </Link>
                        <div className="border-b border-dotted border-gray-300 my-2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left column (2/3) */}
          <div className="w-full lg:w-2/3">
            {CATEGORIES.slice(1, 3).map((category, index) => {
              const categoryUri =
                CATEGORIES_URL_MAP[category as keyof typeof CATEGORIES_URL_MAP];
              const categoryArticles = articlesData[index + 1] || [];

              return (
                <div key={category} className="mb-6">
                  <Link href={`/${lang}/${categoryUri}`} className="block">
                    <h2 className="text-l font-bold mb-4 p-2 rounded-lg shadow-md bg-[#eff1f3] border border-[#ebe9e9] text-center text-[#184077] md:w-[70%] md:mx-auto">
                      {
                        CATEGORY_I18N[category as keyof typeof CATEGORY_I18N][
                          lang as keyof (typeof CATEGORY_I18N)['Articles']
                        ]
                      }
                    </h2>
                  </Link>
                  <div className="p-6 rounded-lg border-1 border-[#e4e3e3] bg-white">
                    {categoryArticles.slice(0, 5).map((article) => (
                      <div key={article.slug} className="mb-3">
                        <Link
                          href={`/${lang}/${categoryUri}/${article.slug}`}
                          className=""
                        >
                          <span
                            className="font-medium hover:text-orange-500"
                            dangerouslySetInnerHTML={{
                              __html: formatTitle(article.title),
                            }}
                          ></span>
                          <p className="text-gray-600 text-sm">
                            [{article.date.replaceAll(/-/g, '.') + '.'}]
                          </p>
                        </Link>
                        <div className="border-b border-dotted border-gray-300 my-2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full border-b border-gray-300 my-8"></div>
        <div className="mt-8 px-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <a
              href="http://www.kcna.kp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 rounded"
            >
              <Image
                src="/kcna.png"
                alt="KCNA"
                width={120}
                height={48}
                className="h-12 object-contain rounded"
              />
            </a>
            <a
              href="https://whitehouse.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 bg-black rounded"
            >
              <Image
                src="/whitehouse-47-logo.webp"
                alt="White House"
                width={120}
                height={48}
                className="h-12 object-contain rounded"
              />
            </a>
            <a
              href="https://github.com/werifu/acna"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 rounded"
            >
              <Image
                src="/github-logo.jpg"
                alt="GitHub"
                width={120}
                height={48}
                className="h-12 object-contain rounded"
              />
            </a>
            <a
              href="https://anime.bang-dream.com/avemujica/character/sakiko/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 rounded"
            >
              <Image
                src="/togawa.png"
                alt="Togawa"
                width={120}
                height={48}
                className="h-12 object-contain rounded"
              />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
