export const ticketQuestions = [
  { id: 'q-1', metric: 'TURN_PERFORMANCE',  questionText: 'How would you rate the speed and efficiency of your fuel service today?',              questionType: 'STARS', isRequired: true, isLocked: true, allowComment: false, displayOrder: 1, flaggedStars: [1, 2] },
  { id: 'q-2', metric: 'SERVICE_EXPERIENCE', questionText: 'How would you rate the professionalism and attentiveness of the ground crew?',         questionType: 'STARS', isRequired: true, isLocked: true, allowComment: false, displayOrder: 2, flaggedStars: [1, 2] },
  { id: 'q-3', metric: 'COMMUNICATION',      questionText: 'How would you rate the communication before and during your visit?',                   questionType: 'STARS', isRequired: true, isLocked: true, allowComment: false, displayOrder: 3, flaggedStars: [1, 2] },
];

// Backward compat alias
export const surveyQuestions = ticketQuestions;
