
import { SignalMapping } from './types';

/**
 * 8 Directions (Clockwise starting from Bottom/South)
 * 0: South (6 o'clock)
 * 1: South-West (7:30)
 * 2: West (9 o'clock)
 * 3: North-West (10:30)
 * 4: North (12 o'clock)
 * 5: North-East (1:30)
 * 6: East (3 o'clock)
 * 7: South-East (4:30)
 */

export const SEMAPHORE_MAP: SignalMapping[] = [
  { char: 'A', left: 0, right: 1 },
  { char: 'B', left: 0, right: 2 },
  { char: 'C', left: 0, right: 3 },
  { char: 'D', left: 0, right: 4 },
  { char: 'E', left: 5, right: 0 },
  { char: 'F', left: 6, right: 0 },
  { char: 'G', left: 7, right: 0 },
  { char: 'H', left: 1, right: 2 },
  { char: 'I', left: 1, right: 3 },
  { char: 'J', left: 6, right: 4 },
  { char: 'K', left: 1, right: 4 },
  { char: 'L', left: 1, right: 5 },
  { char: 'M', left: 1, right: 6 },
  { char: 'N', left: 1, right: 7 },
  { char: 'O', left: 2, right: 3 },
  { char: 'P', left: 2, right: 4 },
  { char: 'Q', left: 2, right: 5 },
  { char: 'R', left: 2, right: 6 },
  { char: 'S', left: 2, right: 7 },
  { char: 'T', left: 3, right: 4 },
  { char: 'U', left: 3, right: 5 },
  { char: 'V', left: 6, right: 5 }, 
  { char: 'W', left: 5, right: 6 },
  { char: 'X', left: 5, right: 7 },
  { char: 'Y', left: 3, right: 6 },
  { char: 'Z', left: 3, right: 7 },
  { char: ' ', left: 0, right: 0 }, // Rest position
  { char: '#', left: 4, right: 5 }, // Numeric Indicator
  // Digits mapping to A-J/K
  { char: '1', left: 0, right: 1 }, // A
  { char: '2', left: 0, right: 2 }, // B
  { char: '3', left: 0, right: 3 }, // C
  { char: '4', left: 0, right: 4 }, // D
  { char: '5', left: 5, right: 0 }, // E
  { char: '6', left: 6, right: 0 }, // F
  { char: '7', left: 7, right: 0 }, // G
  { char: '8', left: 1, right: 2 }, // H
  { char: '9', left: 1, right: 3 }, // I
  { char: '0', left: 1, right: 4 }, // K
];

export const GET_CHAR_MAPPING = (char: string | undefined) => {
  if (!char) return SEMAPHORE_MAP[SEMAPHORE_MAP.length - 1];
  const normalized = char.toUpperCase();
  return SEMAPHORE_MAP.find(m => m.char === normalized) || SEMAPHORE_MAP[SEMAPHORE_MAP.length - 1];
};

export const SAMPLE_WORDS = [
  "EXECUTE", "COASTAL", "SURVEILLANCE", "DRILL", "REDEPLOYMENT", "SECTOR", "ALPHA", "BRAVO", "CHARLIE", "DELTA",
  "MAINTENANCE", "SIGNAL", "EQUIPMENT", "PROCEED", "RENDEZVOUS", "RADIO", "SILENCE", "WEATHER", "ANOMALY",
  "PATROL", "EMERGENCY", "EVACUATION", "POSITION", "LATITUDE", "LONGITUDE", "BEARING", "DISTANCE", "TARGET",
  "NEUTRALIZE", "IDENTIFIED", "VESSEL", "CARRIER", "FRIGATE", "DESTROYER", "SUBMARINE", "BATTLESHIP", "AMPHIBIOUS",
  "OPERATION", "OVERWATCH", "SECURITY", "PROTOCOL", "ZULU", "TANGO", "SIERRA", "WHISKEY", "KILO", "FOXTROT"
];

export const SAMPLE_NAVAL_PHRASES = [
  "UNIT 5 READY",
  "BASE 7 CLEAR",
  "SECTOR 3 PATROL",
  "SHIP 21 ARRIVING",
  "EXECUTE JOINT COASTAL SURVEILLANCE DRILL",
  "IMMEDIATE REDEPLOYMENT TO SECTOR ALPHA 101",
  "COMMENCE MAINTENANCE CHECKS ON SIGNAL EQUIPMENT 45",
  "PROCEED TO RENDEZVOUS POINT CHARLIE 789",
  "MAINTAIN RADIO SILENCE UNTIL FURTHER ORDERS 00",
  "WEATHER ANOMALY REPORTED OVER PATROL ROUTE 12",
  "EMERGENCY EVACUATION DRILL BEGINS AT 0800 HOURS"
];
