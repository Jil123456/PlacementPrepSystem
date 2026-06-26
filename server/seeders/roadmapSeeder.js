module.exports = async (db) => {
  const roadmapDays = [];

  // Arrays
  for(let i=1; i<=3; i++) roadmapDays.push({ day_number: i, title: `Arrays Basics - Day ${i}`, description: 'Master array fundamentals.', focus_area: 'Arrays', topics_covered: JSON.stringify(['arrays', 'loops']), is_revision_day: false, revision_of_days: null });
  for(let i=4; i<=6; i++) roadmapDays.push({ day_number: i, title: `Arrays Advanced - Day ${i}`, description: 'Two pointers and sliding window.', focus_area: 'Arrays & Aptitude', topics_covered: JSON.stringify(['two-pointers', 'percentages']), is_revision_day: false, revision_of_days: null });
  
  // Strings
  for(let i=7; i<=9; i++) roadmapDays.push({ day_number: i, title: `Strings Basics - Day ${i}`, description: 'String manipulation.', focus_area: 'Strings & Aptitude', topics_covered: JSON.stringify(['strings', 'profit-loss']), is_revision_day: false, revision_of_days: null });
  for(let i=10; i<=12; i++) roadmapDays.push({ day_number: i, title: `Strings Advanced - Day ${i}`, description: 'Anagrams and Palindromes.', focus_area: 'Strings & Aptitude', topics_covered: JSON.stringify(['strings', 'time-work']), is_revision_day: false, revision_of_days: null });
  
  // Revision 1
  roadmapDays.push({ day_number: 13, title: 'Revision Day 1', description: 'Revise Arrays and Strings.', focus_area: 'Revision', topics_covered: JSON.stringify(['arrays', 'strings', 'aptitude']), is_revision_day: true, revision_of_days: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12]) });

  // Linked List
  for(let i=14; i<=16; i++) roadmapDays.push({ day_number: i, title: `Linked Lists - Day ${i}`, description: 'Traversal and modification.', focus_area: 'Linked Lists & Aptitude', topics_covered: JSON.stringify(['linked-list', 'time-distance']), is_revision_day: false, revision_of_days: null });

  // Stacks & Queues
  for(let i=17; i<=19; i++) roadmapDays.push({ day_number: i, title: `Stacks & Queues - Day ${i}`, description: 'LIFO and FIFO data structures.', focus_area: 'Stacks & Queues', topics_covered: JSON.stringify(['stacks', 'queues', 'averages']), is_revision_day: false, revision_of_days: null });

  // Trees & DBMS
  for(let i=20; i<=22; i++) roadmapDays.push({ day_number: i, title: `Trees & BST - Day ${i}`, description: 'Binary trees and search trees.', focus_area: 'Trees & DBMS', topics_covered: JSON.stringify(['trees', 'dbms-basics']), is_revision_day: false, revision_of_days: null });

  // Revision 2
  roadmapDays.push({ day_number: 23, title: 'Revision Day 2', description: 'Revise Linked Lists, Stacks, Queues, Trees.', focus_area: 'Revision', topics_covered: JSON.stringify(['linked-list', 'stacks', 'trees', 'dbms']), is_revision_day: true, revision_of_days: JSON.stringify([14,15,16,17,18,19,20,21,22]) });

  // Trees Advanced & DBMS Advanced
  for(let i=24; i<=26; i++) roadmapDays.push({ day_number: i, title: `Trees Advanced - Day ${i}`, description: 'Complex tree algorithms.', focus_area: 'Trees & DBMS', topics_covered: JSON.stringify(['trees', 'dbms-advanced']), is_revision_day: false, revision_of_days: null });

  // Graphs
  for(let i=27; i<=29; i++) roadmapDays.push({ day_number: i, title: `Graphs Basics - Day ${i}`, description: 'BFS and DFS.', focus_area: 'Graphs & OS', topics_covered: JSON.stringify(['graphs', 'os-basics']), is_revision_day: false, revision_of_days: null });
  for(let i=30; i<=32; i++) roadmapDays.push({ day_number: i, title: `Graphs Advanced - Day ${i}`, description: 'Shortest paths and MST.', focus_area: 'Graphs & OS', topics_covered: JSON.stringify(['graphs', 'os-advanced']), is_revision_day: false, revision_of_days: null });

  // Revision 3
  roadmapDays.push({ day_number: 33, title: 'Revision Day 3', description: 'Revise Trees and Graphs.', focus_area: 'Revision', topics_covered: JSON.stringify(['trees', 'graphs', 'dbms', 'os']), is_revision_day: true, revision_of_days: JSON.stringify([24,25,26,27,28,29,30,31,32]) });

  // DP & Computer Networks
  for(let i=34; i<=36; i++) roadmapDays.push({ day_number: i, title: `Dynamic Programming - Day ${i}`, description: 'Memoization and tabulation.', focus_area: 'DP & CN', topics_covered: JSON.stringify(['dp', 'cn-basics']), is_revision_day: false, revision_of_days: null });
  for(let i=37; i<=39; i++) roadmapDays.push({ day_number: i, title: `DP Advanced - Day ${i}`, description: 'Knapsack, LCS.', focus_area: 'DP & CN', topics_covered: JSON.stringify(['dp', 'cn-advanced']), is_revision_day: false, revision_of_days: null });

  // DP Hard & Logical Reasoning
  for(let i=40; i<=42; i++) roadmapDays.push({ day_number: i, title: `DP Hard - Day ${i}`, description: 'Advanced DP patterns.', focus_area: 'DP & Logical', topics_covered: JSON.stringify(['dp', 'logical-reasoning']), is_revision_day: false, revision_of_days: null });

  // Revision 4
  roadmapDays.push({ day_number: 43, title: 'Revision Day 4 & Mock Test', description: 'Revise DP and take Mock Test 1.', focus_area: 'Revision & Mock', topics_covered: JSON.stringify(['dp', 'cn', 'logical']), is_revision_day: true, revision_of_days: JSON.stringify([34,35,36,37,38,39,40,41,42]) });

  // Greedy & Backtracking
  for(let i=44; i<=46; i++) roadmapDays.push({ day_number: i, title: `Greedy & Backtracking - Day ${i}`, description: 'Algorithm patterns.', focus_area: 'Algorithms & Verbal', topics_covered: JSON.stringify(['greedy', 'backtracking', 'verbal']), is_revision_day: false, revision_of_days: null });

  // Mixed Practice
  for(let i=47; i<=49; i++) roadmapDays.push({ day_number: i, title: `Mixed DSA Practice - Day ${i}`, description: 'Solve random problems.', focus_area: 'Mixed Practice', topics_covered: JSON.stringify(['mixed-dsa', 'mixed-aptitude']), is_revision_day: false, revision_of_days: null });

  // Revision 5
  roadmapDays.push({ day_number: 50, title: 'Revision Day 5 & Mock Test', description: 'Take Mock Test 2.', focus_area: 'Revision & Mock', topics_covered: JSON.stringify(['mixed']), is_revision_day: true, revision_of_days: JSON.stringify([44,45,46,47,48,49]) });

  // HR & Prep
  for(let i=51; i<=53; i++) roadmapDays.push({ day_number: i, title: `HR Interview Prep - Day ${i}`, description: 'Common HR questions.', focus_area: 'HR', topics_covered: JSON.stringify(['hr', 'behavioral']), is_revision_day: false, revision_of_days: null });
  for(let i=54; i<=56; i++) roadmapDays.push({ day_number: i, title: `Full Mock Tests - Day ${i}`, description: 'Practice full mock tests.', focus_area: 'Mock Tests', topics_covered: JSON.stringify(['mock-tests']), is_revision_day: false, revision_of_days: null });
  for(let i=57; i<=59; i++) roadmapDays.push({ day_number: i, title: `Final Revision - Day ${i}`, description: 'Review everything.', focus_area: 'Final Revision', topics_covered: JSON.stringify(['all']), is_revision_day: false, revision_of_days: null });

  // Final Mock
  roadmapDays.push({ day_number: 60, title: 'Final Mock Test', description: 'The ultimate test.', focus_area: 'Final Mock', topics_covered: JSON.stringify(['all']), is_revision_day: false, revision_of_days: null });

  await db.RoadmapDay.bulkCreate(roadmapDays);
  console.log(`✅ ${roadmapDays.length} Roadmap Days Seeded`);
};
