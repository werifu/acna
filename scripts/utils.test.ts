import { parseNewsList, parseNewsContent } from './utils';
import fs from 'fs';
import path from 'path';

const newsListParsingResult = [
  {
    title:
      'WEEK EIGHT WINS: A Testament to American Greatness Under President Trump',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/week-eight-wins-a-testament-to-american-greatness-under-president-trump/',
    date: '2025-03-14',
    slug: 'week-eight-wins-a-testament-to-american-greatness-under-president-trump',
  },
  {
    title:
      'Remarks by President Trump and NATO Secretary General Mark Rutte Before Bilateral Meeting',
    category: 'Remarks',
    url: 'https://www.whitehouse.gov/remarks/2025/03/remarks-by-president-trump-and-nato-secretary-general-mark-rutte-before-bilateral-meeting/',
    date: '2025-03-13',
    slug: 'remarks-by-president-trump-and-nato-secretary-general-mark-rutte-before-bilateral-meeting',
  },
  {
    title:
      'President Trump is Remaking America into a Manufacturing Superpower',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/president-trump-is-remaking-america-into-a-manufacturing-superpower/',
    date: '2025-03-12',
    slug: 'president-trump-is-remaking-america-into-a-manufacturing-superpower',
  },
  {
    title:
      'WINNING: Inflation Eases as Job Creation Soars and Border Security Pays Off',
    category: 'Briefings & Statements',
    url: 'https://www.whitehouse.gov/briefings-statements/2025/03/winning-inflation-eases-as-job-creation-soars-and-border-security-pays-off/',
    date: '2025-03-12',
    slug: 'winning-inflation-eases-as-job-creation-soars-and-border-security-pays-off',
  },
  {
    title: 'Ensuring the Enforcement of Federal Rule of Civil Procedure 65(c)',
    category: 'Presidential Actions',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/03/ensuring-the-enforcement-of-federal-rule-of-civil-procedure-65c/',
    date: '2025-03-11',
    slug: 'ensuring-the-enforcement-of-federal-rule-of-civil-procedure-65c',
  },
  {
    title: 'Nominations Sent to the Senate',
    category: 'Presidential Actions',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/03/nominations-sent-to-the-senate-8355/',
    date: '2025-03-11',
    slug: 'nominations-sent-to-the-senate-8355',
  },
  {
    title:
      'FACT CHECK: President Trump Will Always Protect Social Security, Medicare',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/fact-check-president-trump-will-always-protect-social-security-medicare/',
    date: '2025-03-11',
    slug: 'fact-check-president-trump-will-always-protect-social-security-medicare',
  },
  {
    title: '50 WINS IN 50 DAYS: President Trump Delivers for Americans',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/50-wins-in-50-days-president-trump-delivers-for-americans/',
    date: '2025-03-10',
    slug: '50-wins-in-50-days-president-trump-delivers-for-americans',
  },
  {
    title:
      'ICYMI: “Companies eye US expansion to lessen fallout from potential tariffs”',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/icymi-companies-eye-us-expansion-to-lessen-fallout-from-potential-tariffs/',
    date: '2025-03-10',
    slug: 'icymi-companies-eye-us-expansion-to-lessen-fallout-from-potential-tariffs',
  },
  {
    title: 'SUNDAY SHOWS: The Golden Age of America Is Here',
    category: 'Articles',
    url: 'https://www.whitehouse.gov/articles/2025/03/sunday-shows-the-golden-age-of-america-is-here/',
    date: '2025-03-09',
    slug: 'sunday-shows-the-golden-age-of-america-is-here',
  },
];

const newsContentParsingResult = {
  title:
    'WEEK EIGHT WINS: A Testament to American Greatness Under President Trump',
  category: 'Articles',
  date: '2025-03-14',
  slug: 'week-eight-wins-a-testament-to-american-greatness-under-president-trump',
  content: '',
};

describe('parseNewsList', () => {
  it('should parse news list from HTML correctly', () => {
    // Read the sample HTML file
    const htmlContent = fs.readFileSync(
      path.join(__dirname, 'utils.newslist.test.html'),
      'utf-8'
    );

    // Parse the news list
    const newsList = parseNewsList(htmlContent);

    // Check if we got some results
    expect(newsList.length).toBeGreaterThan(0);
    // Check the structure of a news item
    expect(newsList.map(item => ({
      ...item,
      title: item.title.replace(/\s+/g, ' ').trim()
    }))).toEqual(newsListParsingResult.map(item => ({
      ...item,
      title: item.title.replace(/\s+/g, ' ').trim()
    })));

    // Log the first item for manual verification
    // console.log('news items:', newsList);
  });
});

describe('parseNewsContent', () => {
  it('should parse news content from HTML correctly', () => {
    // Read the sample HTML file
    const htmlContent = fs.readFileSync(
      path.join(__dirname, 'utils.news.test.html'),
      'utf-8'
    );

    // Parse the news content
    const newsContent = parseNewsContent(htmlContent);

    // Verify specific fields
    expect(newsContent.title.replace(/\s+/g, ' ')).toBe(newsContentParsingResult.title.replace(/\s+/g, ' '));
    expect(newsContent.category).toBe(newsContentParsingResult.category);
    expect(newsContent.date).toBe(newsContentParsingResult.date);
    expect(newsContent.slug).toBe(newsContentParsingResult.slug);
    expect(newsContent.content.length).toBeGreaterThan(0);

    console.log(newsContent.content);
  });
});
