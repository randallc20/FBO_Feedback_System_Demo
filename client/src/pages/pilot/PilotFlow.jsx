import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aircraft } from '../../data/aircraft';
import { managementCompanies } from '../../data/companies';
import { fbos } from '../../data/fbos';
import { surveyQuestions } from '../../data/surveys';
import { generateMockData } from '../../data/generateResponses';
import { scanReceipt } from '../../api/receiptScanner';
import HomeScreen from './HomeScreen';
import ReceiptUpload from './ReceiptUpload';
import AIProcessing from './AIProcessing';
import ReceiptReview from './ReceiptReview';
import SurveyQuestion from './SurveyQuestion';
import CommentScreen from './CommentScreen';
import ConfirmationScreen from './ConfirmationScreen';

export default function PilotFlow() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [receiptData, setReceiptData] = useState(null);
  const [scanPromise, setScanPromise] = useState(null);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [comment, setComment] = useState('');

  const { fuelPurchases } = generateMockData();
  const pilotPurchases = fuelPurchases.filter((p) => p.pilotId === user.pilotId || p.pilotId === user.id);
  const lifetimeSavings = pilotPurchases.reduce((s, p) => s + p.savingsAmount, 0);
  const ac = aircraft.find((a) => a.id === user.defaultAircraftId);
  const company = managementCompanies.find((c) => c.id === user.companyId);

  const activeQuestions = surveyQuestions.filter((q) => {
    if (q.isConditional && q.conditionQuestionId === 'q-6') {
      return surveyAnswers['q-6'] === 'Yes';
    }
    return true;
  });

  const totalSteps = 4 + activeQuestions.length + 2;

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(0, s - 1)); };
  const restart = () => { setStep(0); setReceiptData(null); setScanPromise(null); setSurveyAnswers({}); setComment(''); };

  const handleAnswer = (questionId, answer) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const mockReceipt = {
    fbo_name: 'Jet Aviation',
    airport_name: 'Dallas Love Field',
    airport_icao: 'KDAL',
    date: new Date().toISOString().slice(0, 10),
    time: '14:35',
    tail_number: ac?.tailNumber || 'N401HA',
    fuel_type: 'Jet-A',
    gallons: 342.5,
    price_per_gallon: 6.75,
    total_amount: 2311.88,
    invoice_number: 'INV-KDAL-2026-0847',
  };

  // Use scanned data if available, otherwise mock
  const activeReceipt = receiptData || mockReceipt;

  const fbo = fbos.find((f) => f.icaoCode === activeReceipt.airport_icao)
    || fbos.find((f) => activeReceipt.fbo_name?.toLowerCase().includes(f.name.toLowerCase()));
  const flightsheetPrice = fbo ? +(fbo.currentRetailPPG - 0.50).toFixed(2) : activeReceipt.price_per_gallon || 6.25;
  const retailPrice = fbo?.currentRetailPPG || activeReceipt.price_per_gallon || 7.25;
  const totalAmount = activeReceipt.total_amount || +(activeReceipt.gallons * flightsheetPrice).toFixed(2);

  const progress = step / (totalSteps - 1);
  const questionIndex = step - 4;

  const handleUpload = (file) => {
    // Start the OCR scan and store the promise
    const promise = scanReceipt(file).then((data) => data.receipt);
    setScanPromise(promise);
    goNext();
  };

  const handleScanComplete = (scannedReceipt) => {
    if (scannedReceipt) {
      // Merge scanned data with defaults for any missing fields
      setReceiptData({
        ...mockReceipt,
        ...Object.fromEntries(Object.entries(scannedReceipt).filter(([, v]) => v !== '' && v !== 0 && v != null)),
      });
    }
    goNext();
  };

  return (
    <div className="bg-navy text-white overflow-hidden relative min-h-[calc(100vh-56px)]">
      {/* Progress bar — hidden on home */}
      {step > 0 && step < totalSteps - 1 && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gray-700">
            <div
              className="h-full bg-gold transition-all duration-350 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Back button — hidden on home and confirm */}
      {step > 0 && step < totalSteps - 1 && (
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Step content with slide animation */}
      <div
        key={step}
        className="animate-slideIn"
        style={{ '--slide-from': direction > 0 ? '60px' : '-60px' }}
      >
        {step === 0 && (
          <HomeScreen
            user={user}
            aircraft={ac}
            company={company}
            recentPurchases={pilotPurchases.slice(0, 5)}
            lifetimeSavings={lifetimeSavings}
            onStart={goNext}
          />
        )}
        {step === 1 && <ReceiptUpload onUpload={handleUpload} />}
        {step === 2 && <AIProcessing onComplete={handleScanComplete} scanPromise={scanPromise} />}
        {step === 3 && (
          <ReceiptReview
            data={activeReceipt}
            pilotName={`${user.firstName} ${user.lastName}`}
            aircraftInfo={ac ? `${ac.make} ${ac.model}` : ''}
            companyName={company?.name || ''}
            flightsheetPrice={flightsheetPrice}
            retailPrice={retailPrice}
            onConfirm={goNext}
          />
        )}
        {questionIndex >= 0 && questionIndex < activeQuestions.length && (
          <SurveyQuestion
            question={activeQuestions[questionIndex]}
            questionNumber={questionIndex + 1}
            totalQuestions={activeQuestions.length}
            value={surveyAnswers[activeQuestions[questionIndex].id]}
            onChange={(val) => handleAnswer(activeQuestions[questionIndex].id, val)}
            onNext={goNext}
          />
        )}
        {step === 4 + activeQuestions.length && (
          <CommentScreen
            comment={comment}
            setComment={setComment}
            onSubmit={goNext}
          />
        )}
        {step === 4 + activeQuestions.length + 1 && (
          <ConfirmationScreen
            pilotName={`${user.firstName} ${user.lastName}`}
            tailNumber={ac?.tailNumber || ''}
            fboName={activeReceipt.fbo_name}
            icaoCode={activeReceipt.airport_icao}
            turnScore={Number(surveyAnswers['q-1']) || 4}
            serviceScore={Number(surveyAnswers['q-4']) || 4}
            commScore={Number(surveyAnswers['q-9']) || 4}
            npsScore={Number(surveyAnswers['q-12']) || 8}
            gallons={activeReceipt.gallons}
            pricePerGallon={flightsheetPrice}
            totalAmount={totalAmount}
            savings={+((retailPrice - flightsheetPrice) * activeReceipt.gallons).toFixed(2)}
            lifetimeSavings={lifetimeSavings}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}
