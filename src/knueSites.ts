// Site mapping for KNUE bulletin board system
// Maps site names to numeric identifiers for encoding/decoding

export const siteMap: Record<string, number> = {
  www: 1,
  grad: 2,
  edupol: 3,
  kfund: 4,
  eng: 5,
  education: 6,
  ece: 7,
  sped: 8,
  korean: 9,
  german: 10,
  french: 11,
  history: 12,
  english: 13,
  social: 14,
  chinese: 15,
  geography: 16,
  homeedu: 17,
  techedu: 18,
  phys: 19,
  bioedu: 20,
  math: 21,
  earth: 22,
  comedu: 23,
  chemedu: 24,
  envi: 25,
  artedu: 26,
  music: 27,
  phy: 28,
  ethics: 29,
  pr: 30,
  ipsi: 31,
  idea: 32,
};

// Reverse map: numeric IDs back to site names
export const siteMapReverse: Record<number, string> = Object.fromEntries(
  Object.entries(siteMap).map(([k, v]) => [v, k])
);
