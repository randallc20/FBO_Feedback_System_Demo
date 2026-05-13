import { useState } from 'react';
import { surveyQuestions } from '../../data/surveys';

const metricColors = {
  TURN_PERFORMANCE: 'bg-gold/10 text-gold',
  SERVICE_EXPERIENCE: 'bg-blue/10 text-blue',
  COMMUNICATION: 'bg-teal/10 text-teal',
  NPS: 'bg-purple-500/10 text-purple-400',
  GENERAL: 'bg-gray-500/10 text-gray-400',
};

const typeLabels = {
  STARS: 'Stars (1-5)',
  YES_NO: 'Yes / No',
  SINGLE_SELECT: 'Single Select',
  MULTI_SELECT: 'Multi Select',
  NPS_SCALE: 'NPS (0-10)',
  FREE_TEXT: 'Free Text',
  CONDITIONAL: 'Conditional',
};

const FlagIcon = ({ active, onClick, size = 'w-3.5 h-3.5' }) => (
  <button
    onClick={onClick}
    title={active ? 'Remove flag trigger' : 'Flag this answer'}
    className={`p-0.5 rounded transition ${active ? 'text-danger' : 'text-gray-400 hover:text-danger/60'}`}
  >
    <svg className={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  </button>
);

export default function SurveyBuilderTab({ dark }) {
  const [questions, setQuestions] = useState(surveyQuestions);
  const [isLive, setIsLive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState({ metric: 'GENERAL', questionType: 'STARS', questionText: '', isRequired: true, options: '', flaggedOptions: [] });

  // Mobile banner
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className={`rounded-xl p-6 text-center ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm max-w-sm`}>
          <svg className="w-12 h-12 text-gold mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className={`font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>Desktop Required</p>
          <p className="font-body text-sm text-text-secondary mt-2">The Survey Builder is best experienced on a tablet or desktop screen.</p>
        </div>
      </div>
    );
  }

  const moveQuestion = (index, dir) => {
    const arr = [...questions];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    setQuestions(arr);
  };

  const toggleFlagOption = (qIndex, option) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const key = q.questionType === 'NPS_SCALE' ? 'flaggedNPS' : q.questionType === 'STARS' ? 'flaggedStars' : 'flaggedOptions';
        const current = q[key] || [];
        const updated = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
        return { ...q, [key]: updated };
      })
    );
  };

  const hasFlaggedAnswers = (q) => {
    return (q.flaggedOptions?.length > 0) || (q.flaggedStars?.length > 0) || (q.flaggedNPS?.length > 0);
  };

  const addQuestion = () => {
    const parsedOptions = newQ.options ? newQ.options.split(',').map((s) => s.trim()) : undefined;
    const q = {
      id: `q-custom-${Date.now()}`,
      metric: newQ.metric,
      questionText: newQ.questionText,
      questionType: newQ.questionType,
      isRequired: newQ.isRequired,
      displayOrder: questions.length + 1,
      options: parsedOptions,
      flaggedOptions: newQ.flaggedOptions.length > 0 ? newQ.flaggedOptions : undefined,
    };
    setQuestions([...questions, q]);
    setShowAddForm(false);
    setNewQ({ metric: 'GENERAL', questionType: 'STARS', questionText: '', isRequired: true, options: '', flaggedOptions: [] });
  };

  const toggleNewQFlag = (option) => {
    setNewQ((prev) => ({
      ...prev,
      flaggedOptions: prev.flaggedOptions.includes(option) ? prev.flaggedOptions.filter((o) => o !== option) : [...prev.flaggedOptions, option],
    }));
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Active Survey Header */}
      <div className={`rounded-xl p-6 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className={`font-heading text-xl font-bold ${dark ? 'text-white' : 'text-navy'}`}>Standard Service Survey</h3>
            <p className="font-body text-sm text-text-secondary mt-1">{questions.length} questions &middot; 200 responses collected</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 bg-gold/10 text-gold font-heading font-semibold text-sm rounded-lg hover:bg-gold/20 transition">
              {showPreview ? 'Close Preview' : 'Preview'}
            </button>
            <div className="flex items-center gap-2">
              <span className={`font-heading text-sm ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>
                {isLive ? 'Live' : 'Draft'}
              </span>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isLive ? 'bg-success' : 'bg-gray-400'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isLive ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Question List */}
        <div className="flex-1 space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className={`rounded-xl p-4 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm border ${dark ? 'border-gray-700/50' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                {/* Order badge */}
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-sm font-bold text-gold">{i + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-semibold ${metricColors[q.metric]}`}>
                      {q.metric.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-semibold ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {typeLabels[q.questionType] || q.questionType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-semibold ${q.isRequired ? 'bg-danger/10 text-danger' : 'bg-gray-100 text-gray-400'}`}>
                      {q.isRequired ? 'Required' : 'Optional'}
                    </span>
                    {q.isConditional && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-semibold bg-purple-500/10 text-purple-400">
                        Conditional: Q{questions.findIndex((sq) => sq.id === q.conditionQuestionId) + 1} = {q.conditionAnswer}
                      </span>
                    )}
                    {hasFlaggedAnswers(q) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-semibold bg-danger/10 text-danger flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        Flag Triggers Active
                      </span>
                    )}
                  </div>

                  <p className={`font-body text-sm ${dark ? 'text-gray-200' : 'text-navy'}`}>{q.questionText}</p>

                  {/* Options with flag toggles — Single Select */}
                  {q.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((opt) => {
                        const isFlagged = q.flaggedOptions?.includes(opt);
                        return (
                          <span
                            key={opt}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body transition ${
                              isFlagged
                                ? 'bg-danger/10 text-danger border border-danger/30'
                                : dark ? 'bg-navy text-gray-400' : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {opt}
                            <FlagIcon active={isFlagged} onClick={() => toggleFlagOption(i, opt)} />
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Star rating flag toggles */}
                  {q.questionType === 'STARS' && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-[10px] font-heading mr-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Flag on:</span>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFlagged = q.flaggedStars?.includes(star);
                        return (
                          <button
                            key={star}
                            onClick={() => toggleFlagOption(i, star)}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-heading transition ${
                              isFlagged
                                ? 'bg-danger/10 text-danger border border-danger/30'
                                : dark ? 'bg-navy text-gray-500 hover:bg-danger/5' : 'bg-gray-50 text-gray-400 hover:bg-danger/5'
                            }`}
                          >
                            {star}★
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Yes/No flag toggles */}
                  {q.questionType === 'YES_NO' && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[10px] font-heading mr-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Flag on:</span>
                      {['Yes', 'No'].map((opt) => {
                        const isFlagged = q.flaggedOptions?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleFlagOption(i, opt)}
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-heading transition ${
                              isFlagged
                                ? 'bg-danger/10 text-danger border border-danger/30'
                                : dark ? 'bg-navy text-gray-500 hover:bg-danger/5' : 'bg-gray-50 text-gray-400 hover:bg-danger/5'
                            }`}
                          >
                            {opt}
                            <FlagIcon active={isFlagged} onClick={(e) => { e.stopPropagation(); toggleFlagOption(i, opt); }} size="w-3 h-3" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* NPS flag toggles */}
                  {q.questionType === 'NPS_SCALE' && (
                    <div className="flex items-center gap-0.5 mt-2 flex-wrap">
                      <span className={`text-[10px] font-heading mr-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Flag on:</span>
                      {Array.from({ length: 11 }, (_, n) => {
                        const isFlagged = q.flaggedNPS?.includes(n);
                        return (
                          <button
                            key={n}
                            onClick={() => toggleFlagOption(i, n)}
                            className={`w-6 h-5 rounded text-[10px] font-heading transition ${
                              isFlagged
                                ? 'bg-danger/10 text-danger border border-danger/30'
                                : dark ? 'bg-navy text-gray-500 hover:bg-danger/5' : 'bg-gray-50 text-gray-400 hover:bg-danger/5'
                            }`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} className={`w-7 h-7 flex items-center justify-center rounded transition ${i === 0 ? 'opacity-20' : 'hover:bg-gold/10 text-gold'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1} className={`w-7 h-7 flex items-center justify-center rounded transition ${i === questions.length - 1 ? 'opacity-20' : 'hover:bg-gold/10 text-gold'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-danger transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Question */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className={`w-full py-4 rounded-xl border-2 border-dashed font-heading font-semibold text-sm transition ${dark ? 'border-gray-600 text-gray-400 hover:border-gold hover:text-gold' : 'border-gray-300 text-gray-400 hover:border-gold hover:text-gold'}`}
            >
              + Add Question
            </button>
          ) : (
            <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm space-y-4`}>
              <h4 className={`font-heading text-sm font-semibold ${dark ? 'text-white' : 'text-navy'}`}>New Question</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Metric</label>
                  <select value={newQ.metric} onChange={(e) => setNewQ({ ...newQ, metric: e.target.value })} className={`w-full mt-1 px-3 py-2 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'}`}>
                    <option value="TURN_PERFORMANCE">Turn Performance</option>
                    <option value="SERVICE_EXPERIENCE">Service Experience</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="NPS">NPS</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Type</label>
                  <select value={newQ.questionType} onChange={(e) => setNewQ({ ...newQ, questionType: e.target.value, flaggedOptions: [] })} className={`w-full mt-1 px-3 py-2 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'}`}>
                    <option value="STARS">Stars (1-5)</option>
                    <option value="YES_NO">Yes / No</option>
                    <option value="SINGLE_SELECT">Single Select</option>
                    <option value="NPS_SCALE">NPS Scale (0-10)</option>
                    <option value="FREE_TEXT">Free Text</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Question Text</label>
                <input
                  value={newQ.questionText}
                  onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })}
                  placeholder="Enter your question..."
                  className={`w-full mt-1 px-3 py-2 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-navy placeholder-gray-400'} focus:outline-none focus:border-gold`}
                />
              </div>
              {(newQ.questionType === 'SINGLE_SELECT' || newQ.questionType === 'MULTI_SELECT') && (
                <div>
                  <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Options (comma-separated)</label>
                  <input
                    value={newQ.options}
                    onChange={(e) => setNewQ({ ...newQ, options: e.target.value, flaggedOptions: [] })}
                    placeholder="Option 1, Option 2, Option 3"
                    className={`w-full mt-1 px-3 py-2 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-navy placeholder-gray-400'} focus:outline-none focus:border-gold`}
                  />
                  {/* Flag toggles for new question options */}
                  {newQ.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] font-heading ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Flag triggers:</span>
                      {newQ.options.split(',').map((s) => s.trim()).filter(Boolean).map((opt) => {
                        const isFlagged = newQ.flaggedOptions.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleNewQFlag(opt)}
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-body transition ${
                              isFlagged
                                ? 'bg-danger/10 text-danger border border-danger/30'
                                : dark ? 'bg-navy text-gray-500 hover:bg-danger/5' : 'bg-gray-50 text-gray-400 hover:bg-danger/5'
                            }`}
                          >
                            {opt}
                            <FlagIcon active={isFlagged} onClick={(e) => { e.stopPropagation(); toggleNewQFlag(opt); }} size="w-3 h-3" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {newQ.questionType === 'YES_NO' && (
                <div>
                  <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Flag Triggers</label>
                  <div className="flex gap-1.5 mt-1">
                    {['Yes', 'No'].map((opt) => {
                      const isFlagged = newQ.flaggedOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleNewQFlag(opt)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-heading transition ${
                            isFlagged
                              ? 'bg-danger/10 text-danger border border-danger/30'
                              : dark ? 'bg-navy text-gray-500 hover:bg-danger/5 border border-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-danger/5 border border-gray-200'
                          }`}
                        >
                          {opt}
                          <FlagIcon active={isFlagged} onClick={(e) => { e.stopPropagation(); toggleNewQFlag(opt); }} size="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newQ.isRequired} onChange={(e) => setNewQ({ ...newQ, isRequired: e.target.checked })} className="accent-gold" />
                <span className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Required</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddForm(false)} className={`flex-1 py-2.5 rounded-lg font-heading font-semibold text-sm ${dark ? 'bg-navy text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                <button onClick={addQuestion} disabled={!newQ.questionText.trim()} className={`flex-1 py-2.5 rounded-lg font-heading font-semibold text-sm transition ${newQ.questionText.trim() ? 'bg-gold text-navy hover:bg-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Add Question</button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-[375px] flex-shrink-0">
            <div className="sticky top-36">
              <div className="bg-navy rounded-3xl overflow-hidden shadow-2xl" style={{ height: 700 }}>
                {/* Phone mockup header */}
                <div className="h-8 bg-navy flex items-center justify-center">
                  <div className="w-20 h-1 bg-gray-700 rounded-full" />
                </div>
                {/* Progress */}
                <div className="h-1 bg-gray-700 mx-4">
                  <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((previewStep + 1) / questions.length) * 100}%` }} />
                </div>
                {/* Question */}
                <div className="p-6 flex flex-col h-[calc(100%-40px)]">
                  {questions[previewStep] && (
                    <>
                      <div className="flex justify-center mb-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-heading font-semibold ${metricColors[questions[previewStep].metric]}`}>
                          {questions[previewStep].metric.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="font-heading text-xs text-gray-500 text-center mb-2">
                        Question {previewStep + 1} of {questions.length}
                      </p>
                      <h3 className="font-heading text-xl font-bold text-white text-center mb-8">
                        {questions[previewStep].questionText}
                      </h3>

                      <div className="flex-1 flex items-center justify-center">
                        {questions[previewStep].questionType === 'STARS' && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => {
                              const isFlagged = questions[previewStep].flaggedStars?.includes(s);
                              return (
                                <div key={s} className="relative">
                                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  {isFlagged && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full flex items-center justify-center">
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {questions[previewStep].questionType === 'YES_NO' && (
                          <div className="flex gap-3 w-full">
                            {['Yes', 'No'].map((opt) => {
                              const isFlagged = questions[previewStep].flaggedOptions?.includes(opt);
                              return (
                                <div key={opt} className={`flex-1 py-4 bg-dark-surface border rounded-xl text-center font-heading text-white relative ${isFlagged ? 'border-danger/50' : 'border-gray-600'}`}>
                                  {opt}
                                  {isFlagged && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {questions[previewStep].questionType === 'SINGLE_SELECT' && questions[previewStep].options && (
                          <div className="w-full space-y-2">
                            {questions[previewStep].options.map((opt) => {
                              const isFlagged = questions[previewStep].flaggedOptions?.includes(opt);
                              return (
                                <div key={opt} className={`w-full py-3 px-4 bg-dark-surface border rounded-xl font-heading text-sm text-gray-300 relative ${isFlagged ? 'border-danger/50' : 'border-gray-600'}`}>
                                  {opt}
                                  {isFlagged && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-danger rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {questions[previewStep].questionType === 'NPS_SCALE' && (
                          <div>
                            <div className="grid grid-cols-11 gap-1">
                              {Array.from({ length: 11 }, (_, i) => {
                                const isFlagged = questions[previewStep].flaggedNPS?.includes(i);
                                return (
                                  <div key={i} className={`w-7 h-10 rounded bg-dark-surface border flex items-center justify-center font-heading text-xs relative ${isFlagged ? 'border-danger/50 text-danger' : 'border-gray-600 text-gray-400'}`}>
                                    {i}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-gray-500 font-body">Never</span>
                              <span className="text-[10px] text-gray-500 font-body">Definitely</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="py-3 bg-gray-700 rounded-xl text-center font-heading font-bold text-gray-500 text-sm mt-4">
                        Next
                      </div>
                    </>
                  )}
                </div>
                {/* Nav dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {questions.map((_, i) => (
                    <button key={i} onClick={() => setPreviewStep(i)} className={`w-2 h-2 rounded-full transition ${i === previewStep ? 'bg-gold' : 'bg-gray-600'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Surveys */}
      <div className={`rounded-xl p-6 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
        <h3 className={`font-heading text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-navy'}`}>Saved Surveys</h3>
        <div className="space-y-3">
          {[
            { name: 'Standard Service Survey', questions: 12, responses: 200, date: 'Mar 15, 2026', status: 'Live' },
            { name: 'Quick Check-In', questions: 5, responses: 0, date: 'Apr 22, 2026', status: 'Draft' },
            { name: 'Seasonal Satisfaction Q1', questions: 8, responses: 47, date: 'Jan 10, 2026', status: 'Archived' },
          ].map((s) => (
            <div key={s.name} className={`flex items-center justify-between py-3 px-4 rounded-lg ${dark ? 'bg-navy' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-heading text-sm font-semibold ${dark ? 'text-gray-200' : 'text-navy'}`}>{s.name}</p>
                <p className="font-body text-xs text-text-secondary">{s.questions} questions &middot; {s.responses} responses &middot; {s.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-heading font-semibold ${
                  s.status === 'Live' ? 'bg-success/10 text-success' : s.status === 'Draft' ? 'bg-warning/10 text-warning' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>{s.status}</span>
                <button className="px-3 py-1.5 text-xs font-heading font-semibold bg-gold/10 text-gold rounded hover:bg-gold/20 transition">Duplicate</button>
                <button className="px-3 py-1.5 text-xs font-heading font-semibold bg-blue/10 text-blue rounded hover:bg-blue/20 transition">Restore</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
