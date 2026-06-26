const sequelize = require('./config/database');

const questions = [
    { title: 'Best Time to Buy and Sell Stock', description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.\n\n### **Example 1:**\n```text\nInput: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.\n```\n\n### **Constraints:**\n* `1 <= prices.length <= 10^5`\n* `0 <= prices[i] <= 10^4`\n' },
    { title: 'Contains Duplicate', description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.\n\n### **Example 1:**\n```text\nInput: nums = [1,2,3,1]\nOutput: true\n```\n\n### **Example 2:**\n```text\nInput: nums = [1,2,3,4]\nOutput: false\n```\n\n### **Constraints:**\n* `1 <= nums.length <= 10^5`\n* `-10^9 <= nums[i] <= 10^9`\n' },
    { title: '3Sum', description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.\n\n### **Example 1:**\n```text\nInput: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\n```\n\n### **Constraints:**\n* `3 <= nums.length <= 3000`\n* `-10^5 <= nums[i] <= 10^5`\n' },
    { title: 'Container With Most Water', description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\n### **Example 1:**\n```text\nInput: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\n```\n\n### **Constraints:**\n* `n == height.length`\n* `2 <= n <= 10^5`\n* `0 <= height[i] <= 10^4`\n' },
    { title: 'Valid Palindrome', description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.\n\n### **Example 1:**\n```text\nInput: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: "amanaplanacanalpanama" is a palindrome.\n```\n\n### **Constraints:**\n* `1 <= s.length <= 2 * 10^5`\n* `s` consists only of printable ASCII characters.\n' },
    { title: 'Valid Anagram', description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.\n\n### **Example 1:**\n```text\nInput: s = "anagram", t = "nagaram"\nOutput: true\n```\n\n### **Constraints:**\n* `1 <= s.length, t.length <= 5 * 10^4`\n* `s` and `t` consist of lowercase English letters.\n' },
    { title: 'Longest Substring Without Repeating Characters', description: 'Given a string `s`, find the length of the longest substring without repeating characters.\n\n### **Example 1:**\n```text\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n```\n\n### **Constraints:**\n* `0 <= s.length <= 5 * 10^4`\n* `s` consists of English letters, digits, symbols and spaces.\n' },
    { title: 'Longest Palindromic Substring', description: 'Given a string `s`, return the longest palindromic substring in `s`.\n\n### **Example 1:**\n```text\nInput: s = "babad"\nOutput: "bab"\nExplanation: "aba" is also a valid answer.\n```\n\n### **Constraints:**\n* `1 <= s.length <= 1000`\n* `s` consist of only digits and English letters.\n' }
];

async function updateDB() {
  try {
    for (let q of questions) {
      await sequelize.query(
        "UPDATE questions SET description = :desc WHERE title = :title", 
        { replacements: { desc: q.description, title: q.title } }
      );
    }
    // Also update all standard generic questions
    const genericDesc = `This is a standard problem for this topic. You need to find the optimal solution given constraints.\n\n### **Example 1:**\n\`\`\`text\nInput: arr = [1, 2, 3], target = 4\nOutput: [1, 2]\nExplanation: 1 + 3 = 4\n\`\`\`\n\n### **Constraints:**\n* \`1 <= arr.length <= 10^5\`\n* \`-10^9 <= arr[i] <= 10^9\`\n`;
    await sequelize.query(
        "UPDATE questions SET description = :desc WHERE title LIKE 'Standard %'", 
        { replacements: { desc: genericDesc } }
    );
    console.log("All questions successfully updated in DB!");
  } catch (err) {
    console.error("Error updating DB:", err);
  } finally {
    process.exit(0);
  }
}

updateDB();
