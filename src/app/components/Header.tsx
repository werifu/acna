'use client';
import Link from 'next/link';
import { CATEGORIES, CATEGORIES_URL_MAP } from '@/app/lib/category';
import { useState } from 'react';
import { CATEGORY_I18N } from '../lib/commonI18n';
import Image from 'next/image';

export type LangMap = { kp: string; en: string; cn: string; jp: string };

const HeaderI18n: Record<string, LangMap> = {
  search: {
    kp: '검색어를 입력하십시오',
    en: 'Search',
    cn: '搜索',
    jp: '検索',
  },
};

export default function Header({
  lang,
  categoryUri,
  slug,
}: {
  lang: string;
  categoryUri?: string;
  slug?: string;
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const get_href = (lang: string) => {
    if (slug && categoryUri) {
      return `/${lang}/${categoryUri}/${slug}`;
    } else if (categoryUri) {
      return `/${lang}/${categoryUri}`;
    } else {
      return `/${lang}`;
    }
  };

  return (
    <div>
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full h-6 bg-[#334d6f] text-white py-2 px-4 flex justify-between items-center">
        <Link href={`/${lang}`}>
          <i className="fas fa-home"></i>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="focus:outline-none cursor-pointer"
          >
            <i className="fas fa-language"></i>
          </button>
          {showLangMenu && (
            <div
              className="absolute right-0 w-24 bg-black/80 rounded-bl-md rounded-br-md shadow-lg z-50"
              style={{ right: '-1rem' }}
            >
              <Link
                href={get_href('kp')}
                className="block px-2 py-2 text-sm font-bold text-white hover:underline border-b border-dotted border-white/30"
              >
                조선어
              </Link>
              <Link
                href={get_href('en')}
                className="block px-2 py-2 text-sm font-bold text-white hover:underline border-b border-dotted border-white/30"
              >
                English
              </Link>
              <Link
                href={get_href('cn')}
                className="block px-2 py-2 text-sm font-bold text-white hover:underline border-b border-dotted border-white/30"
              >
                中国语
              </Link>
              <Link
                href={get_href('jp')}
                className="block px-2 py-2 text-sm font-bold text-white hover:underline"
              >
                日本語
              </Link>
            </div>
          )}
        </div>
      </div>

      <header className="bg-[url('/home-medium.jpg')] bg-cover bg-center text-white flex justify-between items-center relative lg:h-auto max-lg:min-h-[90px]">
        <div className="w-1/4 lg:block"></div>
        {/* Logo - Centered on mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:left-[10%] lg:translate-x-0 top-4">
          <Link href={`/${lang}`}>
            <Image src="/acna-logo.png" alt="Logo" width={180} height={120} className="h-14 object-contain"/>
          </Link>
        </div>

        {/* Right Side - Hidden on mobile */}
        <div className="hidden lg:flex w-3/4 flex-col items-end text-[#114981] text-xs">
          {/* Language Navigation */}
          <div className="py-1 px-2">
            <div className="flex space-x-2 px-2">
              <Link
                href={get_href('en')}
                className={lang === 'en' ? 'font-bold' : ''}
              >
                English
              </Link>
              <span>/</span>
              <Link
                href={get_href('kp')}
                className={lang === 'kp' ? 'font-bold' : ''}
              >
                조선어
              </Link>
              <span>/</span>
              <Link
                href={get_href('cn')}
                className={lang === 'cn' ? 'font-bold' : ''}
              >
                中国语
              </Link>
              <span>/</span>
              <Link
                href={get_href('jp')}
                className={lang === 'jp' ? 'font-bold' : ''}
              >
                日本語
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="py-1 px-2">
            <div className="relative">
              <input
                type="text"
                placeholder={HeaderI18n.search[lang as keyof LangMap]}
                className="w-[200px] h-[24px] px-3 py-0.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 overflow:hidden bg-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2">
                <i className="fas fa-search text-gray-400 text-sm"></i>
              </button>
            </div>
          </div>

          {/* Categories Navigation */}
          <div className="bg-[#1a59a4] mt-auto pl-10 rounded-tl-full">
            <nav className="flex justify-end space-x-2 py-1 text-white text-sm font-bold mr-4">
              {CATEGORIES.map((category, index) => (
                <div key={category}>
                  <Link
                    href={`/${lang}/${CATEGORIES_URL_MAP[category as keyof typeof CATEGORIES_URL_MAP]}`}
                  >
                    {
                      CATEGORY_I18N[category as keyof typeof CATEGORY_I18N][
                        lang as keyof (typeof CATEGORY_I18N)['Articles']
                      ]
                    }
                  </Link>
                  {index < CATEGORIES.length - 1 && (
                    <span className="mx-1">|</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <div className="w-full h-[2px] bg-[#1a59a4]"></div>
      <div className="w-full h-[1px] bg-black mt-1"></div>
    </div>
  );
}
