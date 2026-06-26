const { CompanyMode } = require('../models');

const defaultModes = {
  balanced: {
    dsa: { percentage: 40, focus_topics: [] },
    aptitude: { percentage: 30, focus_topics: [] },
    core: { percentage: 20, focus_topics: [] },
    hr: { percentage: 10, focus_topics: [] },
    difficulty: 'medium',
  },
  product: {
    dsa: { percentage: 60, focus_topics: ['arrays', 'trees', 'graphs', 'dynamic_programming'] },
    aptitude: { percentage: 10, focus_topics: [] },
    core: { percentage: 20, focus_topics: ['os', 'dbms', 'networks'] },
    hr: { percentage: 10, focus_topics: [] },
    difficulty: 'hard',
  },
  service: {
    dsa: { percentage: 30, focus_topics: ['arrays', 'strings', 'sorting'] },
    aptitude: { percentage: 40, focus_topics: ['quant', 'logical', 'verbal'] },
    core: { percentage: 20, focus_topics: [] },
    hr: { percentage: 10, focus_topics: [] },
    difficulty: 'medium',
  },
  startup: {
    dsa: { percentage: 50, focus_topics: ['arrays', 'strings', 'trees'] },
    aptitude: { percentage: 15, focus_topics: [] },
    core: { percentage: 20, focus_topics: [] },
    hr: { percentage: 15, focus_topics: ['behavioral', 'situational'] },
    difficulty: 'medium',
  },
};

function getModeConfig(modeName) {
  return defaultModes[modeName] || defaultModes.balanced;
}

function adjustTasksForMode(tasks, modeName) {
  const modeConfig = getModeConfig(modeName);
  if (!tasks || tasks.length === 0) return tasks;

  const typeMap = {
    dsa: modeConfig.dsa,
    aptitude: modeConfig.aptitude,
    concept: modeConfig.core,
    hr: modeConfig.hr,
  };

  return tasks.map((task) => {
    const taskData = task.toJSON ? task.toJSON() : task;
    const weight = typeMap[taskData.type];
    return {
      ...taskData,
      priority: weight ? weight.percentage : 0,
      focus_topics: weight ? weight.focus_topics : [],
    };
  }).sort((a, b) => b.priority - a.priority);
}

module.exports = { getModeConfig, adjustTasksForMode, defaultModes };
