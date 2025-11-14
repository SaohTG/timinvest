// Mapping ISIN → Symbole boursier
// ISIN format: 2 lettres pays + 10 caractères alphanumériques

export const ISIN_TO_SYMBOL: Record<string, string> = {
  // Actions américaines
  'US0378331005': 'AAPL',      // Apple
  'US5949181045': 'MSFT',      // Microsoft
  'US02079K3059': 'GOOGL',     // Alphabet
  'US0231351067': 'AMZN',      // Amazon
  'US88160R1014': 'TSLA',      // Tesla
  'US30303M1027': 'META',      // Meta
  'US67066G1040': 'NVDA',      // NVIDIA
  'US0846707026': 'BAC',       // Bank of America
  'US46625H1005': 'JPM',       // JPMorgan
  'US91324P1021': 'WMT',       // Walmart
  'US92826C8394': 'V',         // Visa
  'US57636Q1040': 'MA',        // Mastercard
  'US4592001014': 'INTC',      // Intel
  'US0010841023': 'AMD',       // AMD
  'US64110L1061': 'NFLX',      // Netflix
  'US2546871060': 'DIS',       // Disney
  'US1912161007': 'KO',        // Coca-Cola
  'US30231G1022': 'XOM',       // ExxonMobil (Esso)
  'US1667641005': 'CVX',       // Chevron
  'US4781601046': 'JNJ',       // Johnson & Johnson
  'US7170811035': 'PFE',       // Pfizer
  'US7427181091': 'PG',        // Procter & Gamble
  
  // Actions françaises (Euronext Paris)
  'FR0000121014': 'MC.PA',     // LVMH
  'FR0000120321': 'OR.PA',     // L'Oréal
  'FR0000120578': 'SAN.PA',    // Sanofi
  'FR0000120271': 'TTE.PA',    // TotalEnergies
  'FR0000131104': 'BNP.PA',    // BNP Paribas
  'NL0000235190': 'AIR.PA',    // Airbus
  'FR0000121972': 'SU.PA',     // Schneider Electric
  'FR0000045072': 'ACA.PA',    // Crédit Agricole
  'FR0000120628': 'CS.PA',     // AXA
  'FR0000125338': 'CAP.PA',    // Capgemini
  'FR0000125486': 'DG.PA',     // Vinci
  'FR0000120693': 'RI.PA',     // Pernod Ricard
  'FR0000073272': 'SAF.PA',    // Safran
  'FR0014003TT8': 'DSY.PA',    // Dassault Systèmes
  'FR0000121667': 'EL.PA',     // EssilorLuxottica
  'FR0000133308': 'ORA.PA',    // Orange
  'FR0000120503': 'EN.PA',     // Bouygues
  'FR0000125007': 'SGO.PA',    // Saint-Gobain
  'FR0000052292': 'RMS.PA',    // Hermès
  'FR0000121485': 'KER.PA',    // Kering
  'FR0000130577': 'PUB.PA',    // Publicis
  'NL0000226223': 'STM.PA',    // STMicroelectronics
  'FR0000121261': 'ML.PA',     // Michelin
  'FR0000124141': 'VIE.PA',    // Veolia
  'FR0010307819': 'DEC.PA',    // Legrand
  
  // Actions espagnoles (BME Madrid)
  'ES0113900J37': 'SAN.MC',    // Banco Santander
  'ES0113211835': 'BBVA.MC',   // BBVA
  'ES0178430E18': 'TEF.MC',    // Telefónica
  'ES0148396007': 'ITX.MC',    // Inditex
  'ES0144580Y14': 'IBE.MC',    // Iberdrola
  'ES0173516115': 'REP.MC',    // Repsol
  
  // Actions allemandes (Xetra)
  'DE0007164600': 'SAP.DE',    // SAP
  'DE0007236101': 'SIE.DE',    // Siemens
  'DE0005190003': 'BMW.DE',    // BMW
  'DE0005140008': 'DBK.DE',    // Deutsche Bank
  'DE0005785604': 'FME.DE',    // Fresenius Medical Care
  
  // Actions britanniques (London)
  'GB0007980591': 'BP.L',      // BP
  'GB0005405286': 'HSBC.L',    // HSBC
  'GB00BP6MXD84': 'SHEL.L',    // Shell
  'GB00B10RZP78': 'ULVR.L',    // Unilever
  
  // Actions italiennes (Milan)
  'IT0003132476': 'ENI.MI',    // ENI
  'NL0011585146': 'RACE.MI',   // Ferrari
  'IT0000072618': 'ISP.MI',    // Intesa Sanpaolo
  
  // Actions suisses (SIX)
  'CH0038863350': 'NESN.SW',   // Nestlé
  'CH0012032048': 'ROG.SW',    // Roche
  'CH0012005267': 'NOVN.SW',   // Novartis
};

// Fonction pour vérifier si une chaîne est un ISIN valide
export function isValidISIN(code: string): boolean {
  // Format ISIN : 2 lettres + 10 caractères alphanumériques
  const isinRegex = /^[A-Z]{2}[A-Z0-9]{10}$/;
  return isinRegex.test(code.toUpperCase());
}

// Fonction pour convertir un ISIN en symbole
export function isinToSymbol(isin: string): string | null {
  const upperISIN = isin.toUpperCase().trim();
  return ISIN_TO_SYMBOL[upperISIN] || null;
}

// Fonction pour obtenir le pays depuis l'ISIN
export function getCountryFromISIN(isin: string): string {
  const countryCode = isin.substring(0, 2).toUpperCase();
  const countries: Record<string, string> = {
    'US': '🇺🇸 États-Unis',
    'FR': '🇫🇷 France',
    'ES': '🇪🇸 Espagne',
    'DE': '🇩🇪 Allemagne',
    'GB': '🇬🇧 Royaume-Uni',
    'IT': '🇮🇹 Italie',
    'CH': '🇨🇭 Suisse',
    'NL': '🇳🇱 Pays-Bas',
  };
  return countries[countryCode] || countryCode;
}

