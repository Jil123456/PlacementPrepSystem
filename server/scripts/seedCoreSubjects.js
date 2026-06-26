const { sequelize, Question } = require('../models');
const https = require('https');

const URLS = [
  { subcategory: 'cn', url: 'https://takeuforward.org/computer-network/most-asked-computer-networks-interview-questions' },
  { subcategory: 'dbms', url: 'https://takeuforward.org/dbms/most-asked-dbms-interview-questions' },
  { subcategory: 'os', url: 'https://takeuforward.org/operating-system/most-asked-operating-system-interview-questions' }
];

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeAndSeed() {
  console.log("Starting Core CS Subjects Seeding Process...");
  try {
    await sequelize.authenticate();
    
    // Clear existing core subject questions so we don't duplicate
    await Question.destroy({ where: { category: 'core_subject' } });

    let totalInserted = 0;

    for (const { subcategory, url } of URLS) {
      console.log(`Fetching ${subcategory} from ${url}...`);
      let html = await fetchHtml(url);

      // Strip Next.js chunk boundaries that split the JSON string
      html = html.replace(/"]\)<\/script><script>self\.__next_f\.push\(\[1,"/g, "");

      let startIndex = html.indexOf('[{"category_id"');
      if (startIndex === -1) {
        startIndex = html.indexOf('[{\\"category_id\\"');
        if (startIndex === -1) {
          console.error(`Could not find JSON payload for ${subcategory}`);
          continue;
        }
      }

      let arrayStart = startIndex;
      let openBrackets = 0;
      let arrayEnd = -1;

      for (let i = arrayStart; i < html.length; i++) {
        if (html[i] === '[') openBrackets++;
        if (html[i] === ']') {
          openBrackets--;
          if (openBrackets === 0) {
            arrayEnd = i;
            break;
          }
        }
      }

      if (arrayEnd === -1) {
        console.error(`Could not find end of JSON array for ${subcategory}`);
        continue;
      }

      let rawStr = html.substring(arrayStart, arrayEnd + 1);
      
      if (rawStr.includes('\\"')) {
        rawStr = rawStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }

      let sections = [];
      try {
        sections = JSON.parse(rawStr);
      } catch (err) {
        console.error(`Failed to parse JSON for ${subcategory}:`, err.message);
        continue;
      }

      let questionsToInsert = [];
      
      for (const section of sections) {
        if (section.problems && Array.isArray(section.problems)) {
          for (const p of section.problems) {
            let articleUrl = p.article || p.link || null;
            if (articleUrl && articleUrl.startsWith('/')) {
                articleUrl = `https://takeuforward.org${articleUrl}`;
            }

            questionsToInsert.push({
              category: 'core_subject',
              subcategory: subcategory, // 'cn', 'dbms', or 'os'
              difficulty: (p.difficulty || 'easy').toLowerCase(),
              title: p.problem_name || 'Untitled',
              description: `Article: ${articleUrl || 'N/A'}\nVideo: ${p.youtube || 'N/A'}\nTopic: ${section.category_name || 'General'}`,
              correct_answer: 'completed', // Using same logic as DSA
              explanation: 'Refer to Striver video or article.',
              time_limit_seconds: 1800 // 30 minutes
            });
          }
        }
      }

      if (questionsToInsert.length > 0) {
        await Question.bulkCreate(questionsToInsert);
        totalInserted += questionsToInsert.length;
        console.log(`Inserted ${questionsToInsert.length} questions for ${subcategory}.`);
      } else {
        console.log(`No questions found for ${subcategory}.`);
      }
    }

    console.log(`Successfully inserted a total of ${totalInserted} Core CS questions!`);
    process.exit(0);
  } catch (error) {
    console.error("Fatal Seeding Error:", error);
    process.exit(1);
  }
}

scrapeAndSeed();
