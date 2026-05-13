import { useMemo } from 'react';
import { generateMockData, generatePriceHistory } from '../data/generateResponses';
import { fbos } from '../data/fbos';
import { managementCompanies } from '../data/companies';
import { aircraft, categoryLabels } from '../data/aircraft';

export function useMockData(fboId = 'fbo-1') {
  return useMemo(() => {
    const { fuelPurchases, feedbackResponses } = generateMockData();
    const priceHistory = generatePriceHistory();

    // Filter for selected FBO
    const fboResponses = feedbackResponses.filter((r) => r.fboId === fboId);
    const fboPurchases = fuelPurchases.filter((p) => p.fboId === fboId);
    const fbo = fbos.find((f) => f.id === fboId);

    // Stats
    const totalResponses = fboResponses.length;
    const avgTurn = +(fboResponses.reduce((s, r) => s + r.turnScore, 0) / totalResponses).toFixed(1);
    const avgService = +(fboResponses.reduce((s, r) => s + r.serviceScore, 0) / totalResponses).toFixed(1);
    const avgComm = +(fboResponses.reduce((s, r) => s + r.commScore, 0) / totalResponses).toFixed(1);
    const avgNps = +(fboResponses.reduce((s, r) => s + r.npsScore, 0) / totalResponses).toFixed(1);
    const openFlags = fboResponses.filter((r) => r.flagged && !r.resolvedAt).length;

    // NPS segments
    const promoters = fboResponses.filter((r) => r.npsScore >= 9).length;
    const passives = fboResponses.filter((r) => r.npsScore >= 7 && r.npsScore <= 8).length;
    const detractors = fboResponses.filter((r) => r.npsScore <= 6).length;
    const npsPercent = {
      promoters: +((promoters / totalResponses) * 100).toFixed(1),
      passives: +((passives / totalResponses) * 100).toFixed(1),
      detractors: +((detractors / totalResponses) * 100).toFixed(1),
    };
    const trueNps = +(npsPercent.promoters - npsPercent.detractors).toFixed(0);

    // Would return
    const returnCounts = { Definitely: 0, Probably: 0, Unlikely: 0 };
    fboResponses.forEach((r) => { if (r.wouldReturn) returnCounts[r.wouldReturn]++; });
    const returnRates = {
      Definitely: +((returnCounts.Definitely / totalResponses) * 100).toFixed(1),
      Probably: +((returnCounts.Probably / totalResponses) * 100).toFixed(1),
      Unlikely: +((returnCounts.Unlikely / totalResponses) * 100).toFixed(1),
    };

    // Network averages (all FBOs)
    const allAvgTurn = +(feedbackResponses.reduce((s, r) => s + r.turnScore, 0) / feedbackResponses.length).toFixed(1);
    const allAvgService = +(feedbackResponses.reduce((s, r) => s + r.serviceScore, 0) / feedbackResponses.length).toFixed(1);
    const allAvgComm = +(feedbackResponses.reduce((s, r) => s + r.commScore, 0) / feedbackResponses.length).toFixed(1);

    // Weekly trends (last 8 weeks)
    const now = new Date();
    const weekMs = 7 * 86400000;
    const weeklyTrends = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * weekMs);
      const weekEnd = new Date(now.getTime() - w * weekMs);
      const weekResponses = fboResponses.filter((r) => {
        const d = new Date(r.date);
        return d >= weekStart && d < weekEnd;
      });
      const count = weekResponses.length;
      weeklyTrends.push({
        week: `W${8 - w}`,
        turnAvg: count ? +(weekResponses.reduce((s, r) => s + r.turnScore, 0) / count).toFixed(1) : null,
        serviceAvg: count ? +(weekResponses.reduce((s, r) => s + r.serviceScore, 0) / count).toFixed(1) : null,
        commAvg: count ? +(weekResponses.reduce((s, r) => s + r.commScore, 0) / count).toFixed(1) : null,
        responses: count,
        gallons: +weekResponses.reduce((s, r) => s + (r.gallons || 0), 0).toFixed(0),
        compositeAvg: count ? +((weekResponses.reduce((s, r) => s + r.turnScore + r.serviceScore + r.commScore, 0) / count) / 3).toFixed(1) : null,
      });
    }

    // Score distributions
    const distributions = { turn: [0, 0, 0, 0, 0], service: [0, 0, 0, 0, 0], comm: [0, 0, 0, 0, 0] };
    fboResponses.forEach((r) => {
      distributions.turn[r.turnScore - 1]++;
      distributions.service[r.serviceScore - 1]++;
      distributions.comm[r.commScore - 1]++;
    });

    // Time of day buckets
    const timeBuckets = ['0600-0900', '0900-1200', '1200-1500', '1500-1800', '1800+'];
    const timeLabels = ['Early Morning', 'Morning', 'Midday', 'Afternoon', 'Evening'];
    const getTimeBucket = (h) => h < 9 ? 0 : h < 12 ? 1 : h < 15 ? 2 : h < 18 ? 3 : 4;
    const timeHeatmap = timeBuckets.map((_, bi) => {
      const bucket = fboResponses.filter((r) => getTimeBucket(r.hour) === bi);
      const c = bucket.length;
      return {
        label: timeLabels[bi],
        range: timeBuckets[bi],
        count: c,
        turnAvg: c ? +(bucket.reduce((s, r) => s + r.turnScore, 0) / c).toFixed(1) : null,
        serviceAvg: c ? +(bucket.reduce((s, r) => s + r.serviceScore, 0) / c).toFixed(1) : null,
        commAvg: c ? +(bucket.reduce((s, r) => s + r.commScore, 0) / c).toFixed(1) : null,
      };
    });

    // Day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayHeatmap = dayNames.map((name, di) => {
      const bucket = fboResponses.filter((r) => r.dayOfWeek === di);
      const c = bucket.length;
      return {
        label: name,
        count: c,
        turnAvg: c ? +(bucket.reduce((s, r) => s + r.turnScore, 0) / c).toFixed(1) : null,
        serviceAvg: c ? +(bucket.reduce((s, r) => s + r.serviceScore, 0) / c).toFixed(1) : null,
        commAvg: c ? +(bucket.reduce((s, r) => s + r.commScore, 0) / c).toFixed(1) : null,
      };
    });

    // Company breakdown
    const companyBreakdown = managementCompanies.map((co) => {
      const coResponses = fboResponses.filter((r) => r.companyId === co.id);
      const c = coResponses.length;
      return {
        id: co.id,
        name: co.name,
        visits: c,
        totalGallons: +coResponses.reduce((s, r) => s + (r.gallons || 0), 0).toFixed(0),
        avgTurn: c ? +(coResponses.reduce((s, r) => s + r.turnScore, 0) / c).toFixed(1) : null,
        avgService: c ? +(coResponses.reduce((s, r) => s + r.serviceScore, 0) / c).toFixed(1) : null,
        avgComm: c ? +(coResponses.reduce((s, r) => s + r.commScore, 0) / c).toFixed(1) : null,
        avgNps: c ? +(coResponses.reduce((s, r) => s + r.npsScore, 0) / c).toFixed(1) : null,
      };
    }).filter((c) => c.visits > 0);

    // Aircraft category breakdown
    const cats = ['LIGHT_JET', 'MIDSIZE_JET', 'SUPER_MIDSIZE', 'LARGE_CABIN', 'TURBOPROP', 'HELICOPTER'];
    const categoryBreakdown = cats.map((cat) => {
      const catResponses = fboResponses.filter((r) => r.aircraftCategory === cat);
      const c = catResponses.length;
      return {
        category: cat,
        label: categoryLabels[cat],
        visits: c,
        totalGallons: +catResponses.reduce((s, r) => s + (r.gallons || 0), 0).toFixed(0),
        avgTurn: c ? +(catResponses.reduce((s, r) => s + r.turnScore, 0) / c).toFixed(1) : null,
        avgService: c ? +(catResponses.reduce((s, r) => s + r.serviceScore, 0) / c).toFixed(1) : null,
        avgComm: c ? +(catResponses.reduce((s, r) => s + r.commScore, 0) / c).toFixed(1) : null,
      };
    }).filter((c) => c.visits > 0);

    // Comments split
    const positiveComments = fboResponses.filter((r) => r.commentText && r.avgScore >= 4.0).slice(0, 5);
    const criticalComments = fboResponses.filter((r) => r.commentText && r.avgScore < 3.0).slice(0, 5);

    // Response velocity
    const within1h = fboResponses.filter((r) => r.hoursToSubmit <= 1).length;
    const sameDay = fboResponses.filter((r) => r.hoursToSubmit > 1 && r.hoursToSubmit <= 12).length;
    const nextDay = fboResponses.filter((r) => r.hoursToSubmit > 12 && r.hoursToSubmit <= 36).length;
    const later = fboResponses.filter((r) => r.hoursToSubmit > 36).length;
    const velocity = {
      within1h: +((within1h / totalResponses) * 100).toFixed(1),
      sameDay: +((sameDay / totalResponses) * 100).toFixed(1),
      nextDay: +((nextDay / totalResponses) * 100).toFixed(1),
      later: +((later / totalResponses) * 100).toFixed(1),
    };

    // Flag metrics
    const allFlags = fboResponses.filter((r) => r.flagged);
    const resolvedFlags = allFlags.filter((r) => r.resolvedAt);
    const unresolvedFlags = allFlags.filter((r) => !r.resolvedAt);
    const avgResolveHours = resolvedFlags.length
      ? +(resolvedFlags.reduce((s, r) => s + (new Date(r.resolvedAt) - new Date(r.flaggedAt)) / 3600000, 0) / resolvedFlags.length).toFixed(1)
      : 0;
    const overdue48h = unresolvedFlags.filter((r) => {
      const hoursSinceFlag = (now - new Date(r.flaggedAt)) / 3600000;
      return hoursSinceFlag > 48;
    }).length;

    return {
      fbo,
      fboResponses,
      fboPurchases,
      allResponses: feedbackResponses,
      allPurchases: fuelPurchases,
      priceHistory,
      stats: { totalResponses, avgTurn, avgService, avgComm, avgNps, openFlags },
      nps: { ...npsPercent, trueNps },
      returnRates,
      benchmarks: {
        turn: { fbo: avgTurn, network: allAvgTurn, delta: +(avgTurn - allAvgTurn).toFixed(1) },
        service: { fbo: avgService, network: allAvgService, delta: +(avgService - allAvgService).toFixed(1) },
        comm: { fbo: avgComm, network: allAvgComm, delta: +(avgComm - allAvgComm).toFixed(1) },
      },
      weeklyTrends,
      distributions,
      timeHeatmap,
      dayHeatmap,
      companyBreakdown,
      categoryBreakdown,
      positiveComments,
      criticalComments,
      velocity,
      flagMetrics: {
        avgResolveHours,
        resolutionRate: allFlags.length ? +((resolvedFlags.length / allFlags.length) * 100).toFixed(0) : 100,
        overdue48h,
        totalFlags: allFlags.length,
        resolved: resolvedFlags.length,
        unresolved: unresolvedFlags.length,
      },
      unresolvedFlags,
      resolvedFlags,
    };
  }, [fboId]);
}
