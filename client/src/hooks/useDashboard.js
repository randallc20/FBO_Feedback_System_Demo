import { useMemo } from 'react';
import { generateData } from '../data/generate';
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear, isWithinInterval, format, differenceInHours } from 'date-fns';

const PERIODS = {
  today: () => ({ start: startOfDay(new Date()), end: new Date() }),
  week: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: new Date() }),
  month: () => ({ start: startOfMonth(new Date()), end: new Date() }),
  '6months': () => ({ start: subDays(new Date(), 180), end: new Date() }),
  year: () => ({ start: startOfYear(new Date()), end: new Date() }),
};

function getPreviousPeriod(start, end) {
  const duration = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - duration), end: new Date(start.getTime()) };
}

function filterByPeriod(items, start, end) {
  return items.filter((item) => {
    const d = new Date(item.date);
    return isWithinInterval(d, { start, end });
  });
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function pctChange(current, previous) {
  if (!previous) return null;
  return previous === 0 ? (current > 0 ? 100 : 0) : +((current - previous) / previous * 100).toFixed(1);
}

// Generate sparkline data by splitting period into N buckets
function sparkline(items, start, end, valueKey, n = 8) {
  const duration = (end.getTime() - start.getTime()) / n;
  return Array.from({ length: n }, (_, i) => {
    const bStart = new Date(start.getTime() + i * duration);
    const bEnd = new Date(start.getTime() + (i + 1) * duration);
    const bucket = items.filter((item) => {
      const d = new Date(item.date);
      return d >= bStart && d < bEnd;
    });
    return {
      label: format(bStart, 'MMM d'),
      value: valueKey === 'count' ? bucket.length : bucket.reduce((s, item) => s + (item[valueKey] || 0), 0),
    };
  });
}

export function useDashboard(period = 'month', customRange = null) {
  const { fuelPurchases, feedbackResponses, fbo } = useMemo(() => generateData(), []);

  return useMemo(() => {
    const range = customRange || (PERIODS[period] ? PERIODS[period]() : PERIODS.month());
    const { start, end } = range;
    const prev = getPreviousPeriod(start, end);

    // Filter data
    const purchases = filterByPeriod(fuelPurchases, start, end);
    const prevPurchases = filterByPeriod(fuelPurchases, prev.start, prev.end);
    const responses = filterByPeriod(feedbackResponses, start, end);
    const prevResponses = filterByPeriod(feedbackResponses, prev.start, prev.end);

    // --- FUEL METRICS ---
    const totalGallons = purchases.reduce((s, p) => s + p.gallons, 0);
    const prevGallons = prevPurchases.reduce((s, p) => s + p.gallons, 0);
    const totalVisits = purchases.length;
    const prevVisits = prevPurchases.length;
    const avgGallonsPerVisit = totalVisits ? +(totalGallons / totalVisits).toFixed(1) : 0;
    const prevAvgGPV = prevVisits ? +(prevGallons / prevVisits).toFixed(1) : 0;
    const totalMargin = purchases.reduce((s, p) => s + p.margin, 0);
    const prevMargin = prevPurchases.reduce((s, p) => s + p.margin, 0);

    const fuel = {
      totalGallons: +totalGallons.toFixed(0),
      totalVisits,
      avgGallonsPerVisit,
      totalMargin: +totalMargin.toFixed(0),
      gallonsChange: pctChange(totalGallons, prevGallons),
      visitsChange: pctChange(totalVisits, prevVisits),
      avgGPVChange: pctChange(avgGallonsPerVisit, prevAvgGPV),
      marginChange: pctChange(totalMargin, prevMargin),
      gallonsSparkline: sparkline(purchases, start, end, 'gallons'),
      visitsSparkline: sparkline(purchases, start, end, 'count'),
      marginSparkline: sparkline(purchases, start, end, 'margin'),
      avgGPVSparkline: sparkline(purchases, start, end, 'gallons'), // will be averaged per bucket later visually
      lowAvgWarning: avgGallonsPerVisit > 0 && avgGallonsPerVisit < 150,
    };

    // --- SURVEY METRICS ---
    const sampleSize = responses.length;
    const sampleWarning = sampleSize < 3 ? 'insufficient' : sampleSize < 10 ? 'low' : null;

    // Use 30-day fallback if insufficient
    const effectiveResponses = sampleSize < 3
      ? filterByPeriod(feedbackResponses, subDays(new Date(), 30), new Date())
      : responses;

    const composites = effectiveResponses.map((r) => r.composite);
    const compositeAvg = +avg(composites).toFixed(1);
    const turnAvg = +avg(effectiveResponses.map((r) => r.turnScore)).toFixed(1);
    const serviceAvg = +avg(effectiveResponses.map((r) => r.serviceScore)).toFixed(1);
    const commAvg = +avg(effectiveResponses.map((r) => r.commScore)).toFixed(1);

    const prevCompositeAvg = +avg(prevResponses.map((r) => r.composite)).toFixed(1);

    // NPS — always 30-day rolling
    const nps30 = filterByPeriod(feedbackResponses, subDays(new Date(), 30), new Date());
    const promoters = nps30.filter((r) => r.npsScore >= 9).length;
    const detractors = nps30.filter((r) => r.npsScore <= 6).length;
    const passives = nps30.length - promoters - detractors;
    const npsScore = nps30.length ? Math.round((promoters / nps30.length) * 100 - (detractors / nps30.length) * 100) : 0;
    const npsBreakdown = {
      promoters: nps30.length ? +((promoters / nps30.length) * 100).toFixed(0) : 0,
      passives: nps30.length ? +((passives / nps30.length) * 100).toFixed(0) : 0,
      detractors: nps30.length ? +((detractors / nps30.length) * 100).toFixed(0) : 0,
      total: nps30.length,
    };

    // Would Return
    const returnAnswers = effectiveResponses.filter((r) => r.wouldReturn);
    const definitely = returnAnswers.filter((r) => r.wouldReturn === 'Definitely').length;
    const probably = returnAnswers.filter((r) => r.wouldReturn === 'Probably').length;
    const unlikely = returnAnswers.filter((r) => r.wouldReturn === 'Unlikely').length;
    const wouldReturnRate = returnAnswers.length ? +((definitely / returnAnswers.length) * 100).toFixed(0) : 0;
    const returnBreakdown = {
      definitely: returnAnswers.length ? +((definitely / returnAnswers.length) * 100).toFixed(0) : 0,
      probably: returnAnswers.length ? +((probably / returnAnswers.length) * 100).toFixed(0) : 0,
      unlikely: returnAnswers.length ? +((unlikely / returnAnswers.length) * 100).toFixed(0) : 0,
    };

    // Flags
    const allFlags = feedbackResponses.filter((r) => r.flagged);
    const openFlags = allFlags.filter((r) => !r.resolvedAt);
    const resolvedThisMonth = allFlags.filter((r) => r.resolvedAt && new Date(r.resolvedAt) >= startOfMonth(new Date())).length;
    const oldestOpen = openFlags.length ? openFlags.reduce((oldest, f) => {
      const age = new Date(f.flaggedAt);
      return age < oldest ? age : oldest;
    }, new Date()) : null;
    const avgResolutionHrs = allFlags.filter((r) => r.resolvedAt).length
      ? +avg(allFlags.filter((r) => r.resolvedAt).map((r) => differenceInHours(new Date(r.resolvedAt), new Date(r.flaggedAt)))).toFixed(0)
      : 0;

    // Comments
    const comments = effectiveResponses.filter((r) => r.commentText).map((r) => ({
      id: r.id,
      tailNumber: r.tailNumber,
      pilotName: r.pilotName,
      date: r.date,
      composite: r.composite,
      turnScore: r.turnScore,
      serviceScore: r.serviceScore,
      commScore: r.commScore,
      commentText: r.commentText,
      flagged: r.flagged,
    }));
    comments.sort((a, b) => (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0) || new Date(b.date) - new Date(a.date));

    // --- CHART DATA ---
    // Weekly score trends
    const weeks = [];
    let weekStart = new Date(start);
    while (weekStart < end) {
      const weekEnd = new Date(Math.min(weekStart.getTime() + 7 * dayMs, end.getTime()));
      const weekResponses = effectiveResponses.filter((r) => {
        const d = new Date(r.date);
        return d >= weekStart && d < weekEnd;
      });
      weeks.push({
        label: format(weekStart, 'MMM d'),
        turn: weekResponses.length ? +avg(weekResponses.map((r) => r.turnScore)).toFixed(1) : null,
        service: weekResponses.length ? +avg(weekResponses.map((r) => r.serviceScore)).toFixed(1) : null,
        comm: weekResponses.length ? +avg(weekResponses.map((r) => r.commScore)).toFixed(1) : null,
        composite: weekResponses.length ? +avg(weekResponses.map((r) => r.composite)).toFixed(1) : null,
        count: weekResponses.length,
      });
      weekStart = weekEnd;
    }

    // Score distribution per metric
    const distribution = { turn: [0, 0, 0, 0, 0], service: [0, 0, 0, 0, 0], comm: [0, 0, 0, 0, 0] };
    effectiveResponses.forEach((r) => {
      if (r.turnScore >= 1 && r.turnScore <= 5) distribution.turn[r.turnScore - 1]++;
      if (r.serviceScore >= 1 && r.serviceScore <= 5) distribution.service[r.serviceScore - 1]++;
      if (r.commScore >= 1 && r.commScore <= 5) distribution.comm[r.commScore - 1]++;
    });

    // Heatmap: time bucket × day of week
    const timeBuckets = ['0600-0900', '0900-1200', '1200-1500', '1500-1800', '1800+'];
    const timeBucketLabels = ['Early', 'Morning', 'Midday', 'Afternoon', 'Evening'];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmap = timeBuckets.map((_, ti) =>
      dayLabels.map((_, di) => {
        const cell = effectiveResponses.filter((r) => {
          const h = r.hour;
          const tb = h < 9 ? 0 : h < 12 ? 1 : h < 15 ? 2 : h < 18 ? 3 : 4;
          return tb === ti && r.dayOfWeek === di;
        });
        return {
          avg: cell.length ? +avg(cell.map((r) => r.composite)).toFixed(1) : null,
          count: cell.length,
        };
      })
    );

    // Tail number breakdown
    const tailMap = {};
    effectiveResponses.forEach((r) => {
      if (!tailMap[r.tailNumber]) {
        tailMap[r.tailNumber] = {
          tailNumber: r.tailNumber,
          aircraftType: r.aircraftType,
          pilotName: r.pilotName,
          pilotEmail: r.pilotEmail,
          managementCompany: r.managementCompany,
          visits: 0,
          totalGallons: 0,
          scores: [],
          npsScores: [],
          responses: [],
          hasOpenFlag: false,
          commentCount: 0,
        };
      }
      const t = tailMap[r.tailNumber];
      t.visits++;
      t.totalGallons += r.gallons;
      t.scores.push(r.composite);
      t.npsScores.push(r.npsScore);
      t.responses.push(r);
      if (r.flagged && !r.resolvedAt) t.hasOpenFlag = true;
      if (r.commentText) t.commentCount++;
    });
    const tailBreakdown = Object.values(tailMap).map((t) => ({
      ...t,
      totalGallons: +t.totalGallons.toFixed(0),
      avgComposite: +avg(t.scores).toFixed(1),
      avgNPS: +avg(t.npsScores).toFixed(1),
      lastVisit: t.responses[0]?.date,
    })).sort((a, b) => b.visits - a.visits);

    // Repeat visitor flag patterns (same tail, 3+ flags in 30 days)
    const flagPatterns = {};
    const thirtyDaysAgo = subDays(new Date(), 30);
    allFlags.forEach((f) => {
      if (new Date(f.date) >= thirtyDaysAgo) {
        flagPatterns[f.tailNumber] = (flagPatterns[f.tailNumber] || 0) + 1;
      }
    });

    const survey = {
      sampleSize,
      sampleWarning,
      compositeAvg,
      turnAvg,
      serviceAvg,
      commAvg,
      compositeChange: pctChange(compositeAvg, prevCompositeAvg),
      npsScore,
      npsBreakdown,
      wouldReturnRate,
      returnBreakdown,
      openFlagCount: openFlags.length,
      oldestFlagAge: oldestOpen,
      resolvedThisMonth,
      avgResolutionHrs,
      criticalCount: openFlags.filter((f) => f.turnScore === 1 || f.serviceScore === 1 || f.commScore === 1).length,
      seriousCount: openFlags.filter((f) => {
        const min = Math.min(f.turnScore, f.serviceScore, f.commScore);
        return min === 2;
      }).length,
      commentCount: comments.length,
    };

    const charts = {
      trends: weeks,
      distribution,
      heatmap,
      heatmapLabels: { time: timeBucketLabels, days: dayLabels },
      tailBreakdown,
    };

    const alerts = {
      open: openFlags.sort((a, b) => {
        const aMin = Math.min(a.turnScore, a.serviceScore, a.commScore);
        const bMin = Math.min(b.turnScore, b.serviceScore, b.commScore);
        if (aMin !== bMin) return aMin - bMin;
        return new Date(a.flaggedAt) - new Date(b.flaggedAt);
      }),
      resolved: allFlags.filter((r) => r.resolvedAt).sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt)),
      flagPatterns,
    };

    return { fuel, survey, charts, alerts, comments, fbo, responses: effectiveResponses, allResponses: feedbackResponses, allPurchases: fuelPurchases };
  }, [period, customRange, fuelPurchases, feedbackResponses, fbo]);
}

const dayMs = 86400000;
