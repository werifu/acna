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

async function updateFetchList(): Promise<NewsAbstract[]> {
  console.log('Starting to fetch updates from whitehouse.gov...');

  // Load existing news list
  const newsListPath = path.join(process.cwd(), '..', 'contents', 'news-list.json');
  let existingNews: NewsAbstract[] = [];

  try {
    if (fs.existsSync(newsListPath)) {
      const fileData = fs.readFileSync(newsListPath, 'utf8');
      existingNews = JSON.parse(fileData);
      console.log(`Loaded ${existingNews.length} existing news items.`);
    } else {
      console.log('No existing news-list.json found. Will create a new one.');
    }
  } catch (error) {
    console.error('Error reading existing news list:', error);
    console.log('Proceeding with an empty list.');
  }

  // Create a set of existing slugs for quick lookup
  const existingSlugs = new Set(existingNews.map(item => item.slug));

  const newNews: NewsAbstract[] = [];
  let page = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    try {
      console.log(`Fetching page ${page}...`);
      const html = await fetchNewsList({ page });

      // Parse the news list from the HTML
      const newsItems = parseNewsList(html);

      if (newsItems.length === 0) {
        console.log(`No news items found on page ${page}. Stopping.`);
        shouldContinue = false;
      } else {
        console.log(`Found ${newsItems.length} news items on page ${page}`);

        // Check if we've reached news we already have
        let foundExisting = false;
        for (const item of newsItems) {
          if (existingSlugs.has(item.slug)) {
            console.log(`Found existing news item: "${item.slug}". Synchronization complete.`);
            foundExisting = true;
            break;
          } else {
            newNews.push(item);
          }
        }

        if (foundExisting) {
          shouldContinue = false;
        } else {
          // Wait a bit between requests to avoid being rate-limited
          await sleep(2000);
          page++;
        }
      }
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      shouldContinue = false;
    }
  }

  console.log(`Update fetching complete. Found ${newNews.length} new news items.`);

  if (newNews.length > 0) {
    // Ensure the contents directory exists
    const contentsDir = path.join(process.cwd(), '..', 'contents');
    if (!fs.existsSync(contentsDir)) {
      fs.mkdirSync(contentsDir, { recursive: true });
    }

    // Combine new news with existing news and save
    const updatedNews = [...newNews, ...existingNews];
    fs.writeFileSync(newsListPath, JSON.stringify(updatedNews, null, 2), 'utf8');
    console.log(`Updated news list saved with ${updatedNews.length} total items.`);
  } else {
    console.log('No new items to add to the news list.');
  }

  return newNews;
}

async function updateFetchContents(newsList: NewsAbstract[]): Promise<void> {
  if (newsList.length === 0) {
    console.log('No new content to fetch.');
    return;
  }

  console.log(`Preparing to fetch content for ${newsList.length} new news items...`);

  const contentsFilePath = path.join(
    process.cwd(),
    '..',
    'contents',
    'en',
    'contents.json'
  );

  // Ensure the directory exists
  const contentsDir = path.dirname(contentsFilePath);
  if (!fs.existsSync(contentsDir)) {
    fs.mkdirSync(contentsDir, { recursive: true });
  }

  let existingContents = [];
  try {
    if (fs.existsSync(contentsFilePath)) {
      const fileData = fs.readFileSync(contentsFilePath, 'utf8');
      existingContents = JSON.parse(fileData);
      console.log(`Loaded ${existingContents.length} items from contents.json.`);
    } else {
      console.log(`contents.json not found. Initializing with an empty array.`);
    }
  } catch (readError) {
    console.error('Error reading contents.json:', readError);
    console.log('Proceeding with an empty array.');
  }

  // Array to store newly fetched content objects
  const newContentItems = [];

  // Process each new news item sequentially
  for (const news of newsList) {
    try {
      console.log(`\nFetching content for "${news.title}" (${news.slug})...`);
      const newsHtml = await fetchNewsContent(news.url);
      console.log(`Fetched HTML for "${news.slug}". Parsing content...`);

      const parsedContent = parseNewsContent(newsHtml);

      // Build the full news content object
      const newsContentObj = {
        title: news.title,
        category: news.category,
        date: news.date,
        slug: news.slug,
        content: parsedContent.content,
      };

      newContentItems.push(newsContentObj);
      console.log(`Successfully processed "${news.slug}".`);

      // Save intermediate progress
      const combinedItems = [...newContentItems, ...existingContents];
      combinedItems.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      fs.writeFileSync(
        contentsFilePath,
        JSON.stringify(combinedItems, null, 2),
        'utf8'
      );
      console.log(`Progress saved (${newContentItems.length}/${newsList.length} new items processed).`);

      // Wait between requests to avoid rate limiting
      await sleep(2000);
    } catch (err) {
      console.error(`Error processing "${news.slug}":`, err);
      console.log('Saving progress so far...');

      // Save progress even if there's an error
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
        console.log(`Progress saved after error (${newContentItems.length}/${newsList.length} new items processed).`);
      } catch (saveErr) {
        console.error('Failed to save progress after error:', saveErr);
      }
    }
  }

  console.log(`\nUpdate complete! Added ${newContentItems.length} new content items.`);
  console.log(`Total items in contents.json: ${newContentItems.length + existingContents.length}`);
}

// Execute the update process
(async () => {
  try {
    const newsList = await updateFetchList();
    if (newsList.length > 0) {
      console.log('\n=== Starting content fetch for new items ===\n');
      await updateFetchContents(newsList);
      console.log('\n=== Update process completed successfully ===');
    } else {
      console.log('No new content to fetch. Update process complete.');
    }
  } catch (error) {
    console.error('Error in update process:', error);
    process.exit(1);
  }
})();
