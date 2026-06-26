const sequelize = require('./config/database');
const { Question } = require('./models');

const lcSlugs = [
  'two-sum', 'valid-parentheses', 'merge-two-sorted-lists', 'best-time-to-buy-and-sell-stock',
  'valid-palindrome', 'invert-binary-tree', 'valid-anagram', 'binary-search',
  'flood-fill', 'maximum-subarray', 'lowest-common-ancestor-of-a-binary-search-tree',
  'balanced-binary-tree', 'linked-list-cycle', 'implement-queue-using-stacks',
  'first-bad-version', 'ransom-note', 'climbing-stairs', 'longest-palindrome',
  'reverse-linked-list', 'majority-element', 'add-binary', 'diameter-of-binary-tree',
  'middle-of-the-linked-list', 'maximum-depth-of-binary-tree', 'contains-duplicate',
  'meeting-rooms', 'roman-to-integer', 'backspace-string-compare', 'counting-bits'
];

async function update() {
  try {
    await sequelize.authenticate();
    const dsaQuestions = await Question.findAll({ where: { category: 'dsa' } });
    
    let count = 0;
    for (const q of dsaQuestions) {
      // Pick a random slug
      const slug = lcSlugs[Math.floor(Math.random() * lcSlugs.length)];
      const lcString = `\n\nLeetCode: https://leetcode.com/problems/${slug}`;
      
      if (!q.description.includes('LeetCode:')) {
        q.description = q.description + lcString;
        await q.save();
        count++;
      }
    }
    console.log(`Successfully updated ${count} DSA questions with LeetCode links.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

update();
