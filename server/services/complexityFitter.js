/**
 * complexityFitter.js
 * 
 * Takes empirical data points { N, time_ms, memory_kb }
 * and fits them against common Big-O complexity curves.
 */

const COMPLEXITY_CLASSES = [
  { name: 'O(1)', fn: (n) => 1 },
  { name: 'O(log n)', fn: (n) => Math.log2(n) || 1 },
  { name: 'O(n)', fn: (n) => n },
  { name: 'O(n log n)', fn: (n) => n * (Math.log2(n) || 1) },
  { name: 'O(n^2)', fn: (n) => n * n },
  { name: 'O(2^n)', fn: (n) => Math.pow(2, Math.min(n, 30)) } // cap to avoid Infinity
];

function analyzeComplexity(metrics, key = 'time_ms') {
  if (!metrics || metrics.length < 2) return "Unknown";

  // Filter out any 0 times which would ruin the division
  const validMetrics = metrics.map(m => ({
    n: m.N,
    val: Math.max(m[key], 0.0001) // avoid divide by zero
  }));

  let bestFit = null;
  let lowestRsd = Infinity; // Relative Standard Deviation of 'c' (T(N)/f(N))

  for (const cClass of COMPLEXITY_CLASSES) {
    const ratios = validMetrics.map(m => m.val / cClass.fn(m.n));
    
    // Calculate mean of ratios
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    
    // Calculate standard deviation of ratios
    const variance = ratios.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / ratios.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Relative Standard Deviation (RSD)
    const rsd = stdDev / mean;
    
    // Special heuristic: if variance is extremely low and value is very small, it might just be O(1)
    if (rsd < lowestRsd) {
      lowestRsd = rsd;
      bestFit = cClass.name;
    }
  }

  // Fallback heuristics based on max N processed
  if (key === 'time_ms' && bestFit === 'O(1)') {
    // If time is consistently very small across all N, it's O(1).
    // Let's just trust the RSD, but maybe add a penalty for higher complexities 
    // to prefer simpler bounds if the data is noisy.
  }

  return bestFit;
}

module.exports = {
  analyzeComplexity
};
