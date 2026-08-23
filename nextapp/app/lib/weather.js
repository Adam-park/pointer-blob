// 서울 실시간 날씨 — Open-Meteo API (키/가입 불필요)
const SEOUL = { latitude: 37.5665, longitude: 126.978 };

// WMO 날씨 코드를 한글 라벨로 단순화
function labelForCode(code) {
  if (code === 0) return "맑음";
  if (code === 1 || code === 2) return "구름 조금";
  if (code === 3) return "흐림";
  if (code === 45 || code === 48) return "안개";
  if (code >= 51 && code <= 57) return "이슬비";
  if (code >= 61 && code <= 67) return "비";
  if (code >= 71 && code <= 77) return "눈";
  if (code >= 80 && code <= 82) return "소나기";
  if (code >= 85 && code <= 86) return "눈";
  if (code >= 95) return "뇌우";
  return "흐림";
}

// 실패해도 상세페이지 전체가 깨지면 안 되므로, 실패 시 null을 돌려주고 호출부에서 조용히 숨긴다
export async function getSeoulWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${SEOUL.latitude}&longitude=${SEOUL.longitude}&current=temperature_2m,weather_code&timezone=Asia%2FSeoul`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    if (temp == null || code == null) return null;
    return { tempC: Math.round(temp), condition: labelForCode(code) };
  } catch {
    return null;
  }
}
