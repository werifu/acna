import fs from 'fs';
import path from 'path';
import {
  fetchNewsList,
  parseNewsList,
  NewsAbstract,
  fetchNewsContent,
  parseNewsContent,
} from './utils';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initFetchList() {
  console.log('Starting to fetch news from whitehouse.gov...');

  const allNews: NewsAbstract[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      console.log(`Fetching page ${page}...`);
      const html = await fetchNewsList({ page });

      // Parse the news list from the HTML
      const newsItems = parseNewsList(html);

      if (newsItems.length === 0) {
        console.log(`No news items found on page ${page}. Stopping.`);
        hasMorePages = false;
      } else {
        console.log(`Found ${newsItems.length} news items on page ${page}`);
        allNews.push(...newsItems);

        // Wait a bit between requests to avoid being rate-limited
        await sleep(2000);
        page++;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Fetching complete - reached the end of available pages.');
      } else {
        console.log(`Error on page ${page}`, error);
      }
      hasMorePages = false;
    }
  }

  console.log(`Fetching complete. Total news items: ${allNews.length}`);

  // Ensure the contents directory exists
  const contentsDir = path.join(process.cwd(), '..', 'contents');
  if (!fs.existsSync(contentsDir)) {
    fs.mkdirSync(contentsDir, { recursive: true });
  }

  // Write the news list to a JSON file
  const outputPath = path.join(contentsDir, 'news-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(allNews, null, 2), 'utf8');
  console.log(`News list saved to ${outputPath}`);
  return allNews;
}

async function initFetchContents(newsList: NewsAbstract[]): Promise<void> {
  const contentsFilePath = path.join(
    process.cwd(),
    '..',
    'contents',
    'en',
    'contents.json'
  );
  let existingContents = [];
  try {
    if (fs.existsSync(contentsFilePath)) {
      const fileData = fs.readFileSync(contentsFilePath, 'utf8');
      existingContents = JSON.parse(fileData);
      console.log(
        `Loaded ${existingContents.length} items from contents.json.`
      );
    } else {
      console.log(
        `contents.json not found at ${contentsFilePath}. Initializing with an empty array.`
      );
    }
  } catch (readError) {
    console.error(
      'Error reading contents.json, proceeding with an empty array.',
      readError
    );
    existingContents = [];
  }

  // Filter newsList to only include news items whose slug is not already in contents.json.
  const existingSlugs = new Set(
    existingContents.map((item: { slug: string }) => item.slug)
  );
  const newsToFetch = newsList.filter((news) => !existingSlugs.has(news.slug));
  console.log(
    `Identified ${newsToFetch.length} new news items to fetch content for.`
  );

  // Array to store newly fetched content objects
  const newContentItems = [];

  // Process each new news item sequentially
  for (const news of newsToFetch) {
    try {
      console.log(
        `\nFetching content for news with slug "${news.slug}" from URL: ${news.url}`
      );
      const newsHtml = await fetchNewsContent(news.url);
      console.log(`Fetched HTML for slug "${news.slug}". Parsing content...`);

      const parsedContent = parseNewsContent(newsHtml);

      // Build the full news content object to match the structure in contents.json
      const newsContentObj = {
        title: news.title,
        category: news.category,
        date: news.date,
        slug: news.slug,
        content: parsedContent.content,
      };

      newContentItems.push(newsContentObj);
      console.log(`Successfully processed news item with slug "${news.slug}".`);

      // Save intermediate progress by combining the newly fetched items with the existing contents,
      // sorting them so that newer items appear at the front.
      const combinedItems = [...newContentItems, ...existingContents];
      combinedItems.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      fs.writeFileSync(
        contentsFilePath,
        JSON.stringify(combinedItems, null, 2),
        'utf8'
      );
      console.log(
        `Intermediate progress saved (total items: ${combinedItems.length}).`
      );

      // Wait between requests to avoid rate limiting
      await sleep(2000);
    } catch (err) {
      console.error(`Error processing news with slug "${news.slug}":`, err);
      console.log('Saving progress so far due to the encountered error.');
      const combinedItems = [...newContentItems, ...existingContents];
      combinedItems.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      try {
        fs.writeFileSync(
          contentsFilePath,
          JSON.stringify(combinedItems, null, 2),
          'utf8'
        );
        console.log(
          `Progress saved upon error (total items: ${combinedItems.length}).`
        );
      } catch (saveErr) {
        console.error('Failed to save progress after error:', saveErr);
      }
      // Continue processing the next news item even if an error occurs.
    }
  }

  // After all news items are processed, combine the new content with the existing and sort by date (newest first)
  const finalContents = [...newContentItems, ...existingContents];
  finalContents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  try {
    fs.writeFileSync(
      contentsFilePath,
      JSON.stringify(finalContents, null, 2),
      'utf8'
    );
    console.log(
      `Final contents file updated successfully with ${finalContents.length} items.`
    );
  } catch (finalSaveErr) {
    console.error('Error saving final contents:', finalSaveErr);
  }
}

// Execute the function
// (async () => {
//   const newsList = await initFetchList().catch(error => {
//     console.error('Error in initFetch:', error);
//     process.exit(1);
//   });
//   await initFetchContents(newsList);
// })();

(async () => {
  const newsList: NewsAbstract[] = (await import('../contents/news-list.json'))
    .default;
  await initFetchContents(newsList);
})();
