import { pilots } from './pilots';
import { aircraft } from './aircraft';
import { fbos } from './fbos';
import { managementCompanies } from './companies';

// Seeded random for consistent data across reloads
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
const rand = (min, max) => seededRandom() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(seededRandom() * arr.length)];

const positiveComments = [
  'Outstanding service. The crew had us fueled and ready in record time.',
  'Best FBO experience in Texas. Will definitely be back.',
  'Crew was professional and efficient. Red carpet treatment from start to finish.',
  'Excellent communication before and during our visit. Top notch.',
  'Fast turnaround, great coffee, and the crew even washed our windshield.',
  'Seamless experience. This is what premium service looks like.',
  'The line team was waiting for us on arrival. Impressive.',
  'Consistently the best FBO in the region. Never disappoints.',
  'Facilities are spotless and the staff genuinely cares.',
  'Quick fuel, warm welcome, and they had our catering ready. Perfect.',
];

const negativeComments = [
  'Waited 45 minutes for fuel with no communication. Unacceptable for a scheduled stop.',
  'No one greeted us on arrival. Had to walk to the desk to find someone.',
  'Fuel truck took over an hour. We missed our departure slot.',
  'The ramp was disorganized. Our aircraft was blocked by a tug for 20 minutes.',
  'Staff seemed disinterested. No proactive communication at all.',
  'Requested GPU on arrival notice but it was never set up.',
  'Significant delay getting our fuel receipt. Simple task took too long.',
  'Below average experience. Expected better from this location.',
];

const resolutionNotes = [
  'Spoke with pilot directly. Apologized for the delay and offered complimentary hangar on next visit.',
  'Identified staffing gap during that shift. Added an additional line tech for afternoon coverage.',
  'Reviewed with the team. The delay was caused by a fuel truck maintenance issue that has been resolved.',
  'Called the management company to discuss. They appreciated the follow-up.',
  'Pilot confirmed the issue was a one-time occurrence. No further action needed.',
  'Implemented a new arrival checklist to prevent this from happening again.',
];

const greetingOptions = ['Red carpet service', 'Standard welcome', 'Minimal interaction', 'No greeting'];
const departureOptions = ['On time', 'Minor delay', 'Significant delay'];
const returnOptions = ['Definitely', 'Probably', 'Unlikely'];

const now = new Date();
const dayMs = 86400000;

export function generateMockData() {
  const fuelPurchases = [];
  const feedbackResponses = [];

  for (let i = 0; i < 200; i++) {
    const pilot = pick(pilots);
    const fbo = pick(fbos);
    const ac = aircraft.find((a) => a.id === pilot.defaultAircraftId);
    const company = managementCompanies.find((c) => c.id === pilot.companyId);

    const daysAgo = randInt(0, 60);
    const hour = randInt(6, 20);
    const purchaseDate = new Date(now.getTime() - daysAgo * dayMs);
    purchaseDate.setHours(hour, randInt(0, 59), 0, 0);

    const retailPrice = fbo.currentRetailPPG;
    const flightsheetPrice = +(retailPrice - rand(0.40, 0.60)).toFixed(2);
    const gallons = +rand(80, 800).toFixed(1);
    const totalAmount = +(gallons * flightsheetPrice).toFixed(2);
    const savingsAmount = +((retailPrice - flightsheetPrice) * gallons).toFixed(2);

    const purchaseId = `fp-${i + 1}`;

    fuelPurchases.push({
      id: purchaseId,
      pilotId: pilot.id,
      pilotName: `${pilot.firstName} ${pilot.lastName}`,
      pilotInitials: pilot.initials,
      aircraftId: ac.id,
      tailNumber: ac.tailNumber,
      aircraftType: `${ac.make} ${ac.model}`,
      aircraftCategory: ac.category,
      companyId: company.id,
      companyName: company.name,
      fboId: fbo.id,
      fboName: fbo.name,
      icaoCode: fbo.icaoCode,
      date: purchaseDate.toISOString(),
      hour,
      dayOfWeek: purchaseDate.getDay(),
      gallons,
      pricePerGallon: flightsheetPrice,
      retailPriceAtTime: retailPrice,
      totalAmount,
      savingsAmount,
      fuelType: 'Jet-A',
      invoiceNumber: `INV-${fbo.icaoCode}-${String(i + 1).padStart(4, '0')}`,
    });

    // Score distribution: 70% high, 20% mid, 10% low
    const roll = seededRandom();
    let turnScore, serviceScore, commScore, npsScore;

    if (roll < 0.10) {
      turnScore = randInt(1, 2);
      serviceScore = randInt(1, 2);
      commScore = randInt(1, 2);
      npsScore = randInt(0, 4);
    } else if (roll < 0.30) {
      turnScore = randInt(3, 3);
      serviceScore = randInt(3, 4);
      commScore = randInt(3, 3);
      npsScore = randInt(5, 7);
    } else {
      turnScore = randInt(4, 5);
      serviceScore = randInt(4, 5);
      commScore = randInt(4, 5);
      npsScore = randInt(8, 10);
    }

    const avgScore = (turnScore + serviceScore + commScore) / 3;

    const greeting = roll < 0.10 ? pick(greetingOptions.slice(2)) : roll < 0.30 ? pick(greetingOptions.slice(1, 3)) : pick(greetingOptions.slice(0, 2));
    const departure = roll < 0.10 ? pick(departureOptions.slice(1)) : departureOptions[0];
    const wouldReturn = roll < 0.10 ? 'Unlikely' : roll < 0.30 ? pick(['Probably', 'Definitely']) : 'Definitely';
    const preArrivalContact = roll > 0.20;
    const keptInformed = roll > 0.15;

    // Flag logic: auto-flag on low scores OR triggered by flagged answers
    const flagReasons = [];
    if (avgScore < 3.0) flagReasons.push({ type: 'low_score', label: `Low composite score: ${avgScore.toFixed(1)}` });
    if (greeting === 'No greeting') flagReasons.push({ type: 'answer_trigger', label: 'Flagged answer: "No greeting" on arrival greeting' });
    if (departure === 'Significant delay') flagReasons.push({ type: 'answer_trigger', label: 'Flagged answer: "Significant delay" on departure status' });
    if (wouldReturn === 'Unlikely') flagReasons.push({ type: 'answer_trigger', label: 'Flagged answer: "Unlikely" to return' });
    if (npsScore <= 3) flagReasons.push({ type: 'answer_trigger', label: `Flagged answer: NPS score of ${npsScore} (detractor)` });

    const isFlagged = flagReasons.length > 0;

    let comment = null;
    if (seededRandom() < 0.40) {
      comment = avgScore >= 4.0 ? pick(positiveComments) : avgScore < 3.0 ? pick(negativeComments) : null;
    }

    const isResolved = isFlagged && seededRandom() < 0.5;
    const flaggedAt = isFlagged ? new Date(purchaseDate.getTime() + randInt(1, 4) * 3600000).toISOString() : null;
    const resolvedAt = isResolved ? new Date(new Date(flaggedAt).getTime() + randInt(2, 72) * 3600000).toISOString() : null;
    const submittedAt = new Date(purchaseDate.getTime() + randInt(1, 48) * 3600000).toISOString();
    const hoursToSubmit = (new Date(submittedAt) - purchaseDate) / 3600000;

    feedbackResponses.push({
      id: `fr-${i + 1}`,
      fuelPurchaseId: purchaseId,
      pilotId: pilot.id,
      pilotName: `${pilot.firstName} ${pilot.lastName}`,
      pilotInitials: pilot.initials,
      fboId: fbo.id,
      fboName: fbo.name,
      icaoCode: fbo.icaoCode,
      aircraftId: ac.id,
      tailNumber: ac.tailNumber,
      aircraftType: `${ac.make} ${ac.model}`,
      aircraftCategory: ac.category,
      companyId: company.id,
      companyName: company.name,
      date: purchaseDate.toISOString(),
      hour,
      dayOfWeek: purchaseDate.getDay(),
      submittedAt,
      hoursToSubmit,
      completionTimeSeconds: randInt(45, 180),
      turnScore,
      serviceScore,
      commScore,
      npsScore,
      avgScore: +avgScore.toFixed(1),
      wouldReturn,
      departureStatus: departure,
      greetingReceived: greeting,
      preArrivalContact,
      keptInformed,
      commentText: comment,
      gallons,
      pricePerGallon: flightsheetPrice,
      retailPrice,
      savingsAmount,
      flagged: isFlagged,
      flagReasons,
      flagType: flagReasons.length > 0 ? (flagReasons.some((r) => r.type === 'low_score') ? 'auto' : 'answer_trigger') : null,
      flaggedAt,
      flagReason: flagReasons.map((r) => r.label).join('; '),
      resolvedAt,
      resolvedBy: isResolved ? 'Derek Sullivan' : null,
      resolutionNote: isResolved ? pick(resolutionNotes) : null,
    });
  }

  // Sort by date descending
  fuelPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
  feedbackResponses.sort((a, b) => new Date(b.date) - new Date(a.date));

  return { fuelPurchases, feedbackResponses };
}

// Generate price history (weekly over 8 weeks)
export function generatePriceHistory() {
  _seed = 100; // Reset seed for consistent history
  const history = {};
  for (const fbo of fbos) {
    const weeks = [];
    let retail = fbo.currentRetailPPG - rand(0.1, 0.3);
    for (let w = 8; w >= 0; w--) {
      const change = rand(-0.08, 0.08);
      retail = +(retail + change).toFixed(2);
      const weekDate = new Date(now.getTime() - w * 7 * dayMs);
      weeks.push({
        week: weekDate.toISOString().slice(0, 10),
        weekLabel: `W${9 - w}`,
        retailPPG: retail,
        flightsheetPPG: +(retail - rand(0.40, 0.60)).toFixed(2),
        change: +change.toFixed(2),
      });
    }
    history[fbo.id] = weeks;
  }
  return history;
}
