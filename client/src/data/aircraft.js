export const aircraft = [
  { id: 'ac-1', tailNumber: 'N401HA', make: 'Embraer', model: 'Phenom 300E', category: 'LIGHT_JET', avgFuelBurnPerHour: 130, companyId: 'mc-1' },
  { id: 'ac-2', tailNumber: 'N502HA', make: 'Cessna', model: 'Citation Latitude', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 200, companyId: 'mc-1' },
  { id: 'ac-3', tailNumber: 'N603HA', make: 'Gulfstream', model: 'G280', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 250, companyId: 'mc-1' },
  { id: 'ac-4', tailNumber: 'N210JA', make: 'Bombardier', model: 'Challenger 350', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 260, companyId: 'mc-2' },
  { id: 'ac-5', tailNumber: 'N311JA', make: 'Embraer', model: 'Phenom 100EV', category: 'LIGHT_JET', avgFuelBurnPerHour: 100, companyId: 'mc-2' },
  { id: 'ac-6', tailNumber: 'N412JA', make: 'Dassault', model: 'Falcon 2000LXS', category: 'LARGE_CABIN', avgFuelBurnPerHour: 280, companyId: 'mc-2' },
  { id: 'ac-7', tailNumber: 'N700KS', make: 'Gulfstream', model: 'G600', category: 'LARGE_CABIN', avgFuelBurnPerHour: 340, companyId: 'mc-3' },
  { id: 'ac-8', tailNumber: 'N801KS', make: 'Cessna', model: 'Citation CJ4', category: 'LIGHT_JET', avgFuelBurnPerHour: 150, companyId: 'mc-3' },
  { id: 'ac-9', tailNumber: 'N902KS', make: 'Pilatus', model: 'PC-12 NGX', category: 'TURBOPROP', avgFuelBurnPerHour: 70, companyId: 'mc-3' },
  { id: 'ac-10', tailNumber: 'N150JD', make: 'Bombardier', model: 'Global 7500', category: 'LARGE_CABIN', avgFuelBurnPerHour: 400, companyId: 'mc-4' },
  { id: 'ac-11', tailNumber: 'N251JD', make: 'Embraer', model: 'Praetor 600', category: 'SUPER_MIDSIZE', avgFuelBurnPerHour: 270, companyId: 'mc-4' },
  { id: 'ac-12', tailNumber: 'N352JD', make: 'Cessna', model: 'Citation XLS+', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 185, companyId: 'mc-4' },
  { id: 'ac-13', tailNumber: 'N440KR', make: 'Gulfstream', model: 'G500', category: 'LARGE_CABIN', avgFuelBurnPerHour: 310, companyId: 'mc-5' },
  { id: 'ac-14', tailNumber: 'N541KR', make: 'Beechcraft', model: 'King Air 350i', category: 'TURBOPROP', avgFuelBurnPerHour: 85, companyId: 'mc-5' },
  { id: 'ac-15', tailNumber: 'N642KR', make: 'Hawker', model: '900XP', category: 'MIDSIZE_JET', avgFuelBurnPerHour: 220, companyId: 'mc-5' },
  { id: 'ac-16', tailNumber: 'N100BA', make: 'Dassault', model: 'Falcon 900LX', category: 'LARGE_CABIN', avgFuelBurnPerHour: 290, companyId: 'mc-6' },
  { id: 'ac-17', tailNumber: 'N201BA', make: 'Embraer', model: 'Phenom 300E', category: 'LIGHT_JET', avgFuelBurnPerHour: 130, companyId: 'mc-6' },
  { id: 'ac-18', tailNumber: 'N302BA', make: 'Bell', model: '407GXi', category: 'HELICOPTER', avgFuelBurnPerHour: 55, companyId: 'mc-6' },
];

export const categoryLabels = {
  LIGHT_JET: 'Light Jet',
  MIDSIZE_JET: 'Midsize Jet',
  SUPER_MIDSIZE: 'Super Midsize',
  LARGE_CABIN: 'Large Cabin',
  TURBOPROP: 'Turboprop',
  HELICOPTER: 'Helicopter',
};
