import * as cheerio from 'cheerio';

export async function fetchNewsList(params: { page?: number }) {
  const page = params.page || 1;
  const url = `https://www.whitehouse.gov/news/page/${page}/`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('404 - Page not found');
      }
      throw new Error(
        `Failed to fetch content: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    return html;
  } catch (error) {
    throw error;
  }
}

export async function fetchNewsContent(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch content: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching content from White House website:', error);
    throw error;
  }
}

export interface NewsAbstract {
  title: string;
  category: string;
  url: string;
  date: string;
  slug: string;
}

export interface NewsContent {
  title: string;
  category: string;
  date: string;
  slug: string;
  content: string;
}

export function parseNewsList(htmlText: string): NewsAbstract[] {
  const news: NewsAbstract[] = [];

  // Use cheerio to parse the HTML
  const $ = cheerio.load(htmlText);

  // Find all news items in the post template
  $('.wp-block-post-template > li').each((index: number, element) => {
    try {
      // Extract title
      const titleElement = $(element).find('.wp-block-post-title');
      if (titleElement.length === 0) return;

      const title = titleElement
        .text()
        .trim()
        .replace(/\t+/g, '')
        .replace(/\n+/g, ' ');

      // Extract URL from the title link
      const linkElement = titleElement.find('a');
      if (linkElement.length === 0) return;

      const url = linkElement.attr('href') || '';

      // Extract slug from URL
      const urlParts = url.split('/');
      const slug = urlParts[urlParts.length - 2] || '';

      // Extract category
      const categoryElement = $(element).find('.taxonomy-category a');
      const category = categoryElement.text().trim() || '';

      // Extract date
      const dateElement = $(element).find('.wp-block-post-date');
      const dateText = dateElement.text().trim() || '';
      const date = new Date(dateText).toISOString().split('T')[0];

      // Add to news array
      news.push({
        title,
        category,
        url,
        date,
        slug,
      });
    } catch (error) {
      console.error('Error parsing news item:', error);
    }
  });

  return news;
}

export function parseNewsContent(htmlText: string): NewsContent {
  // Use cheerio to parse the HTML
  const $ = cheerio.load(htmlText);

  // Extract category from the topper eyebrow
  const category = $('.wp-block-whitehouse-topper__eyebrow a')
    .first()
    .text()
    .trim();

  // Extract title from the headline
  const title = $('.wp-block-whitehouse-topper__headline')
    .first()
    .text()
    .trim();

  // Extract date
  const dateElement = $('.wp-block-whitehouse-topper__meta--date time');
  const dateText = dateElement.text().trim();
  const date = new Date(dateText).toISOString().split('T')[0];

  // Extract from meta og:url if available
  const metaOgUrl = $('meta[property="og:url"]').attr('content') || '';

  const urlParts = metaOgUrl.split('/');
  const slug = urlParts[urlParts.length - 2] || '';

  // Extract content
  const contentElements = $(
    '.entry-content.wp-block-post-content > p, .entry-content.wp-block-post-content > ul'
  );

  // Process content to preserve structure
  const content = contentElements
    .map((_, element) => {
      const $element = $(element);

      // Return text content but preserve links and list items
      if ($element.is('ul')) {
        // For lists, preserve the list items
        return $element
          .find('li')
          .map((_, li) => {
            const $li = $(li);
            // // Replace links with their text and URL
            // $li.find('a').each((_, a) => {
            //   const $a = $(a);
            //   const href = $a.attr('href') || '';
            //   const text = $a.text();
            //   $a.replaceWith(`<-a->${text}[[${href}]]<-/a->`);
            // });
            // // Preserve strong tags
            // $li.find('strong').each((_, strong) => {
            //   const $strong = $(strong);
            //   const text = $strong.text();
            //   $strong.replaceWith(`<-strong->${text}<-/strong->`);
            // });
            return '- ' + $li.text().trim();
          })
          .get()
          .join('\n');
      } else {
        // // For paragraphs, preserve links
        // $element.find('a').each((_, a) => {
        //   const $a = $(a);
        //   const href = $a.attr('href') || '';
        //   const text = $a.text();
        //   $a.replaceWith(`<-a->${text}[[${href}]]<-/a->`);
        // });
        // // Preserve strong tags
        // $element.find('strong').each((_, strong) => {
        //   const $strong = $(strong);
        //   const text = $strong.text();
        //   $strong.replaceWith(`<-strong->${text}<-/strong->`);
        // });
        return $element.text().trim();
      }
    })
    .get()
    .join('\n');

  return {
    title,
    category,
    date,
    slug,
    content,
  };
}
