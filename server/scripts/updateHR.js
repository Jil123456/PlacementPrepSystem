const sequelize = require('./config/database');

const realHRQuestions = [
  { title: 'behavioral Question 3', desc: 'Describe a time when you had to work with a difficult team member. How did you handle it and what was the outcome?', answer: 'Use STAR: Situation - conflict with team member. Task - needed to deliver project. Action - had a private conversation, found common ground. Result - improved collaboration and delivered on time.' },
  { title: 'behavioral Question 4', desc: 'Tell me about a time you failed at something. What did you learn from it?', answer: 'Use STAR: Acknowledge the failure honestly, explain what you learned, and how you applied that lesson going forward.' },
  { title: 'behavioral Question 5', desc: 'Give an example of a goal you set and how you achieved it.', answer: 'Use STAR: Set a specific goal, broke it into milestones, tracked progress, overcame obstacles, achieved result.' },
  { title: 'situational Question 6', desc: 'If your manager asked you to complete a task you disagreed with, how would you handle it?', answer: 'Express concerns professionally, understand the reasoning, suggest alternatives if appropriate, but ultimately execute if the decision stands.' },
  { title: 'situational Question 7', desc: 'How would you handle a situation where you have two urgent deadlines at the same time?', answer: 'Prioritize based on impact and urgency, communicate with stakeholders about realistic timelines, delegate if possible, and work efficiently.' },
  { title: 'situational Question 8', desc: 'Imagine you discover a colleague is taking credit for your work. What would you do?', answer: 'Address it directly and privately with the colleague first. If unresolved, document your contributions and discuss with your manager.' },
  { title: 'company_specific Question 9', desc: 'Why do you want to work at our company specifically? What attracts you to this role?', answer: 'Research the company values, products, and culture. Connect your skills and career goals to what the company offers.' },
  { title: 'company_specific Question 10', desc: 'Where do you see yourself in 5 years?', answer: 'Show ambition aligned with the company. Mention growth in skills, taking on leadership, and contributing to larger projects.' },
  { title: 'company_specific Question 11', desc: 'What do you know about our company and our products/services?', answer: 'Demonstrate research: mention specific products, recent news, company mission, and how your role contributes to their goals.' },
  { title: 'technical Question 12', desc: 'Explain a complex technical concept to a non-technical person. Choose any topic you are comfortable with.', answer: 'Use analogies, avoid jargon, break it into simple steps, and check for understanding. Shows communication skills.' },
  { title: 'technical Question 13', desc: 'Describe the most challenging project you have worked on. What made it challenging and how did you overcome it?', answer: 'Use STAR: Describe scope, technical challenges, your approach to solving them, and the successful outcome with metrics if possible.' },
  { title: 'technical Question 14', desc: 'How do you stay updated with the latest technology trends in your field?', answer: 'Mention specific resources: tech blogs, conferences, online courses, open-source contributions, side projects, and community involvement.' },
  { title: 'salary_career Question 15', desc: 'What are your salary expectations for this role?', answer: 'Research market rates, provide a range based on your experience and the role, and express flexibility to discuss based on the total compensation package.' },
  { title: 'salary_career Question 16', desc: 'Why are you leaving your current job? (or Why did you leave your last position?)', answer: 'Stay positive. Focus on seeking new challenges, career growth, learning opportunities, or better alignment with your career goals.' },
  { title: 'salary_career Question 17', desc: 'What motivates you to perform well at work?', answer: 'Mention intrinsic motivators like solving problems, learning new things, making an impact, and working with talented teams.' },
  { title: 'self_introduction Question 18', desc: 'Walk me through your resume. What are the key highlights you want me to know?', answer: 'Start chronologically, highlight relevant experiences, key achievements, skills gained, and connect them to the current role.' },
  { title: 'self_introduction Question 19', desc: 'How would your colleagues or friends describe you in three words?', answer: 'Choose authentic words that reflect professional qualities: e.g., reliable, curious, collaborative. Give a brief example for each.' },
  { title: 'strengths_weaknesses Question 20', desc: 'What is the biggest constructive feedback you have received, and how did you act on it?', answer: 'Show self-awareness: describe the feedback honestly, explain how you processed it, the steps you took to improve, and the result.' },
  { title: 'strengths_weaknesses Question 21', desc: 'What unique qualities or skills do you bring to this team that others might not?', answer: 'Highlight a unique combination of skills, experiences, or perspectives. Give concrete examples of how this has added value in the past.' },
  { title: 'behavioral Question 22', desc: 'Tell me about a time you had to learn something new very quickly. How did you approach it?', answer: 'Use STAR: Describe the situation, the learning strategy you used, how you applied the new knowledge, and the successful result.' },
  { title: 'behavioral Question 23', desc: 'Describe a situation where you went above and beyond what was expected of you.', answer: 'Use STAR: Show initiative, describe the extra effort, and quantify the positive impact it had on the team or project.' },
  { title: 'situational Question 24', desc: 'If you were assigned to lead a project with team members more experienced than you, how would you handle it?', answer: 'Acknowledge their expertise, be open to learning, clearly define roles, facilitate communication, and lead through organization and vision.' },
  { title: 'situational Question 25', desc: 'How would you handle receiving negative feedback from your manager in front of the team?', answer: 'Stay calm and professional, thank them for the feedback, discuss privately later if needed, and focus on improvement.' },
  { title: 'situational Question 26', desc: 'If you realize mid-project that your approach is wrong, what would you do?', answer: 'Acknowledge the issue early, analyze what went wrong, propose a corrected approach, communicate with stakeholders, and pivot quickly.' },
  { title: 'company_specific Question 27', desc: 'What would you do in your first 90 days if hired for this role?', answer: 'Learn the codebase/processes, build relationships with team members, understand business goals, identify quick wins, and create a 90-day action plan.' },
  { title: 'technical Question 28', desc: 'How do you approach debugging a complex issue that you have never seen before?', answer: 'Reproduce the issue, read error logs, isolate the problem, research documentation, test hypotheses systematically, and document the solution.' },
  { title: 'technical Question 29', desc: 'Describe your approach to writing clean, maintainable code.', answer: 'Follow SOLID principles, write meaningful variable names, add comments for complex logic, write tests, conduct code reviews, and refactor regularly.' },
  { title: 'salary_career Question 30', desc: 'Do you prefer working independently or as part of a team? Why?', answer: 'Show flexibility: enjoy both. Independent work for deep focus tasks, team collaboration for brainstorming and complex projects. Give examples of both.' }
];

async function updateDB() {
  try {
    for (const q of realHRQuestions) {
      await sequelize.query(
        "UPDATE questions SET description = :desc, correct_answer = :answer WHERE title = :title",
        { replacements: { desc: q.desc, answer: q.answer, title: q.title } }
      );
    }
    
    // Also update any remaining generic ones
    const remaining = await sequelize.query(
      "SELECT id, title FROM questions WHERE category = 'hr' AND description LIKE '%Generic HR question%'",
      { type: sequelize.constructor.QueryTypes.SELECT }
    );
    
    const genericReplacements = [
      'Tell me about a time you demonstrated leadership skills.',
      'How do you handle stress and pressure at work?',
      'What is your approach to time management?',
      'Describe a situation where you had to make a difficult decision.',
      'How do you handle constructive criticism?',
      'What are your long-term career goals?',
      'Tell me about a time you resolved a conflict in your team.',
      'How do you prioritize your tasks when everything seems urgent?',
      'What is the most innovative idea you have contributed to a project?',
      'How do you ensure effective communication in a remote/hybrid team?',
      'Describe your ideal work environment.',
      'What would you do if you disagreed with your team\'s technical approach?',
      'How do you handle ambiguity in project requirements?',
      'Tell me about a project you are most proud of.',
      'What steps do you take to ensure quality in your work?',
      'How do you adapt to changes in project scope or requirements?',
      'Describe a time when you mentored or helped a junior colleague.',
      'What do you do when you feel stuck on a problem?',
      'How do you balance speed and quality in your work?',
      'What is your experience with Agile/Scrum methodologies?'
    ];
    
    for (let i = 0; i < remaining.length; i++) {
      const desc = genericReplacements[i % genericReplacements.length];
      await sequelize.query(
        "UPDATE questions SET description = :desc WHERE id = :id",
        { replacements: { desc: desc, id: remaining[i].id } }
      );
    }
    
    console.log('All HR questions updated successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

updateDB();
