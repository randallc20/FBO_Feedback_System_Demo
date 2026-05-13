export const fbos = [
  { id: 'fbo-1', name: 'Jet Aviation', icaoCode: 'KDAL', airportName: 'Dallas Love Field', city: 'Dallas', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'CHAIN', chainName: 'Jet Aviation', currentRetailPPG: 7.25, partnerSince: '2025-09-15', agreementStatus: 'SIGNED', latitude: 32.847, longitude: -96.852 },
  { id: 'fbo-2', name: 'Atlantic Aviation', icaoCode: 'KHOU', airportName: 'William P. Hobby Airport', city: 'Houston', state: 'TX', fuelSupplier: 'Avfuel', ownershipType: 'CHAIN', chainName: 'Atlantic Aviation', currentRetailPPG: 7.10, partnerSince: '2025-11-01', agreementStatus: 'SIGNED', latitude: 29.6454, longitude: -95.2789 },
  { id: 'fbo-3', name: 'Galaxy FBO', icaoCode: 'KIAH', airportName: 'George Bush Intercontinental', city: 'Houston', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'INDEPENDENT', chainName: null, currentRetailPPG: 6.95, partnerSince: '2025-08-20', agreementStatus: 'SIGNED', latitude: 29.9902, longitude: -95.3368 },
  { id: 'fbo-4', name: 'Million Air', icaoCode: 'KSAT', airportName: 'San Antonio International', city: 'San Antonio', state: 'TX', fuelSupplier: 'Avfuel', ownershipType: 'CHAIN', chainName: 'Million Air', currentRetailPPG: 6.80, partnerSince: '2026-01-10', agreementStatus: 'SIGNED', latitude: 29.5337, longitude: -98.4698 },
  { id: 'fbo-5', name: 'Henriksen Jet Center', icaoCode: 'KDFW', airportName: 'Dallas/Fort Worth International', city: 'Fort Worth', state: 'TX', fuelSupplier: 'Shell Aviation', ownershipType: 'INDEPENDENT', chainName: null, currentRetailPPG: 7.40, partnerSince: '2025-10-05', agreementStatus: 'SIGNED', latitude: 32.8998, longitude: -97.0403 },
  { id: 'fbo-6', name: 'Signature Flight Support', icaoCode: 'KAUS', airportName: 'Austin-Bergstrom International', city: 'Austin', state: 'TX', fuelSupplier: 'World Fuel Services', ownershipType: 'PE_BACKED', chainName: 'Signature Aviation', currentRetailPPG: 7.15, partnerSince: '2025-12-01', agreementStatus: 'SIGNED', latitude: 30.1975, longitude: -97.6664 },
];

export const pricingTiers = fbos.map((fbo) => {
  const tier1 = +(fbo.currentRetailPPG - 0.50).toFixed(2);
  return {
    fboId: fbo.id,
    tiers: [
      { name: 'Tier 1', min: 0, max: 50000, ppg: tier1 },
      { name: 'Tier 2', min: 50001, max: 125000, ppg: +(tier1 - 0.10).toFixed(2) },
      { name: 'Tier 3', min: 125001, max: 225000, ppg: +(tier1 - 0.18).toFixed(2) },
      { name: 'Tier 4', min: 225001, max: 300000, ppg: +(tier1 - 0.25).toFixed(2) },
      { name: 'Tier 5', min: 300001, max: 999999, ppg: +(tier1 - 0.30).toFixed(2) },
    ],
  };
});
