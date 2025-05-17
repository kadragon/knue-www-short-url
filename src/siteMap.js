// siteMap.js

export const siteMap = {
  www: 1,
  job: 2,
  // 필요한 사이트 추가
};

export const siteMapReverse = Object.fromEntries(
  Object.entries(siteMap).map(([k, v]) => [v, k])
);
