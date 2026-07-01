import React from 'react';
import { Button } from './ui/button';

export function calculateSM2(quality, repetitions, interval, easinessFactor) {
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEF = easinessFactor;

  if (quality >= 3) {
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEF);
    }
    newRepetitions += 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEF = newEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  return { newInterval, newRepetitions, newEF };
}

export default function SM2RatingWidget({ onRate, repetitions = 0, interval = 0, easinessFactor = 2.5 }) {
  const getPreview = (quality) => {
    const { newInterval } = calculateSM2(quality, repetitions, interval, easinessFactor);
    if (newInterval === 1) return '1d';
    if (newInterval < 30) return newInterval + 'd';
    return (newInterval / 30).toFixed(1).replace('.0', '') + 'mo';
  };

  return (
    <div className=""flex flex-col items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800"">
      <h3 className=""text-slate-300 font-medium"">How difficult was this question?</h3>
      <div className=""flex flex-wrap items-center justify-center gap-3"">
        <Button variant=""danger"" className=""flex flex-col items-center py-2 px-4 h-auto"" onClick={() => onRate(0)}>
          <span className=""font-semibold"">Again</span>
          <span className=""text-xs opacity-80"">{getPreview(0)}</span>
        </Button>
        <Button variant=""warning"" className=""flex flex-col items-center py-2 px-4 h-auto bg-orange-600 hover:bg-orange-700"" onClick={() => onRate(2)}>
          <span className=""font-semibold"">Hard</span>
          <span className=""text-xs opacity-80"">{getPreview(2)}</span>
        </Button>
        <Button variant=""success"" className=""flex flex-col items-center py-2 px-4 h-auto"" onClick={() => onRate(4)}>
          <span className=""font-semibold"">Good</span>
          <span className=""text-xs opacity-80"">{getPreview(4)}</span>
        </Button>
        <Button variant=""primary"" className=""flex flex-col items-center py-2 px-4 h-auto bg-blue-600 hover:bg-blue-700"" onClick={() => onRate(5)}>
          <span className=""font-semibold"">Easy</span>
          <span className=""text-xs opacity-80"">{getPreview(5)}</span>
        </Button>
      </div>
    </div>
  );
}
