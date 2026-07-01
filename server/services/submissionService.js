const { Mistake, RevisionSchedule, RevisionSession } = require('../models');
const revisionService = require('./revisionService');

async function handleSubmissionResult(userId, questionId, isCorrect, quality) {
  const existingMistake = await Mistake.findOne({ 
    where: { user_id: userId, question_id: questionId, status: 'pending' } 
  });
  const existingRevision = await RevisionSchedule.findOne({ 
    where: { user_id: userId, question_id: questionId } 
  });

  const isFirstAttempt = !existingMistake && !existingRevision;

  let resultData = { hint_shown: false, solution_shown: false };

  if (!isCorrect || quality === 0) {
    if (isFirstAttempt) {
      // First time wrong -> create mistake entry, do NOT touch RevisionSchedule
      await Mistake.create({
        user_id: userId,
        question_id: questionId,
        status: 'pending',
        attempt_count: 1,
        first_failed_at: new Date(),
        last_attempted_at: new Date(),
        user_answer: '',
        correct_answer: '',
        category: ''
      });
    } else if (existingMistake) {
      // Retrying a mistake and still wrong -> increment attempt
      const newCount = existingMistake.attempt_count + 1;
      const hintShown = newCount >= 2;
      const solutionShown = newCount >= 3;
      
      await existingMistake.update({
        attempt_count: newCount,
        last_attempted_at: new Date(),
        hint_shown: hintShown,
        solution_shown: solutionShown
      });
      
      resultData.hint_shown = hintShown;
      resultData.solution_shown = solutionShown;
    } else if (existingRevision) {
      // "Again" during a revision session -> just reset SM-2, NOT a new mistake
      const { newInterval, newRepetitions, newEF } = revisionService.calculateSM2(0, existingRevision.repetitions, existingRevision.interval, existingRevision.easiness_factor);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newInterval);
      
      const interval_before = existingRevision.interval;
      const ef_before = existingRevision.easiness_factor;

      await existingRevision.update({
        interval: newInterval,
        repetitions: newRepetitions,
        easiness_factor: newEF,
        next_revision_date: nextDate,
        mastered: false
      });

      await RevisionSession.create({ 
        user_id: userId, 
        question_id: questionId, 
        quality: 0,
        interval_before,
        interval_after: newInterval,
        ef_before,
        ef_after: newEF
      });
      
      resultData.interval = newInterval;
      resultData.next_due_date = nextDate;
      resultData.mastered = false;
    }
  } else {
    // Correct solve
    if (existingMistake) {
      // Was a mistake, now improved -> mark improved
      await existingMistake.update({
        status: 'improved',
        solved_at: new Date()
      });
    }

    let interval_after, mastered_after, next_due_date, ef_after;

    if (!existingRevision) {
      // Seed RevisionSchedule for the first time
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1); // default interval 1
      
      await RevisionSchedule.create({
        user_id: userId,
        question_id: questionId,
        repetitions: 0,
        easiness_factor: 2.5,
        interval: 1,
        next_revision_date: nextDate,
        mastered: false,
        source: existingMistake ? 'improved' : 'first_solve'
      });
      
      interval_after = 1;
      mastered_after = false;
      next_due_date = nextDate;
      ef_after = 2.5;

      await RevisionSession.create({ 
        user_id: userId, 
        question_id: questionId, 
        quality: quality,
        interval_before: 0,
        interval_after: 1,
        ef_before: 2.5,
        ef_after: 2.5
      });
    } else {
      // Already in revision -> run SM-2 update
      const { newInterval, newRepetitions, newEF } = revisionService.calculateSM2(quality, existingRevision.repetitions, existingRevision.interval, existingRevision.easiness_factor);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newInterval);
      const isMastered = newInterval >= 21 && quality >= 4;

      const interval_before = existingRevision.interval;
      const ef_before = existingRevision.easiness_factor;

      await existingRevision.update({
        interval: newInterval,
        repetitions: newRepetitions,
        easiness_factor: newEF,
        next_revision_date: nextDate,
        mastered: isMastered
      });

      interval_after = newInterval;
      mastered_after = isMastered;
      next_due_date = nextDate;
      ef_after = newEF;

      await RevisionSession.create({ 
        user_id: userId, 
        question_id: questionId, 
        quality: quality,
        interval_before,
        interval_after: newInterval,
        ef_before,
        ef_after: newEF
      });
    }

    resultData.interval = interval_after;
    resultData.mastered = mastered_after;
    resultData.next_due_date = next_due_date;
  }

  return resultData;
}

module.exports = { handleSubmissionResult };
