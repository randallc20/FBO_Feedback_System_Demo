const metricColors = {
  TURN_PERFORMANCE: { label: 'Turn Performance', bg: 'bg-blue/20', text: 'text-blue' },
  SERVICE_EXPERIENCE: { label: 'Service Experience', bg: 'bg-gold/20', text: 'text-gold' },
  COMMUNICATION: { label: 'Communication', bg: 'bg-teal/20', text: 'text-teal' },
  NPS: { label: 'Net Promoter Score', bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

const starLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

function StarRating({ value, onChange }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform duration-150 active:scale-110"
          >
            <svg
              className={`w-12 h-12 ${star <= value ? 'text-gold' : 'text-gray-600'} transition-colors duration-200`}
              fill={star <= value ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
      </div>
      {value && (
        <p className="font-heading text-sm text-gold animate-fadeIn">{starLabels[value - 1]}</p>
      )}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-4 w-full max-w-sm mx-auto">
      {['Yes', 'No'].map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-5 rounded-2xl font-heading text-lg font-bold transition-all duration-200 ${
            value === opt
              ? 'bg-gold text-navy shadow-lg shadow-gold/20'
              : 'bg-dark-surface border border-gray-600 text-gray-300 hover:border-gray-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SingleSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full py-4 px-6 rounded-xl font-heading text-base font-semibold text-left transition-all duration-200 ${
            value === opt
              ? 'bg-gold text-navy shadow-lg shadow-gold/20'
              : 'bg-dark-surface border border-gray-600 text-gray-300 hover:border-gray-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function NPSScale({ value, onChange }) {
  return (
    <div>
      <div className="grid grid-cols-11 gap-1 mb-3">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`h-12 rounded-lg font-heading text-sm font-bold transition-all duration-200 ${
              value === i
                ? 'bg-gold text-navy shadow-lg scale-110'
                : i <= 6
                  ? 'bg-danger/20 text-danger hover:bg-danger/30'
                  : i <= 8
                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                    : 'bg-success/20 text-success hover:bg-success/30'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="font-body text-xs text-gray-500">Never</span>
        <span className="font-body text-xs text-gray-500">Definitely</span>
      </div>
    </div>
  );
}

export default function SurveyQuestion({ question, questionNumber, totalQuestions, value, onChange, onNext }) {
  const metric = metricColors[question.metric] || metricColors.NPS;
  const hasAnswer = value !== undefined && value !== null && value !== '';

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      {/* Metric label */}
      <div className="flex justify-center mb-4">
        <span className={`${metric.bg} ${metric.text} font-heading text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full`}>
          {metric.label}
        </span>
      </div>

      {/* Question number */}
      <p className="font-heading text-sm text-gray-500 text-center mb-3">
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Question text */}
      <h2 className="font-heading text-2xl font-bold text-white text-center mb-12 px-4 leading-tight">
        {question.questionText}
      </h2>

      {/* Input area — pushed to lower 2/3 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          {question.questionType === 'STARS' && <StarRating value={value} onChange={onChange} />}
          {question.questionType === 'YES_NO' && <YesNo value={value} onChange={onChange} />}
          {question.questionType === 'SINGLE_SELECT' && <SingleSelect options={question.options} value={value} onChange={onChange} />}
          {question.questionType === 'NPS_SCALE' && <NPSScale value={value} onChange={onChange} />}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!hasAnswer}
        className={`mt-6 w-full py-5 font-heading font-bold text-lg rounded-xl transition-all duration-200 ${
          hasAnswer
            ? 'bg-gold text-navy hover:bg-yellow-500 active:scale-[0.98] shadow-lg shadow-gold/20'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {questionNumber === totalQuestions ? 'Continue' : 'Next'}
      </button>
    </div>
  );
}
