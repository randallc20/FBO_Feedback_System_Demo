import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aircraft } from '../../data/aircraft';
import { managementCompanies } from '../../data/companies';
import { fbos } from '../../data/fbos';
import { ticketQuestions } from '../../data/surveys';
import { generateMockData } from '../../data/generateResponses';
import { scanReceipt } from '../../api/receiptScanner';
import HomeScreen from './HomeScreen';
import ReceiptUpload from './ReceiptUpload';
import AIProcessing from './AIProcessing';
import ReceiptReview from './ReceiptReview';
import ConfirmationScreen from './ConfirmationScreen';

const starLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
const metricColors = {
  TURN_PERFORMANCE: { label: 'Turn Performance', text: 'text-blue' },
  SERVICE_EXPERIENCE: { label: 'Service Experience', text: 'text-gold' },
  COMMUNICATION: { label: 'Communication', text: 'text-teal' },
};

function TicketScreen({ scores, onScoreChange, wantsCallback, onCallbackChange, onSubmit }) {
  const allRated = ticketQuestions.every((q) => scores[q.id]);

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-8">
      <h2 className="font-heading text-2xl font-bold text-white text-center mb-2">Rate Your Experience</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-8">Tap stars to rate each area</p>

      <div className="flex-1 flex flex-col gap-6">
        {ticketQuestions.map((q) => {
          const mc = metricColors[q.metric];
          const value = scores[q.id] || 0;
          return (
            <div key={q.id} className="bg-dark-surface rounded-2xl border border-gray-700/50 p-5">
              <p className={`font-heading text-xs font-semibold uppercase tracking-wider mb-1 ${mc.text}`}>{mc.label}</p>
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

        {/* Callback toggle */}
        <button
          onClick={() => onCallbackChange(!wantsCallback)}
          className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
            wantsCallback ? 'bg-gold/10 border-gold/40' : 'bg-dark-surface border-gray-700/50'
          }`}
        >
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${wantsCallback ? 'bg-gold justify-end' : 'bg-gray-600 justify-start'}`}>
            <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm font-semibold text-white">Request a callback</p>
            <p className="font-body text-xs text-gray-400">We'll reach out to discuss your experience</p>
          </div>
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={!allRated}
        className={`mt-6 w-full py-5 font-heading font-bold text-lg rounded-xl transition-all ${
          allRated
            ? 'bg-gold text-navy hover:bg-yellow-500 active:scale-[0.98] shadow-lg shadow-gold/20'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit Ticket
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

  // Steps: 0=Home, 1=Upload, 2=AI, 3=Review, 4=Ticket, 5=Confirmation
  const totalSteps = 6;

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

  const handleUpload = (file) => {
    const promise = scanReceipt(file).then((data) => data.receipt);
    setScanPromise(promise);
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
        {step === 0 && (
          <HomeScreen user={user} aircraft={ac} company={company} recentPurchases={pilotPurchases.slice(0, 5)} lifetimeSavings={lifetimeSavings} onStart={goNext} />
        )}
        {step === 1 && <ReceiptUpload onUpload={handleUpload} />}
        {step === 2 && <AIProcessing onComplete={handleScanComplete} scanPromise={scanPromise} />}
        {step === 3 && (
          <ReceiptReview data={activeReceipt} pilotName={`${user.firstName} ${user.lastName}`} aircraftInfo={ac ? `${ac.make} ${ac.model}` : ''} companyName={company?.name || ''} flightsheetPrice={flightsheetPrice} retailPrice={retailPrice} onConfirm={goNext} />
        )}
        {step === 4 && (
          <TicketScreen
            scores={ticketScores}
            onScoreChange={(id, val) => setTicketScores((prev) => ({ ...prev, [id]: val }))}
            wantsCallback={wantsCallback}
            onCallbackChange={setWantsCallback}
            onSubmit={goNext}
          />
        )}
        {step === 5 && (
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
