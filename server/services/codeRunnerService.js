const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
  'javascript': { language: 'javascript', version: '18.15.0' },
  'python': { language: 'python', version: '3.10.0' },
  'java': { language: 'java', version: '15.0.2' },
  'cpp': { language: 'cpp', version: '10.2.0' },
};

function getWrapperCode(language, userCode, inputSizes) {
  if (language === 'javascript') {
    return `
      ${userCode}

      function generateArray(size) {
        return Array.from({length: size}, () => Math.floor(Math.random() * 1000));
      }

      const sizes = ${JSON.stringify(inputSizes)};
      const results = [];

      for (const N of sizes) {
        const input = generateArray(N);
        const start = process.hrtime.bigint();
        
        try {
          if (typeof solve === 'function') {
            solve(input);
          } else if (typeof twoSum === 'function') {
            twoSum(input, 9);
          } else {
             // Fallback
          }
        } catch(e) {}
        
        const end = process.hrtime.bigint();
        const time_ms = Number(end - start) / 1000000;
        const memory_kb = Math.round(process.memoryUsage().heapUsed / 1024);
        
        results.push({ N, time_ms, memory_kb });
      }

      console.log('---COMPLEXITY_METRICS---');
      console.log(JSON.stringify(results));
    `;
  }
  
  if (language === 'python') {
    return `
import time
import json
import sys
import random

${userCode}

def generate_array(size):
    return [random.randint(0, 1000) for _ in range(size)]

sizes = ${JSON.stringify(inputSizes)}
results = []

for N in sizes:
    inp = generate_array(N)
    start_time = time.perf_counter()
    try:
        if 'solve' in globals():
            solve(inp)
    except Exception as e:
        pass
    end_time = time.perf_counter()
    
    time_ms = (end_time - start_time) * 1000
    memory_kb = sys.getsizeof(inp) / 1024
    
    results.append({"N": N, "time_ms": time_ms, "memory_kb": memory_kb})

print("---COMPLEXITY_METRICS---")
print(json.dumps(results))
    `;
  }

  return userCode;
}

async function runComplexityTests(code, language) {
  const langConfig = LANGUAGE_MAP[language.toLowerCase()] || LANGUAGE_MAP['javascript'];
  const inputSizes = [10, 100, 1000, 10000];
  
  const wrappedCode = getWrapperCode(langConfig.language, code, inputSizes);

  try {
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: wrappedCode }]
    });

    const runResult = response.data.run;
    const output = runResult.stdout || runResult.output || '';
    
    const marker = '---COMPLEXITY_METRICS---';
    if (output.includes(marker)) {
      const parts = output.split(marker);
      const metricsJson = parts[1].trim().split('\\n')[0];
      try {
        const metrics = JSON.parse(metricsJson);
        return metrics;
      } catch (e) {
        console.error("Failed to parse metrics JSON:", e);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Code execution failed:", error);
    return null;
  }
}

module.exports = {
  runComplexityTests
};
