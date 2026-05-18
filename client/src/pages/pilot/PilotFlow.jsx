import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aircraft } from '../../data/aircraft';
import { managementCompanies } from '../../data/companies';
import { fbos } from '../../data/fbos';
import { ticketQuestions } from '../../data/surveys';
import { generateMockData } from '../../data/generateResponses';
import { scanReceipt } from '../../api/receiptScanner';
import ReceiptUpload from './ReceiptUpload';
import AIProcessing from './AIProcessing';
import ReceiptReview from './ReceiptReview';
import ConfirmationScreen from './ConfirmationScreen';

const starLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
const metricLabels = {
  TURN_PERFORMANCE: 'Turn Performance',
  SERVICE_EXPERIENCE: 'Service Experience',
  COMMUNICATION: 'Communication',
};

function RateScreen({ scores, onScoreChange, wantsCallback, onCallbackChange, onSubmit, fboName }) {
  const allRated = ticketQuestions.every((q) => scores[q.id]);

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-8">
      <h2 className="font-heading text-2xl font-bold text-white text-center mb-1">Rate Your Visit</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-8">
        How was your experience at {fboName || 'this FBO'}?
      </p>

      <div className="flex-1 flex flex-col gap-5">
        {ticketQuestions.map((q) => {
          const value = scores[q.id] || 0;
          return (
            <div key={q.id} className="bg-dark-surface rounded-2xl border border-gray-700/50 p-5">
              <p className="font-heading text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                {metricLabels[q.metric]}
              </p>
              <p className="font-body text-sm text-gray-300 mb-4">{q.questionText}</p>
              <div className="flex items-center gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => onScoreChange(q.id, star)} className="transition-transform active:scale-110">
                    <svg
                      className={`w-10 h-10 ${star <= value ? 'text-gold' : 'text-gray-600'} transition-colors`}
                      fill={star <= value ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
                {value > 0 && (
                  <span className="font-heading text-xs text-gold ml-1">{starLabels[value - 1]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Follow-up — distinct from submit */}
      <div className="mt-6 mb-4">
        <button
          onClick={() => onCallbackChange(!wantsCallback)}
          className={`w-full flex items-center justify-center gap-3 rounded-xl border-2 py-4 transition-all ${
            wantsCallback
              ? 'border-gold bg-gold/10'
              : 'border-gray-600 bg-dark-surface hover:border-gray-400'
          }`}
        >
          <svg className={`w-5 h-5 ${wantsCallback ? 'text-gold' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className={`font-heading text-sm font-semibold ${wantsCallback ? 'text-gold' : 'text-white'}`}>
            {wantsCallback ? 'Follow-up Requested' : 'Request a Follow-up'}
          </span>
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!allRated}
        className={`w-full py-5 font-heading font-bold text-lg rounded-xl transition-all ${
          allRated
            ? 'bg-gold text-navy hover:bg-yellow-500 active:scale-[0.98] shadow-lg shadow-gold/20'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit
      </button>
    </div>
  );
}

export default function PilotFlow() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [receiptData, setReceiptData] = useState(null);
  const [scanPromise, setScanPromise] = useState(null);
  const [ticketScores, setTicketScores] = useState({});
  const [wantsCallback, setWantsCallback] = useState(false);

  const { fuelPurchases } = generateMockData();
  const pilotPurchases = fuelPurchases.filter((p) => p.pilotId === user.pilotId || p.pilotId === user.id);
  const lifetimeSavings = pilotPurchases.reduce((s, p) => s + p.savingsAmount, 0);
  const ac = aircraft.find((a) => a.id === user.defaultAircraftId);
  const company = managementCompanies.find((c) => c.id === user.companyId);

  // Steps: 0=Upload, 1=AI, 2=Review, 3=Rate, 4=Confirmation
  const totalSteps = 5;

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(0, s - 1)); };
  const restart = () => { setStep(0); setReceiptData(null); setScanPromise(null); setTicketScores({}); setWantsCallback(false); };

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

  const activeReceipt = receiptData || mockReceipt;

  const fbo = fbos.find((f) => f.icaoCode === activeReceipt.airport_icao)
    || fbos.find((f) => activeReceipt.fbo_name?.toLowerCase().includes(f.name.toLowerCase()));
  const flightsheetPrice = fbo ? +(fbo.currentRetailPPG - 0.50).toFixed(2) : activeReceipt.price_per_gallon || 6.25;
  const retailPrice = fbo?.currentRetailPPG || activeReceipt.price_per_gallon || 7.25;
  const totalAmount = activeReceipt.total_amount || +(activeReceipt.gallons * flightsheetPrice).toFixed(2);

  const progress = step / (totalSteps - 1);

  const handleUpload = () => {
    // Skip real API call for demo — go straight to fake progress
    setScanPromise(null);
    goNext();
  };

  const handleScanComplete = (scannedReceipt) => {
    if (scannedReceipt) {
      setReceiptData({
        ...mockReceipt,
        ...Object.fromEntries(Object.entries(scannedReceipt).filter(([, v]) => v !== '' && v !== 0 && v != null)),
      });
    }
    goNext();
  };

  return (
    <div className="bg-navy text-white overflow-hidden relative min-h-[calc(100vh-56px)]">
      {/* Progress bar */}
      {step > 0 && step < totalSteps - 1 && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gray-700">
            <div className="h-full bg-gold transition-all duration-350 ease-out" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < totalSteps - 1 && (
        <button onClick={goBack} className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div key={step} className="animate-slideIn" style={{ '--slide-from': direction > 0 ? '60px' : '-60px' }}>
        {step === 0 && <ReceiptUpload onUpload={handleUpload} />}
        {step === 1 && <AIProcessing onComplete={handleScanComplete} scanPromise={scanPromise} />}
        {step === 2 && (
          <ReceiptReview data={activeReceipt} pilotName={`${user.firstName} ${user.lastName}`} aircraftInfo={ac ? `${ac.make} ${ac.model}` : ''} companyName={company?.name || ''} flightsheetPrice={flightsheetPrice} retailPrice={retailPrice} onConfirm={goNext} />
        )}
        {step === 3 && (
          <RateScreen
            scores={ticketScores}
            onScoreChange={(id, val) => setTicketScores((prev) => ({ ...prev, [id]: val }))}
            wantsCallback={wantsCallback}
            onCallbackChange={setWantsCallback}
            onSubmit={goNext}
            fboName={activeReceipt.fbo_name}
          />
        )}
        {step === 4 && (
          <ConfirmationScreen
            pilotName={`${user.firstName} ${user.lastName}`}
            tailNumber={ac?.tailNumber || ''}
            fboName={activeReceipt.fbo_name}
            icaoCode={activeReceipt.airport_icao}
            turnScore={Number(ticketScores['q-1']) || 4}
            serviceScore={Number(ticketScores['q-2']) || 4}
            commScore={Number(ticketScores['q-3']) || 4}
            wantsCallback={wantsCallback}
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
