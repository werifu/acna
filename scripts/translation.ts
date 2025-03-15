import { existsSync, readFileSync } from 'fs';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import asyncPool from 'tiny-async-pool';
import OpenAI from 'openai';

config({ path: '../.env' });

// Define types to improve type inference
type LangCode = 'cn' | 'jp' | 'kp';

interface LanguageConfig {
  name: string;
  dir: string;
}

interface TranslationMapping {
  [key: string]: string;
}

interface ContentItem {
  slug: string;
  title: string;
  category: string;
  content: string;
  date: string;
}

// Fixed translations configuration using our defined types
const FIXED_TRANSLATIONS: Record<string, TranslationMapping> = {
  'Donald J. Trump': {
    cn: '唐纳德·J·特朗普',
    jp: 'ドナルド・J・トランプ',
    kp: '도널드 제이 트럼프',
  },
};

// Separate category translations configuration
const CATEGORY_TRANSLATIONS: Record<string, TranslationMapping> = {
  'Fact Sheets': { cn: '情况说明', jp: 'ファクトシート', kp: '사실 자료' },
  Articles: { cn: '文章', jp: '記事', kp: '기사' },
  'Briefings & Statements': {
    cn: '简报和声明',
    jp: 'ブリーフィングと声明',
    kp: '브리핑과 성명',
  },
  'Presidential Actions': { cn: '总统行动', jp: '大統領令', kp: '수반 결정' },
  Remarks: { cn: '讲话', jp: '発言', kp: '담화' },
};

const LANG_CONFIG: Record<LangCode, LanguageConfig> = {
  cn: { name: '中文', dir: 'cn' },
  jp: { name: '日本語', dir: 'jp' },
  kp: { name: '조선어', dir: 'kp' },
};

const MAX_RETRIES = 4;
const CONCURRENCY = 20;

// Initialize OpenAI client for DeepSeek API
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function translateText(
  text: string,
  targetLang: LangCode
): Promise<string> {
  console.log(
    `[DEBUG] Translating to ${targetLang}, text length: ${text.length} characters`
  );

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[DEBUG] API call attempt ${attempt + 1}/${MAX_RETRIES} for ${targetLang}`
      );

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the JSON object to ${LANG_CONFIG[targetLang].name}. Only translate the values of "title", "category", and "content" fields. Do not translate any other fields or keys. Preserve all formatting, markdown, and structure in the content. 
            
            Use these specific translations for the following terms:
            ${Object.entries(FIXED_TRANSLATIONS)
              .map(
                ([key, translations]) =>
                  `- "${key}" should be translated as "${translations[targetLang]}"`
              )
              .join('\n')}
            
            For categories, use these specific translations:
            ${Object.entries(CATEGORY_TRANSLATIONS)
              .map(
                ([key, translations]) =>
                  `- "${key}" should be translated as "${translations[targetLang]}"`
              )
              .join('\n')}
            
            Return only the translated JSON object.`,
          },
          { role: 'user', content: text },
        ],
      });

      console.log(`[DEBUG] API response received for ${targetLang}`);
      return completion.choices[0].message.content?.trim() || '';
    } catch (error: any) {
      console.error(
        `[DEBUG] Translation error (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        error.message
      );
      if (attempt === MAX_RETRIES - 1) throw error;
      console.log(`[DEBUG] Retrying in ${2000 * (attempt + 1)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
  return text;
}

async function translateItem(
  item: ContentItem,
  targetLang: LangCode,
  existingTranslations: ContentItem[],
  filePath: string
): Promise<ContentItem> {
  console.log(
    `[DEBUG] Translating item with slug: ${item.slug} to ${targetLang}`
  );

  const existing = existingTranslations.find((t) => t.slug === item.slug);
  if (existing) {
    console.log(
      `[DEBUG] Found existing translation for ${item.slug}, skipping`
    );
    console.log(`Skipping translation for: ${item.slug}`);
    return existing;
  }

  // Create a copy of the item to translate
  const itemToTranslate = { ...item };

  // Convert the item to JSON string for translation
  const jsonString = JSON.stringify(itemToTranslate);
  console.log(
    `[DEBUG] JSON string for translation, length: ${jsonString.length}`
  );

  // Translate the entire JSON object at once
  const translatedJsonString = await translateText(jsonString, targetLang);
  console.log(
    `[DEBUG] Received translated JSON string, length: ${translatedJsonString.length}`
  );

  try {
    // Parse the translated JSON string back to an object
    const translatedItem: ContentItem = JSON.parse(translatedJsonString);
    console.log(`[DEBUG] Successfully parsed translated JSON for ${item.slug}`);

    // Validate that the translated item has all required fields
    if (
      !translatedItem.title ||
      !translatedItem.category ||
      !translatedItem.date ||
      !translatedItem.slug ||
      !translatedItem.content
    ) {
      throw new Error(
        `Missing required fields in translated item for ${item.slug}`
      );
    }

    // Save the updated translations immediately after each successful translation
    existingTranslations.push(translatedItem);
    await fsPromises.writeFile(
      filePath,
      JSON.stringify(existingTranslations, null, 2)
    );
    console.log(
      `[DEBUG] Saved updated translations to ${filePath} after translating ${item.slug}`
    );

    return translatedItem;
  } catch (error: any) {
    console.error(
      `[DEBUG] Error parsing translated JSON for ${item.slug}:`,
      error
    );
    // Fallback to the original item with predefined category translation
    console.log(
      `[DEBUG] Falling back to original item with predefined category translation`
    );

    // Save the fallback translation
    existingTranslations.push(itemToTranslate);
    await fsPromises.writeFile(
      filePath,
      JSON.stringify(existingTranslations, null, 2)
    );
    console.log(
      `[DEBUG] Saved fallback translation to ${filePath} for ${item.slug}`
    );

    return itemToTranslate;
  }
}

async function main() {
  console.log(`[DEBUG] Starting translation process`);
  const enContent: ContentItem[] = JSON.parse(
    readFileSync('../contents/en/contents.json', 'utf-8')
  );
  console.log(`[DEBUG] Loaded ${enContent.length} items from English content`);

  for (const [langCode, langInfo] of Object.entries(LANG_CONFIG)) {
    const targetLang = langCode as LangCode;
    console.log(
      `[DEBUG] Processing language: ${langInfo.name} (${targetLang})`
    );

    const filePath = join('..', 'contents', langInfo.dir, 'contents.json');

    let existing: ContentItem[] = [];
    if (existsSync(filePath)) {
      existing = JSON.parse(readFileSync(filePath, 'utf-8'));
      console.log(
        `[DEBUG] Loaded ${existing.length} existing translations for ${targetLang}`
      );
    } else {
      console.log(`[DEBUG] No existing translations found for ${targetLang}`);
      // Initialize the file with an empty array
      await fsPromises.writeFile(filePath, JSON.stringify([], null, 2));
    }

    // Filter out already translated items:
    const itemsToTranslate = enContent.filter(
      (item) => !existing.find((t) => t.slug === item.slug)
    );
    console.log(
      `[DEBUG] Starting translation pool with concurrency: ${CONCURRENCY} for ${itemsToTranslate.length} items`
    );

    // Use asyncPool to translate concurrently
    for await (const result of asyncPool(
      CONCURRENCY,
      itemsToTranslate,
      async (item: ContentItem) => {
        await translateItem(item, targetLang, existing, filePath);
        console.log(
          `[DEBUG] Completed translation for ${item.slug} to ${targetLang}`
        );
        return item.slug;
      }
    )) {
      // Process each result as it completes
      console.log(`[DEBUG] Processed result: ${result}`);
    }

    // Sort the contents by date, with newer items first
    existing.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Save the sorted contents
    await fsPromises.writeFile(filePath, JSON.stringify(existing, null, 2));
    console.log(
      `[DEBUG] Sorted contents by date (newest first) and saved to ${filePath}`
    );

    console.log(
      `[DEBUG] Completed all translations for ${targetLang}, total items: ${existing.length}`
    );
    console.log(`Translated ${existing.length} items to ${langInfo.name}`);
  }
  console.log(`[DEBUG] Translation process completed`);
}

main().catch((error) => {
  console.error(`[DEBUG] Fatal error in main process:`, error);
  console.error(error);
});
