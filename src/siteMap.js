// siteMap.js

export const siteMap = {
  www: 1,
  job: 2, // 기존에 있던 값
  grad: 3,
  edupol: 4,
  kfund: 5,
  eng: 6,
  education: 7,
  ece: 8,
  sped: 9,
  korean: 10,
  german: 11,
  french: 12,
  history: 13,
  english: 14,
  social: 15,
  chinese: 16,
  geography: 17,
  homeedu: 18,
  techedu: 19,
  phys: 20,
  bioedu: 21,
  math: 22,
  earth: 23,
  comedu: 24,
  chemedu: 25,
  envi: 26,
  artedu: 27,
  music: 28,
  phy: 29,
  ethics: 30,
  pr: 31,
  ipsi: 32,
  idea: 33,
};

export const siteMapReverse = Object.fromEntries(
  Object.entries(siteMap).map(([k, v]) => [v, k])
);