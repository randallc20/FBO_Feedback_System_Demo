import { aircraft as rawAircraft } from './aircraft';
import { pilots } from './pilots';
import { managementCompanies } from './companies';

// Enrich aircraft with pilot and company info for the generator
const catMap = { LIGHT_JET: 'Light', MIDSIZE_JET: 'Midsize', SUPER_MIDSIZE: 'Super Mid', LARGE_CABIN: 'Large', TURBOPROP: 'Turboprop', HELICOPTER: 'Turboprop' };
const aircraft = rawAircraft.map((ac) => {
  const pilot = pilots.find((p) => p.defaultAircraftId === ac.id);
  const company = managementCompanies.find((c) => c.id === ac.companyId);
  return {
    ...ac,
    category: catMap[ac.category] || ac.category,
    pilotName: pilot ? `${pilot.firstName} ${pilot.lastName}` : 'Unknown Pilot',
    pilotEmail: pilot?.email || null,
    managementCompany: company?.name || 'Independent',
  };
});

// Seeded random for consistent data across reloads
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
const rand = (min, max) => seededRandom() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(seededRandom() * arr.length)];

const FBO = {
  id: 'fbo-1',
  name: 'Jet Aviation',
  icaoCode: 'KDAL',
  airportName: 'Dallas Love Field',
  city: 'Dallas',
  state: 'TX',
  retailPPG: 6.05,
  flightsheetPPG: 5.32,
  supplierCost: 4.45,
};

const positiveComments = [
  'Exceptional service today. Aircraft was fueled and ready ahead of schedule.',
  'Best FBO experience we have had in Dallas. Will absolutely return.',
  'Ground crew was professional and courteous. Seamless turn.',
  'Pre-arrival communication was outstanding. Everything was ready on arrival.',
  'Quick turn, very professional team. Highly recommend to our fleet.',
  'Top-notch service from start to finish. Crew transport was waiting for us.',
  'Outstanding ramp handling. The team anticipated every need before we asked.',
  'Fuel truck was on the ramp within five minutes of shutdown. Impressive.',
  'Excellent FBO. Clean facilities, friendly staff, fast fuel.',
  'Best service I have received in the last 6 months. Keep it up.',
];

const negativeComments = [
  'Waited over 90 minutes for fuel. Missed our departure slot.',
  'No one came out to greet us. Had to find someone inside to request fuel.',
  'Fuel truck arrived without the requested additive. Had to wait for correction.',
  'Communication before arrival was non-existent. No one knew we were coming.',
  'Ground crew seemed undertrained. Simple tug request took 40 minutes.',
  'Third visit this month with a significant delay. This is becoming a pattern.',
  'Requested GPU on arrival notice. It was never set up. Unacceptable.',
  'Ramp was disorganized. Our aircraft was blocked by a tug for 25 minutes.',
];

const resolutionNotes = [
  'Spoke with ramp supervisor. Staffing issue identified and addressed.',
  'Called pilot directly. Apologized and offered priority service on next visit.',
  'Reviewed fueling log. Equipment malfunction confirmed. Truck serviced.',
  'Briefed entire line crew on communication protocols. Retrained on pre-arrival.',
  'Identified scheduling gap during afternoon shift. Added coverage.',
  'Met with management company rep to discuss. Follow-up meeting scheduled.',
  'Implemented new arrival checklist to prevent recurrence.',
  'Issue traced to fuel farm delay. Maintenance completed same day.',
];

const now = new Date();
const dayMs = 86400000;

// Weight weekdays higher than weekends
function randomDate(daysBack) {
  let date;
  do {
    const daysAgo = randInt(0, daysBack);
    date = new Date(now.getTime() - daysAgo * dayMs);
  } while (date.getDay() === 0 && seededRandom() > 0.3); // fewer Sundays
  const hour = randInt(6, 20);
  date.setHours(hour, randInt(0, 59), 0, 0);
  return date;
}

export function generateData() {
  _seed = 42; // Reset for consistency
  const fuelPurchases = [];
  const feedbackResponses = [];

  for (let i = 0; i < 180; i++) {
    const ac = pick(aircraft);
    const date = randomDate(90);
    const hour = date.getHours();

    // Vary gallons by aircraft category
    const baseGal = ac.category === 'Large' ? rand(250, 450) :
                    ac.category === 'Super Mid' ? rand(200, 380) :
                    ac.category === 'Midsize' ? rand(150, 320) :
                    ac.category === 'Light' ? rand(100, 220) :
                    ac.category === 'Very Light' ? rand(80, 160) :
                    rand(80, 180); // Turboprop
    const gallons = +baseGal.toFixed(1);
    const totalAmount = +(gallons * FBO.flightsheetPPG).toFixed(2);
    const savingsAmount = +((FBO.retailPPG - FBO.flightsheetPPG) * gallons).toFixed(2);
    const margin = +((FBO.flightsheetPPG - FBO.supplierCost) * gallons).toFixed(2);

    const purchaseId = `fp-${i + 1}`;

    fuelPurchases.push({
      id: purchaseId,
      aircraftId: ac.id,
      tailNumber: ac.tailNumber,
      aircraftType: `${ac.make} ${ac.model}`,
      category: ac.category,
      pilotName: ac.pilotName,
      pilotEmail: ac.pilotEmail,
      managementCompany: ac.managementCompany,
      fboId: FBO.id,
      date: date.toISOString(),
      hour,
      dayOfWeek: date.getDay(),
      gallons,
      flightsheetPPG: FBO.flightsheetPPG,
      retailPPG: FBO.retailPPG,
      totalAmount,
      savingsAmount,
      margin,
      fuelType: 'Jet-A',
      invoiceNumber: `INV-KDAL-${String(i + 1).padStart(4, '0')}`,
    });

    // Score distribution: 55% high, 25% mid, 15% mixed, 5% low
    const roll = seededRandom();
    let turnScore, serviceScore, commScore, npsScore;

    if (roll < 0.05) {
      // Low across the board
      turnScore = randInt(1, 2);
      serviceScore = randInt(1, 2);
      commScore = randInt(1, 2);
      npsScore = randInt(0, 5);
    } else if (roll < 0.20) {
      // Mixed — one metric low, two high
      const lowMetric = randInt(0, 2);
      turnScore = lowMetric === 0 ? randInt(1, 2) : randInt(4, 5);
      serviceScore = lowMetric === 1 ? randInt(1, 2) : randInt(4, 5);
      commScore = lowMetric === 2 ? randInt(1, 2) : randInt(4, 5);
      npsScore = randInt(4, 7);
    } else if (roll < 0.45) {
      // Mid scores
      turnScore = randInt(3, 4);
      serviceScore = randInt(3, 4);
      commScore = randInt(3, 4);
      npsScore = randInt(6, 8);
    } else {
      // High scores
      turnScore = randInt(4, 5);
      serviceScore = randInt(4, 5);
      commScore = randInt(4, 5);
      npsScore = randInt(8, 10);
    }

    const composite = +((turnScore + serviceScore + commScore) / 3).toFixed(1);

    // Derive NPS from composite (no separate NPS question in ticket)
    npsScore = Math.round((composite / 5) * 10 + (seededRandom() - 0.5) * 2);
    npsScore = Math.max(0, Math.min(10, npsScore));

    // Comments on ~45% of responses
    let comment = null;
    if (seededRandom() < 0.45) {
      comment = composite >= 4 ? pick(positiveComments) : composite < 3 ? pick(negativeComments) : null;
    }

    // Flagging: any individual metric ≤ 2
    const isFlagged = turnScore <= 2 || serviceScore <= 2 || commScore <= 2;
    const flagReasons = [];
    if (turnScore <= 2) flagReasons.push(`Turn Performance: ${turnScore} star${turnScore > 1 ? 's' : ''}`);
    if (serviceScore <= 2) flagReasons.push(`Service Experience: ${serviceScore} star${serviceScore > 1 ? 's' : ''}`);
    if (commScore <= 2) flagReasons.push(`Communication: ${commScore} star${commScore > 1 ? 's' : ''}`);
    if (npsScore <= 3) flagReasons.push(`NPS: ${npsScore}/10 (Detractor)`);

    // Callback request (~15% overall, higher when flagged)
    const wantsCallback = isFlagged ? seededRandom() < 0.45 : seededRandom() < 0.15;

    const flaggedAt = isFlagged ? new Date(date.getTime() + randInt(1, 4) * 3600000).toISOString() : null;
    const submittedAt = new Date(date.getTime() + randInt(1, 24) * 3600000).toISOString();

    // Ticket timestamps for response time tracking
    const ticketCreatedAt = submittedAt;
    // ~80% of tickets resolved, 20% still open (especially recent ones)
    const daysOld = (now.getTime() - date.getTime()) / dayMs;
    const isResolved = daysOld > 7 ? seededRandom() < 0.9 : seededRandom() < 0.6;
    const ticketResolvedAt = isResolved
      ? new Date(new Date(ticketCreatedAt).getTime() + randInt(1, 72) * 3600000).toISOString()
      : null;

    // Resolution: resolve most flagged ones, leave some open
    let resolvedAt = null, resolvedBy = null, resolutionNote = null, pilotContacted = false, pilotContactMethod = null;
    if (isFlagged && seededRandom() < 0.67) {
      resolvedAt = new Date(new Date(flaggedAt).getTime() + randInt(2, 72) * 3600000).toISOString();
      resolvedBy = 'Stuart Mitchell';
      resolutionNote = pick(resolutionNotes);
      pilotContacted = seededRandom() < 0.7;
      pilotContactMethod = pilotContacted ? pick(['Phone', 'Email', 'In Person']) : null;
    }

    feedbackResponses.push({
      id: `fr-${i + 1}`,
      fuelPurchaseId: purchaseId,
      aircraftId: ac.id,
      tailNumber: ac.tailNumber,
      aircraftType: `${ac.make} ${ac.model}`,
      category: ac.category,
      pilotName: ac.pilotName,
      pilotEmail: ac.pilotEmail,
      managementCompany: ac.managementCompany,
      fboId: FBO.id,
      date: date.toISOString(),
      hour,
      dayOfWeek: date.getDay(),
      submittedAt,
      turnScore,
      serviceScore,
      commScore,
      composite,
      npsScore,
      wantsCallback,
      ticketCreatedAt,
      ticketResolvedAt,
      commentText: comment,
      gallons,
      flightsheetPPG: FBO.flightsheetPPG,
      retailPPG: FBO.retailPPG,
      savingsAmount,
      flagged: isFlagged,
      flagReasons,
      flaggedAt,
      resolvedAt,
      resolvedBy,
      resolutionNote,
      pilotContacted,
      pilotContactMethod,
    });
  }

  // Sort by date descending
  fuelPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
  feedbackResponses.sort((a, b) => new Date(b.date) - new Date(a.date));

  return { fuelPurchases, feedbackResponses, fbo: FBO };
}
