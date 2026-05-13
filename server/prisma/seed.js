const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helpers
const uuid = () => crypto.randomUUID();
const hash = (pw) => bcrypt.hashSync(pw, 10);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dayMs = 86400000;

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.surveyAnswer.deleteMany();
  await prisma.feedbackResponse.deleteMany();
  await prisma.fuelPurchase.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.flightbridgeSync.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.pilot.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.fbo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.managementCompany.deleteMany();

  // ============================================================
  // MANAGEMENT COMPANIES
  // ============================================================
  const companies = await Promise.all([
    prisma.managementCompany.create({ data: { name: 'Harco Aviation', primaryContact: 'James Whitfield', email: 'ops@harcoaviation.com', phone: '713-555-0101', city: 'Houston', state: 'TX' } }),
    prisma.managementCompany.create({ data: { name: 'Jesse Aviation', primaryContact: 'Marcus Jesse', email: 'ops@jesseaviation.com', phone: '713-555-0102', city: 'Houston', state: 'TX' } }),
    prisma.managementCompany.create({ data: { name: 'KSolv Group', primaryContact: 'Karen Solverson', email: 'ops@ksolvgroup.com', phone: '281-555-0103', city: 'Sugar Land', state: 'TX' } }),
    prisma.managementCompany.create({ data: { name: 'Javier Air', primaryContact: 'Javier Delgado', email: 'ops@javierair.com', phone: '832-555-0104', city: 'The Woodlands', state: 'TX' } }),
    prisma.managementCompany.create({ data: { name: 'Keith Aviation', primaryContact: 'Keith Rawlings', email: 'ops@keithaviation.com', phone: '713-555-0105', city: 'Houston', state: 'TX' } }),
    prisma.managementCompany.create({ data: { name: 'Bradley Aero', primaryContact: 'Tom Bradley', email: 'ops@bradleyaero.com', phone: '281-555-0106', city: 'Conroe', state: 'TX' } }),
  ]);

  console.log(`  Created ${companies.length} management companies`);

  // ============================================================
  // AIRCRAFT (18 across 6 companies)
  // ============================================================
  const aircraftData = [
    // Harco Aviation (4)
    { tailNumber: 'N401HA', make: 'Embraer', model: 'Phenom 300E', category: 'LIGHT_JET', avgFuelBurnPerHour: 130, co: 0 },
    { tailNumber: 'N502HA', make: 'Cessna', model: 'Citation Latitude', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 200, co: 0 },
    { tailNumber: 'N603HA', make: 'Gulfstream', model: 'G280', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 250, co: 0 },
    // Jesse Aviation (3)
    { tailNumber: 'N210JA', make: 'Bombardier', model: 'Challenger 350', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 260, co: 1 },
    { tailNumber: 'N311JA', make: 'Embraer', model: 'Phenom 100EV', category: 'LIGHT_JET', avgFuelBurnPerHour: 100, co: 1 },
    { tailNumber: 'N412JA', make: 'Dassault', model: 'Falcon 2000LXS', category: 'LARGE_CABIN', avgFuelBurnPerHour: 280, co: 1 },
    // KSolv Group (3)
    { tailNumber: 'N700KS', make: 'Gulfstream', model: 'G600', category: 'LARGE_CABIN', avgFuelBurnPerHour: 340, co: 2 },
    { tailNumber: 'N801KS', make: 'Cessna', model: 'Citation CJ4', category: 'LIGHT_JET', avgFuelBurnPerHour: 150, co: 2 },
    { tailNumber: 'N902KS', make: 'Pilatus', model: 'PC-12 NGX', category: 'TURBOPROP', avgFuelBurnPerHour: 70, co: 2 },
    // Javier Air (3)
    { tailNumber: 'N150JD', make: 'Bombardier', model: 'Global 7500', category: 'LARGE_CABIN', avgFuelBurnPerHour: 400, co: 3 },
    { tailNumber: 'N251JD', make: 'Embraer', model: 'Praetor 600', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 270, co: 3 },
    { tailNumber: 'N352JD', make: 'Cessna', model: 'Citation XLS+', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 185, co: 3 },
    // Keith Aviation (3)
    { tailNumber: 'N440KR', make: 'Gulfstream', model: 'G500', category: 'LARGE_CABIN', avgFuelBurnPerHour: 310, co: 4 },
    { tailNumber: 'N541KR', make: 'Beechcraft', model: 'King Air 350i', category: 'TURBOPROP', avgFuelBurnPerHour: 85, co: 4 },
    { tailNumber: 'N642KR', make: 'Hawker', model: '900XP', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 220, co: 4 },
    // Bradley Aero (2)
    { tailNumber: 'N100BA', make: 'Dassault', model: 'Falcon 900LX', category: 'LARGE_CABIN', avgFuelBurnPerHour: 290, co: 5 },
    { tailNumber: 'N201BA', make: 'Embraer', model: 'Phenom 300E', category: 'LIGHT_JET', avgFuelBurnPerHour: 130, co: 5 },
    { tailNumber: 'N302BA', make: 'Bell', model: '407GXi', category: 'HELICOPTER', avgFuelBurnPerHour: 55, co: 5 },
  ];

  const aircraft = await Promise.all(
    aircraftData.map((a) =>
      prisma.aircraft.create({
        data: {
          tailNumber: a.tailNumber,
          make: a.make,
          model: a.model,
          category: a.category,
          avgFuelBurnPerHour: a.avgFuelBurnPerHour,
          managementCompanyId: companies[a.co].id,
        },
      })
    )
  );
  console.log(`  Created ${aircraft.length} aircraft`);

  // ============================================================
  // FBOs (6 partner FBOs)
  // ============================================================
  const now = new Date();
  const fbosData = [
    { name: 'Jet Aviation', icaoCode: 'KDAL', airportName: 'Dallas Love Field', city: 'Dallas', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'CHAIN', chainName: 'Jet Aviation', retailPPG: 7.25, lat: 32.847, lng: -96.852 },
    { name: 'Atlantic Aviation', icaoCode: 'KHOU', airportName: 'William P. Hobby Airport', city: 'Houston', state: 'TX', fuelSupplier: 'Avfuel', ownershipType: 'CHAIN', chainName: 'Atlantic Aviation', retailPPG: 7.10, lat: 29.6454, lng: -95.2789 },
    { name: 'Galaxy FBO', icaoCode: 'KIAH', airportName: 'George Bush Intercontinental', city: 'Houston', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'INDEPENDENT', chainName: null, retailPPG: 6.95, lat: 29.9902, lng: -95.3368 },
    { name: 'Million Air', icaoCode: 'KSAT', airportName: 'San Antonio International', city: 'San Antonio', state: 'TX', fuelSupplier: 'Avfuel', ownershipType: 'CHAIN', chainName: 'Million Air', retailPPG: 6.80, lat: 29.5337, lng: -98.4698 },
    { name: 'Henriksen Jet Center', icaoCode: 'KDFW', airportName: 'Dallas/Fort Worth International', city: 'Fort Worth', state: 'TX', fuelSupplier: 'Shell Aviation', ownershipType: 'INDEPENDENT', chainName: null, retailPPG: 7.40, lat: 32.8998, lng: -97.0403 },
    { name: 'Signature Flight Support', icaoCode: 'KAUS', airportName: 'Austin-Bergstrom International', city: 'Austin', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'PE_BACKED', chainName: 'Signature Aviation', retailPPG: 7.15, lat: 30.1975, lng: -97.6664 },
  ];

  const fbos = await Promise.all(
    fbosData.map((f) =>
      prisma.fbo.create({
        data: {
          name: f.name,
          icaoCode: f.icaoCode,
          airportName: f.airportName,
          city: f.city,
          state: f.state,
          address: `${randInt(100, 9999)} Aviation Blvd`,
          phone: `${f.state === 'TX' ? pick(['713', '281', '832', '214', '512', '210']) : '555'}-555-${String(randInt(1000, 9999))}`,
          email: `ops@${f.name.toLowerCase().replace(/\s+/g, '')}.com`,
          website: `https://www.${f.name.toLowerCase().replace(/\s+/g, '')}.com`,
          fuelSupplier: f.fuelSupplier,
          ownershipType: f.ownershipType,
          chainName: f.chainName,
          isFlightsheetPartner: true,
          partnerSince: new Date(now.getTime() - randInt(90, 365) * dayMs),
          currentRetailPPG: f.retailPPG,
          lastPriceUpdate: new Date(now.getTime() - randInt(1, 7) * dayMs),
          agreementStatus: 'SIGNED',
          latitude: f.lat,
          longitude: f.lng,
        },
      })
    )
  );
  console.log(`  Created ${fbos.length} FBOs`);

  // ============================================================
  // PRICING TIERS (5 per FBO)
  // ============================================================
  for (const fbo of fbos) {
    const baseRetail = fbosData.find((f) => f.icaoCode === fbo.icaoCode).retailPPG;
    const tier1 = +(baseRetail - rand(0.40, 0.60)).toFixed(2);
    const tiers = [
      { tierName: 'Tier 1', minGallons: 0, maxGallons: 50000, ppg: tier1 },
      { tierName: 'Tier 2', minGallons: 50001, maxGallons: 125000, ppg: +(tier1 - 0.10).toFixed(2) },
      { tierName: 'Tier 3', minGallons: 125001, maxGallons: 225000, ppg: +(tier1 - 0.18).toFixed(2) },
      { tierName: 'Tier 4', minGallons: 225001, maxGallons: 300000, ppg: +(tier1 - 0.25).toFixed(2) },
      { tierName: 'Tier 5', minGallons: 300001, maxGallons: 999999, ppg: +(tier1 - 0.30).toFixed(2) },
    ];
    for (const t of tiers) {
      await prisma.pricingTier.create({
        data: { fboId: fbo.id, tierName: t.tierName, minGallons: t.minGallons, maxGallons: t.maxGallons, pricePerGallon: t.ppg, effectiveDate: new Date(now.getTime() - 60 * dayMs) },
      });
    }
  }
  console.log('  Created pricing tiers');

  // ============================================================
  // PRICE HISTORY (weekly snapshots over 60 days)
  // ============================================================
  for (const fbo of fbos) {
    const baseRetail = fbosData.find((f) => f.icaoCode === fbo.icaoCode).retailPPG;
    let currentRetail = baseRetail - rand(0.1, 0.3);
    for (let w = 8; w >= 0; w--) {
      const change = rand(-0.08, 0.08);
      currentRetail = +(currentRetail + change).toFixed(2);
      await prisma.priceHistory.create({
        data: {
          fboId: fbo.id,
          retailPPG: +currentRetail.toFixed(2),
          flightsheetPPG: +(currentRetail - rand(0.40, 0.60)).toFixed(2),
          recordedAt: new Date(now.getTime() - w * 7 * dayMs),
          changeAmount: +change.toFixed(2),
          changePercent: +((change / currentRetail) * 100).toFixed(2),
        },
      });
    }
  }
  console.log('  Created price history');

  // ============================================================
  // USERS & PILOTS
  // ============================================================
  const pilotProfiles = [
    { first: 'James', last: 'Whitfield', email: 'james.whitfield@harcoaviation.com', co: 0, ac: 0 },
    { first: 'Sarah', last: 'Chen', email: 'sarah.chen@harcoaviation.com', co: 0, ac: 1 },
    { first: 'Michael', last: 'Torres', email: 'michael.torres@harcoaviation.com', co: 0, ac: 2 },
    { first: 'Marcus', last: 'Jesse', email: 'marcus.jesse@jesseaviation.com', co: 1, ac: 3 },
    { first: 'Emily', last: 'Rodriguez', email: 'emily.rodriguez@jesseaviation.com', co: 1, ac: 4 },
    { first: 'David', last: 'Park', email: 'david.park@ksolvgroup.com', co: 2, ac: 6 },
    { first: 'Lisa', last: 'Morgan', email: 'lisa.morgan@ksolvgroup.com', co: 2, ac: 7 },
    { first: 'Carlos', last: 'Reyes', email: 'carlos.reyes@javierair.com', co: 3, ac: 9 },
    { first: 'Amanda', last: 'Foster', email: 'amanda.foster@javierair.com', co: 3, ac: 10 },
    { first: 'Keith', last: 'Rawlings', email: 'keith.rawlings@keithaviation.com', co: 4, ac: 12 },
    { first: 'Nathan', last: 'Wells', email: 'nathan.wells@keithaviation.com', co: 4, ac: 13 },
    { first: 'Tom', last: 'Bradley', email: 'tom.bradley@bradleyaero.com', co: 5, ac: 15 },
  ];

  const pilots = [];
  for (const p of pilotProfiles) {
    const user = await prisma.user.create({
      data: { email: p.email, passwordHash: hash('Demo1234!'), role: 'PILOT', firstName: p.first, lastName: p.last },
    });
    const pilot = await prisma.pilot.create({
      data: {
        userId: user.id,
        initials: p.first[0] + p.last[0],
        certificateNumber: `ATP${randInt(100000, 999999)}`,
        defaultTailId: aircraft[p.ac].id,
        managementCompanyId: companies[p.co].id,
      },
    });
    pilots.push({ ...pilot, user, aircraft: aircraft[p.ac], companyIndex: p.co });
  }
  console.log(`  Created ${pilots.length} pilots`);

  // FBO Staff & Admin users
  await prisma.user.create({ data: { email: 'staff@jetaviation.com', passwordHash: hash('Demo1234!'), role: 'FBO_STAFF', firstName: 'Rachel', lastName: 'Kim' } });
  await prisma.user.create({ data: { email: 'admin@jetaviation.com', passwordHash: hash('Demo1234!'), role: 'FBO_ADMIN', firstName: 'Derek', lastName: 'Sullivan' } });
  await prisma.user.create({ data: { email: 'admin@flightsheet.com', passwordHash: hash('Demo1234!'), role: 'SYSTEM_ADMIN', firstName: 'Christopher', lastName: 'Randall' } });
  console.log('  Created FBO staff, FBO admin, system admin users');

  // ============================================================
  // DEFAULT SURVEY (for Jet Aviation / KDAL)
  // ============================================================
  const jetAv = fbos[0]; // Jet Aviation KDAL
  const survey = await prisma.survey.create({
    data: { fboId: jetAv.id, name: 'Standard Service Survey', isLive: true, isDefault: true },
  });

  // Create all surveys for all FBOs (clone default)
  const fboSurveyMap = { [jetAv.id]: survey.id };
  for (let i = 1; i < fbos.length; i++) {
    const s = await prisma.survey.create({
      data: { fboId: fbos[i].id, name: 'Standard Service Survey', isLive: true, isDefault: true },
    });
    fboSurveyMap[fbos[i].id] = s.id;
  }

  // Questions for each survey
  const questionTemplates = [
    { metric: 'TURN_PERFORMANCE', questionText: 'Overall speed of fuel service', questionType: 'STARS', isRequired: true, displayOrder: 1 },
    { metric: 'TURN_PERFORMANCE', questionText: 'Was your aircraft fueled within the expected timeframe?', questionType: 'YES_NO', isRequired: true, displayOrder: 2 },
    { metric: 'TURN_PERFORMANCE', questionText: 'Departure status', questionType: 'SINGLE_SELECT', options: JSON.stringify(['On time', 'Minor delay', 'Significant delay']), isRequired: true, displayOrder: 3 },
    { metric: 'SERVICE_EXPERIENCE', questionText: 'Overall service experience', questionType: 'STARS', isRequired: true, displayOrder: 4 },
    { metric: 'SERVICE_EXPERIENCE', questionText: 'How were you greeted on arrival?', questionType: 'SINGLE_SELECT', options: JSON.stringify(['Red carpet service', 'Standard welcome', 'Minimal interaction', 'No greeting']), isRequired: true, displayOrder: 5 },
    { metric: 'SERVICE_EXPERIENCE', questionText: 'Did any issues arise during your visit?', questionType: 'YES_NO', isRequired: true, displayOrder: 6 },
    { metric: 'SERVICE_EXPERIENCE', questionText: 'How well was the issue resolved?', questionType: 'STARS', isRequired: true, isConditional: true, conditionAnswer: 'Yes', displayOrder: 7 },
    { metric: 'SERVICE_EXPERIENCE', questionText: 'Would you return to this FBO?', questionType: 'SINGLE_SELECT', options: JSON.stringify(['Definitely', 'Probably', 'Unlikely']), isRequired: true, displayOrder: 8 },
    { metric: 'COMMUNICATION', questionText: 'Pre-arrival communication quality', questionType: 'STARS', isRequired: true, displayOrder: 9 },
    { metric: 'COMMUNICATION', questionText: 'Did the FBO contact you before arrival?', questionType: 'YES_NO', isRequired: true, displayOrder: 10 },
    { metric: 'COMMUNICATION', questionText: 'Were you kept informed while on the ground?', questionType: 'YES_NO', isRequired: true, displayOrder: 11 },
    { metric: 'NPS', questionText: 'How likely are you to return to this FBO?', questionType: 'NPS_SCALE', isRequired: true, displayOrder: 12 },
  ];

  // Create questions for each FBO survey
  const surveyQuestionIds = {};
  for (const fboId of Object.keys(fboSurveyMap)) {
    const surveyId = fboSurveyMap[fboId];
    const qIds = [];
    for (const qt of questionTemplates) {
      const q = await prisma.surveyQuestion.create({
        data: {
          surveyId,
          metric: qt.metric,
          questionText: qt.questionText,
          questionType: qt.questionType,
          options: qt.options || null,
          isRequired: qt.isRequired,
          isConditional: qt.isConditional || false,
          conditionAnswer: qt.conditionAnswer || null,
          displayOrder: qt.displayOrder,
        },
      });
      qIds.push(q);
    }
    // Link Q7 conditional to Q6
    await prisma.surveyQuestion.update({
      where: { id: qIds[6].id },
      data: { conditionQuestionId: qIds[5].id },
    });
    surveyQuestionIds[fboId] = qIds;
  }
  console.log('  Created surveys and questions for all FBOs');

  // ============================================================
  // FUEL PURCHASES & FEEDBACK (200 records over 60 days)
  // ============================================================
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

  let purchaseCount = 0;
  let flagCount = 0;

  for (let i = 0; i < 200; i++) {
    const pilot = pick(pilots);
    const fbo = pick(fbos);
    const ac = pilot.aircraft;
    const daysAgo = randInt(0, 60);
    const hour = randInt(6, 20);
    const purchaseDate = new Date(now.getTime() - daysAgo * dayMs);
    purchaseDate.setHours(hour, randInt(0, 59), 0, 0);

    const fboData = fbosData.find((f) => f.icaoCode === fbo.icaoCode);
    const retailPrice = fboData.retailPPG;
    const flightsheetPrice = +(retailPrice - rand(0.40, 0.60)).toFixed(2);
    const gallons = +rand(80, 800).toFixed(1);
    const totalAmount = +(gallons * flightsheetPrice).toFixed(2);
    const savingsAmount = +((retailPrice - flightsheetPrice) * gallons).toFixed(2);

    const purchase = await prisma.fuelPurchase.create({
      data: {
        pilotId: pilot.id,
        aircraftId: ac.id,
        fboId: fbo.id,
        date: purchaseDate,
        gallons,
        pricePerGallon: flightsheetPrice,
        retailPriceAtTime: retailPrice,
        totalAmount,
        savingsAmount,
        fuelType: 'Jet-A',
        extractedByAI: Math.random() > 0.3,
        confirmedByPilot: true,
        invoiceNumber: `INV-${fbo.icaoCode}-${String(i + 1).padStart(4, '0')}`,
      },
    });

    // Generate scores based on distribution: 70% high, 20% mid, 10% low
    const roll = Math.random();
    let turnScore, serviceScore, commScore, npsScore;

    if (roll < 0.10) {
      // Low scores
      turnScore = randInt(1, 2);
      serviceScore = randInt(1, 2);
      commScore = randInt(1, 2);
      npsScore = randInt(0, 4);
    } else if (roll < 0.30) {
      // Mid scores
      turnScore = randInt(3, 3);
      serviceScore = randInt(3, 4);
      commScore = randInt(3, 3);
      npsScore = randInt(5, 7);
    } else {
      // High scores
      turnScore = randInt(4, 5);
      serviceScore = randInt(4, 5);
      commScore = randInt(4, 5);
      npsScore = randInt(8, 10);
    }

    const avgScore = (turnScore + serviceScore + commScore) / 3;
    const isFlagged = avgScore < 3.0;
    if (isFlagged) flagCount++;

    const greeting = roll < 0.10 ? pick(greetingOptions.slice(2)) : roll < 0.30 ? pick(greetingOptions.slice(1, 3)) : pick(greetingOptions.slice(0, 2));
    const departure = roll < 0.10 ? pick(departureOptions.slice(1)) : departureOptions[0];
    const wouldReturn = roll < 0.10 ? 'Unlikely' : roll < 0.30 ? pick(['Probably', 'Definitely']) : 'Definitely';
    const issuesArose = roll < 0.15;
    const preArrival = roll > 0.20;
    const keptInformed = roll > 0.15;

    // ~40% have comments
    let comment = null;
    if (Math.random() < 0.40) {
      comment = avgScore >= 4.0 ? pick(positiveComments) : avgScore < 3.0 ? pick(negativeComments) : null;
    }

    const isResolved = isFlagged && Math.random() < 0.5;
    const flaggedAt = isFlagged ? new Date(purchaseDate.getTime() + randInt(1, 4) * 3600000) : null;
    const resolvedAt = isResolved ? new Date(flaggedAt.getTime() + randInt(2, 72) * 3600000) : null;

    const surveyId = fboSurveyMap[fbo.id];
    const questions = surveyQuestionIds[fbo.id];

    const response = await prisma.feedbackResponse.create({
      data: {
        fuelPurchaseId: purchase.id,
        surveyId,
        pilotId: pilot.id,
        fboId: fbo.id,
        aircraftId: ac.id,
        submittedAt: new Date(purchaseDate.getTime() + randInt(1, 48) * 3600000),
        completionTimeSeconds: randInt(45, 180),
        turnScore,
        serviceScore,
        commScore,
        npsScore,
        wouldReturn,
        departureStatus: departure,
        greetingReceived: greeting,
        preArrivalContact: preArrival,
        keptInformed,
        commentText: comment,
        flagged: isFlagged,
        flaggedAt,
        flagReason: isFlagged ? `Low composite score: ${avgScore.toFixed(1)}` : null,
        resolvedAt,
        resolvedBy: isResolved ? 'Derek Sullivan' : null,
        resolutionNote: isResolved ? pick(resolutionNotes) : null,
      },
    });

    // Create individual survey answers
    if (questions) {
      const answers = [
        { qIdx: 0, answerNumeric: turnScore, answerText: String(turnScore) },
        { qIdx: 1, answerText: turnScore >= 4 ? 'Yes' : turnScore <= 2 ? 'No' : pick(['Yes', 'No']), answerBoolean: turnScore >= 4 },
        { qIdx: 2, answerText: departure },
        { qIdx: 3, answerNumeric: serviceScore, answerText: String(serviceScore) },
        { qIdx: 4, answerText: greeting },
        { qIdx: 5, answerText: issuesArose ? 'Yes' : 'No', answerBoolean: issuesArose },
      ];
      if (issuesArose) {
        answers.push({ qIdx: 6, answerNumeric: randInt(1, 4), answerText: String(randInt(1, 4)) });
      }
      answers.push(
        { qIdx: 7, answerText: wouldReturn },
        { qIdx: 8, answerNumeric: commScore, answerText: String(commScore) },
        { qIdx: 9, answerText: preArrival ? 'Yes' : 'No', answerBoolean: preArrival },
        { qIdx: 10, answerText: keptInformed ? 'Yes' : 'No', answerBoolean: keptInformed },
        { qIdx: 11, answerNumeric: npsScore, answerText: String(npsScore) }
      );

      for (const a of answers) {
        await prisma.surveyAnswer.create({
          data: {
            responseId: response.id,
            questionId: questions[a.qIdx].id,
            answerText: a.answerText || null,
            answerNumeric: a.answerNumeric || null,
            answerBoolean: a.answerBoolean ?? null,
          },
        });
      }
    }

    purchaseCount++;
  }

  console.log(`  Created ${purchaseCount} fuel purchases with feedback`);
  console.log(`  Flagged responses: ${flagCount}`);

  // ============================================================
  // SUMMARY
  // ============================================================
  const totalUsers = await prisma.user.count();
  const totalPurchases = await prisma.fuelPurchase.count();
  const totalResponses = await prisma.feedbackResponse.count();
  const totalAnswers = await prisma.surveyAnswer.count();

  console.log('\n=== SEED COMPLETE ===');
  console.log(`  Users:           ${totalUsers}`);
  console.log(`  Pilots:          ${pilots.length}`);
  console.log(`  Aircraft:        ${aircraft.length}`);
  console.log(`  FBOs:            ${fbos.length}`);
  console.log(`  Fuel Purchases:  ${totalPurchases}`);
  console.log(`  Responses:       ${totalResponses}`);
  console.log(`  Survey Answers:  ${totalAnswers}`);
  console.log('\n  Demo Credentials:');
  console.log('  Pilot:       james.whitfield@harcoaviation.com / Demo1234!');
  console.log('  FBO Staff:   staff@jetaviation.com / Demo1234!');
  console.log('  FBO Admin:   admin@jetaviation.com / Demo1234!');
  console.log('  Admin:       admin@flightsheet.com / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
