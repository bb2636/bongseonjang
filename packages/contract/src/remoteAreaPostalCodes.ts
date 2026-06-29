// 출처: 공개 도서산간 기준표(campaignus 기준표, sir.kr 영카트 자료) 기반 표준 시드 목록.
// 도서산간 기준은 택배사마다 다를 수 있으므로, 실제 계약 택배사 목록으로 교체/보정 가능.
export interface RemoteAreaPostalRange {
  start: number;
  end: number;
  label: string;
}

export const JEJU_POSTAL_RANGE: RemoteAreaPostalRange = {
  start: 63000,
  end: 63644,
  label: '제주 전지역',
};

export const ISLAND_POSTAL_RANGES: RemoteAreaPostalRange[] = [
  { start: 22386, end: 22388, label: '인천 중구 섬지역' },
  { start: 23004, end: 23010, label: '인천 강화 섬지역' },
  { start: 23100, end: 23116, label: '인천 옹진 섬지역1' },
  { start: 23124, end: 23136, label: '인천 옹진 섬지역2' },
  { start: 31708, end: 31708, label: '충남 당진 섬지역' },
  { start: 32133, end: 32133, label: '충남 태안 섬지역' },
  { start: 33411, end: 33411, label: '충남 보령 섬지역' },
  { start: 40200, end: 40240, label: '경북 울릉도 전지역' },
  { start: 46768, end: 46771, label: '부산 강서구 섬지역' },
  { start: 52570, end: 52571, label: '경남 사천 섬지역' },
  { start: 53031, end: 53033, label: '경남 통영 섬지역1' },
  { start: 53089, end: 53104, label: '경남 통영 섬지역2' },
  { start: 54000, end: 54000, label: '경남 통영 섬지역3' },
  { start: 56347, end: 56349, label: '전북 부안 섬지역' },
  { start: 57068, end: 57069, label: '전남 영광 섬지역' },
  { start: 58760, end: 58762, label: '전남 목포 섬지역' },
  { start: 58800, end: 58810, label: '전남 신안 섬지역1' },
  { start: 58816, end: 58818, label: '전남 신안 섬지역2' },
  { start: 58826, end: 58826, label: '전남 신안 섬지역3' },
  { start: 58828, end: 58866, label: '전남 신안 섬지역4' },
  { start: 58953, end: 58958, label: '전남 진도 섬지역' },
  { start: 59102, end: 59103, label: '전남 완도 섬지역1' },
  { start: 59106, end: 59106, label: '전남 완도 섬지역2' },
  { start: 59127, end: 59127, label: '전남 완도 섬지역3' },
  { start: 59129, end: 59129, label: '전남 완도 섬지역4' },
  { start: 59137, end: 59166, label: '전남 완도 섬지역5' },
  { start: 59421, end: 59421, label: '전남 보성 섬지역' },
  { start: 59531, end: 59531, label: '전남 고흥 섬지역1' },
  { start: 59551, end: 59551, label: '전남 고흥 섬지역2' },
  { start: 59563, end: 59563, label: '전남 고흥 섬지역3' },
  { start: 59568, end: 59568, label: '전남 고흥 섬지역4' },
  { start: 59650, end: 59650, label: '전남 여수 섬지역1' },
  { start: 59766, end: 59766, label: '전남 여수 섬지역2' },
  { start: 59781, end: 59790, label: '전남 여수 섬지역3' },
];

export function isPostalCodeInRange(postalCode: number, range: RemoteAreaPostalRange): boolean {
  return postalCode >= range.start && postalCode <= range.end;
}
