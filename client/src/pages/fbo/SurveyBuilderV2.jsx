import { useState, useRef } from 'react';
import { surveyQuestions } from '../../data/surveys';
import {
  GripVertical, Lock, Unlock, Plus, Trash2, Edit3, Check, X,
  ChevronDown, ChevronUp, Star, MessageSquare, ToggleLeft, ToggleRight,
  AlertCircle, Eye,
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'STARS', label: 'Star Rating (1-5)' },
  { value: 'YES_NO', label: 'Yes / No' },
  { value: 'SINGLE_SELECT', label: 'Single Select' },
  { value: 'NPS_SCALE', label: 'NPS Scale (0-10)' },
  { value: 'LONG_TEXT', label: 'Long Text' },
];

const METRICS = [
  { value: 'TURN_PERFORMANCE', label: 'Turn Performance' },
  { value: 'SERVICE_EXPERIENCE', label: 'Service Experience' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'NPS', label: 'NPS' },
  { value: 'GENERAL', label: 'General' },
];

export default function SurveyBuilder() {
  const [questions, setQuestions] = useState(() => surveyQuestions.map((q) => ({ ...q })));
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [previewAnswers, setPreviewAnswers] = useState({});

  // Drag & drop handlers
  const handleDragStart = (idx) => {
    if (questions[idx].isLocked) return;
    setDragIdx(idx);
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const updated = [...questions];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    updated.forEach((q, i) => (q.displayOrder = i + 1));
    setQuestions(updated);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const updateQuestion = (id, changes) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)));
  };

  const deleteQuestion = (id) => {
    const q = questions.find((q) => q.id === id);
    if (q?.isLocked) return;
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== id);
      filtered.forEach((q, i) => (q.displayOrder = i + 1));
      return filtered;
    });
  };

  const addQuestion = (newQ) => {
    setQuestions((prev) => [...prev, { ...newQ, id: `q-${Date.now()}`, displayOrder: prev.length + 1 }]);
    setShowAddForm(false);
  };

  // Active questions considering conditionals
  const activePreviewQuestions = questions.filter((q) => {
    if (q.isConditional && q.conditionQuestionId) {
      return previewAnswers[q.conditionQuestionId] === (q.conditionAnswer || 'Yes');
    }
    return true;
  });

  return (
    <div className="flex gap-8">
      {/* Left: Question List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
              Survey Questions
            </h3>
            <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {questions.length} questions &middot; {questions.filter((q) => q.isLocked).length} locked
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-heading font-bold text-sm rounded-lg hover:bg-yellow-500 transition"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Question cards */}
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              isEditing={editingId === q.id}
              onEdit={() => setEditingId(editingId === q.id ? null : q.id)}
              onUpdate={(changes) => updateQuestion(q.id, changes)}
              onDelete={() => deleteQuestion(q.id)}
              isDragOver={dragOverIdx === idx}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              allQuestions={questions}
            />
          ))}
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <AddQuestionForm
            onAdd={addQuestion}
            onCancel={() => setShowAddForm(false)}
            existingQuestions={questions}
          />
        )}
      </div>

      {/* Right: Live Phone Preview */}
      <div className="w-80 shrink-0 sticky top-4 self-start">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <h4 className="font-heading text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Live Preview
          </h4>
        </div>
        <PhonePreview
          questions={activePreviewQuestions}
          answers={previewAnswers}
          onAnswer={(id, val) => setPreviewAnswers((p) => ({ ...p, [id]: val }))}
        />
      </div>
    </div>
  );
}

/* ─── Question Card ─── */
function QuestionCard({ question: q, index, isEditing, onEdit, onUpdate, onDelete, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, allQuestions }) {
  const [editText, setEditText] = useState(q.questionText);
  const [editType, setEditType] = useState(q.questionType);
  const [editMetric, setEditMetric] = useState(q.metric);
  const [editOptions, setEditOptions] = useState(q.options?.join(', ') || '');
  const [editRequired, setEditRequired] = useState(q.isRequired);
  const [editComment, setEditComment] = useState(q.allowComment);
  const [editConditional, setEditConditional] = useState(q.isConditional || false);
  const [editConditionQ, setEditConditionQ] = useState(q.conditionQuestionId || '');
  const [editConditionA, setEditConditionA] = useState(q.conditionAnswer || 'Yes');

  const saveEdit = () => {
    const changes = {
      questionText: editText,
      questionType: editType,
      metric: editMetric,
      isRequired: editRequired,
      allowComment: editComment,
      isConditional: editConditional,
      conditionQuestionId: editConditional ? editConditionQ : undefined,
      conditionAnswer: editConditional ? editConditionA : undefined,
    };
    if (editType === 'SINGLE_SELECT') {
      changes.options = editOptions.split(',').map((o) => o.trim()).filter(Boolean);
    } else {
      changes.options = undefined;
    }
    onUpdate(changes);
    onEdit(); // close
  };

  return (
    <div
      draggable={!q.isLocked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-xl border transition ${isDragOver ? 'border-gold border-2' : ''} ${q.isLocked ? 'opacity-90' : 'cursor-grab'}`}
      style={{ background: 'var(--surface)', borderColor: isDragOver ? undefined : 'var(--border)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <div className={`shrink-0 ${q.isLocked ? 'opacity-30' : 'opacity-60 hover:opacity-100'}`}>
          <GripVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Order number */}
        <span className="font-heading text-xs font-bold w-6 text-center" style={{ color: 'var(--text-muted)' }}>
          {index + 1}
        </span>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm truncate" style={{ color: 'var(--text)' }}>{q.questionText}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-heading text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
              {q.questionType.replace('_', ' ')}
            </span>
            <span className="font-heading text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {q.metric.replace('_', ' ')}
            </span>
            {q.isConditional && (
              <span className="font-heading text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--score-amber-bg)', color: 'var(--score-amber)' }}>
                Conditional
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {q.allowComment && <MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
          {q.isRequired && (
            <span className="font-heading text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--score-red-bg)', color: 'var(--score-red)' }}>
              REQ
            </span>
          )}
          {q.isLocked ? (
            <Lock className="w-3.5 h-3.5" style={{ color: 'var(--score-amber)' }} />
          ) : (
            <>
              <button onClick={onEdit} className="p-1 rounded hover:bg-[var(--surface2)] transition" style={{ color: 'var(--text-muted)' }}>
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onDelete} className="p-1 rounded hover:bg-[var(--score-red-bg)] transition" style={{ color: 'var(--text-muted)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded edit form */}
      {isEditing && !q.isLocked && (
        <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div>
            <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Question Text</label>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Metric</label>
              <select
                value={editMetric}
                onChange={(e) => setEditMetric(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          {editType === 'SINGLE_SELECT' && (
            <div>
              <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Options (comma separated)</label>
              <input
                value={editOptions}
                onChange={(e) => setEditOptions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editRequired} onChange={(e) => setEditRequired(e.target.checked)} className="accent-gold" />
              <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editComment} onChange={(e) => setEditComment(e.target.checked)} className="accent-gold" />
              <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>Allow Comment</span>
            </label>
          </div>
          {/* Conditional logic */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={editConditional} onChange={(e) => setEditConditional(e.target.checked)} className="accent-gold" />
              <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>Conditional (show based on another answer)</span>
            </label>
            {editConditional && (
              <div className="grid grid-cols-2 gap-3 ml-5">
                <select
                  value={editConditionQ}
                  onChange={(e) => setEditConditionQ(e.target.value)}
                  className="px-3 py-2 rounded-lg font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="">Select question...</option>
                  {allQuestions.filter((oq) => oq.id !== q.id && oq.questionType === 'YES_NO').map((oq) => (
                    <option key={oq.id} value={oq.id}>{oq.questionText}</option>
                  ))}
                </select>
                <select
                  value={editConditionA}
                  onChange={(e) => setEditConditionA(e.target.value)}
                  className="px-3 py-2 rounded-lg font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg font-heading text-xs font-semibold hover:bg-[var(--surface2)] transition" style={{ color: 'var(--text-sub)' }}>
              Cancel
            </button>
            <button onClick={saveEdit} className="px-4 py-1.5 rounded-lg font-heading text-xs font-bold bg-gold text-navy hover:bg-yellow-500 transition">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Add Question Form ─── */
function AddQuestionForm({ onAdd, onCancel, existingQuestions }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('STARS');
  const [metric, setMetric] = useState('GENERAL');
  const [options, setOptions] = useState('');
  const [required, setRequired] = useState(true);
  const [allowComment, setAllowComment] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) return;
    const q = {
      questionText: text.trim(),
      questionType: type,
      metric,
      isRequired: required,
      isLocked: false,
      allowComment,
    };
    if (type === 'SINGLE_SELECT') {
      q.options = options.split(',').map((o) => o.trim()).filter(Boolean);
    }
    onAdd(q);
  };

  return (
    <div className="mt-4 rounded-xl border p-5 space-y-4 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h4 className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>New Question</h4>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
        style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        placeholder="Enter question text..."
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
            style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-heading text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Metric</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
            style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>
      {type === 'SINGLE_SELECT' && (
        <input
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          className="w-full px-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          placeholder="Options (comma separated)"
        />
      )}
      <div className="flex items-center gap-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="accent-gold" />
          <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>Required</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} className="accent-gold" />
          <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>Allow Comment</span>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg font-heading text-sm font-semibold hover:bg-[var(--surface2)] transition" style={{ color: 'var(--text-sub)' }}>
          Cancel
        </button>
        <button onClick={handleAdd} disabled={!text.trim()} className="px-5 py-2 rounded-lg font-heading text-sm font-bold bg-gold text-navy hover:bg-yellow-500 transition disabled:opacity-40">
          Add Question
        </button>
      </div>
    </div>
  );
}

/* ─── Phone Preview ─── */
function PhonePreview({ questions, answers, onAnswer }) {
  const [previewStep, setPreviewStep] = useState(0);
  const q = questions[previewStep];

  return (
    <div className="rounded-[2rem] border-4 border-gray-700 overflow-hidden shadow-2xl" style={{ background: '#0A1628' }}>
      {/* Phone notch */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-20 h-1 rounded-full bg-gray-700" />
      </div>

      {/* Screen */}
      <div className="px-5 py-4 min-h-[480px] flex flex-col">
        {/* Progress */}
        <div className="h-1 bg-gray-700 rounded-full mb-6">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${((previewStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {q ? (
          <>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Question {previewStep + 1} of {questions.length}
            </p>
            <p className="font-body text-sm text-white mb-6 leading-relaxed">
              {q.questionText}
              {q.isRequired && <span className="text-red-400 ml-1">*</span>}
            </p>

            {/* Input preview */}
            <div className="flex-1">
              <PreviewInput
                question={q}
                value={answers[q.id]}
                onChange={(val) => onAnswer(q.id, val)}
              />
            </div>

            {/* Nav */}
            <div className="flex gap-2 mt-4">
              {previewStep > 0 && (
                <button
                  onClick={() => setPreviewStep((s) => s - 1)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-400 font-heading text-xs font-semibold"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setPreviewStep((s) => Math.min(questions.length - 1, s + 1))}
                className="flex-1 py-2.5 rounded-lg bg-gold text-navy font-heading text-xs font-bold"
              >
                {previewStep === questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-body text-sm text-gray-500">No questions to preview</p>
          </div>
        )}
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-28 h-1 rounded-full bg-gray-600" />
      </div>
    </div>
  );
}

function PreviewInput({ question, value, onChange }) {
  const { questionType, options } = question;

  if (questionType === 'STARS') {
    const stars = value || 0;
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => onChange(s)} className="transition hover:scale-110">
            <Star className={`w-8 h-8 ${s <= stars ? 'fill-gold text-gold' : 'text-gray-600'}`} />
          </button>
        ))}
      </div>
    );
  }

  if (questionType === 'YES_NO') {
    return (
      <div className="flex gap-3 justify-center">
        {['Yes', 'No'].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-8 py-3 rounded-xl font-heading text-sm font-bold transition ${
              value === opt ? 'bg-gold text-navy' : 'border border-gray-600 text-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (questionType === 'SINGLE_SELECT' && options) {
    return (
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full px-4 py-3 rounded-xl text-left font-body text-sm transition ${
              value === opt ? 'bg-gold text-navy font-semibold' : 'border border-gray-600 text-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (questionType === 'NPS_SCALE') {
    return (
      <div>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`py-2 rounded font-heading text-xs font-bold transition ${
                value === i
                  ? i >= 9 ? 'bg-green-500 text-white' : i >= 7 ? 'bg-yellow-500 text-navy' : 'bg-red-500 text-white'
                  : 'border border-gray-600 text-gray-400'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-body text-[9px] text-gray-500">Not likely</span>
          <span className="font-body text-[9px] text-gray-500">Very likely</span>
        </div>
      </div>
    );
  }

  if (questionType === 'LONG_TEXT') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-4 py-3 rounded-xl bg-transparent border border-gray-600 text-white font-body text-sm resize-none focus:outline-none focus:border-gold"
        placeholder="Type your response..."
      />
    );
  }

  return null;
}
