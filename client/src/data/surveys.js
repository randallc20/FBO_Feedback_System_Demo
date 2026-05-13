export const surveyQuestions = [
  { id: 'q-1', metric: 'TURN_PERFORMANCE', questionText: 'Overall speed of fuel service', questionType: 'STARS', isRequired: true, displayOrder: 1, flaggedStars: [1, 2] },
  { id: 'q-2', metric: 'TURN_PERFORMANCE', questionText: 'Was your aircraft fueled within the expected timeframe?', questionType: 'YES_NO', isRequired: true, displayOrder: 2, flaggedOptions: ['No'] },
  { id: 'q-3', metric: 'TURN_PERFORMANCE', questionText: 'Departure status', questionType: 'SINGLE_SELECT', options: ['On time', 'Minor delay', 'Significant delay'], isRequired: true, displayOrder: 3, flaggedOptions: ['Significant delay'] },
  { id: 'q-4', metric: 'SERVICE_EXPERIENCE', questionText: 'Overall service experience', questionType: 'STARS', isRequired: true, displayOrder: 4, flaggedStars: [1, 2] },
  { id: 'q-5', metric: 'SERVICE_EXPERIENCE', questionText: 'How were you greeted on arrival?', questionType: 'SINGLE_SELECT', options: ['Red carpet service', 'Standard welcome', 'Minimal interaction', 'No greeting'], isRequired: true, displayOrder: 5, flaggedOptions: ['No greeting'] },
  { id: 'q-6', metric: 'SERVICE_EXPERIENCE', questionText: 'Did any issues arise during your visit?', questionType: 'YES_NO', isRequired: true, displayOrder: 6, flaggedOptions: ['Yes'] },
  { id: 'q-7', metric: 'SERVICE_EXPERIENCE', questionText: 'How well was the issue resolved?', questionType: 'STARS', isRequired: true, isConditional: true, conditionQuestionId: 'q-6', conditionAnswer: 'Yes', displayOrder: 7, flaggedStars: [1] },
  { id: 'q-8', metric: 'SERVICE_EXPERIENCE', questionText: 'Would you return to this FBO?', questionType: 'SINGLE_SELECT', options: ['Definitely', 'Probably', 'Unlikely'], isRequired: true, displayOrder: 8, flaggedOptions: ['Unlikely'] },
  { id: 'q-9', metric: 'COMMUNICATION', questionText: 'Pre-arrival communication quality', questionType: 'STARS', isRequired: true, displayOrder: 9, flaggedStars: [1, 2] },
  { id: 'q-10', metric: 'COMMUNICATION', questionText: 'Did the FBO contact you before arrival?', questionType: 'YES_NO', isRequired: true, displayOrder: 10, flaggedOptions: ['No'] },
  { id: 'q-11', metric: 'COMMUNICATION', questionText: 'Were you kept informed while on the ground?', questionType: 'YES_NO', isRequired: true, displayOrder: 11, flaggedOptions: ['No'] },
  { id: 'q-12', metric: 'NPS', questionText: 'How likely are you to return to this FBO?', questionType: 'NPS_SCALE', isRequired: true, displayOrder: 12, flaggedNPS: [0, 1, 2, 3] },
];
