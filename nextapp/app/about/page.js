export const metadata = { title: "About — 박무드" };

export default function AboutPage() {
  return (
    <>
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">P</div>
        <div className="profile-info">
          <h1>박무드</h1>
          <p className="profile-role">작가 · 에세이스트</p>
          <p className="profile-bio">
            일상의 사소한 순간을 오래 들여다보고 글로 옮기는 걸 좋아하는 8년차 작가입니다.
            에세이와 짧은 소설, 매체 연재 칼럼을 오가며 씁니다. 화려한 사건보다는 사람과 사람
            사이에 남는 자국에 관심이 많습니다. 서울 기반, 원고 청탁·강연 문의 환영합니다.
          </p>
          <a href="#" className="btn btn-secondary" title="데모 화면이라 실제 파일은 연결되어 있지 않습니다">
            이력서 다운로드
          </a>
        </div>
      </section>

      <section className="about-block">
        <h2>Skills &amp; Tools</h2>
        <ul className="tag-list">
          <li>장편소설</li>
          <li>에세이</li>
          <li>칼럼 연재</li>
          <li>인터뷰 라이팅</li>
          <li>브런치스토리</li>
          <li>스크리브너</li>
          <li>초고 퇴고</li>
          <li>낭독회 진행</li>
        </ul>
      </section>

      <section className="about-block">
        <h2>Experience</h2>
        <ol className="timeline">
          <li className="timeline-item">
            <span className="timeline-period">2023 — 현재</span>
            <div className="timeline-body">
              <h3>프리랜스 작가</h3>
              <p>에세이집 집필과 매체 칼럼 연재, 브런치스토리 연재를 병행하며 활동.</p>
            </div>
          </li>
          <li className="timeline-item">
            <span className="timeline-period">2020 — 2023</span>
            <div className="timeline-body">
              <h3>계간 문예지 「필담」 · 편집부 필진</h3>
              <p>인터뷰 기사와 에세이 코너를 담당, 매 호 고정 지면 연재.</p>
            </div>
          </li>
          <li className="timeline-item">
            <span className="timeline-period">2018 — 2020</span>
            <div className="timeline-body">
              <h3>신인문학상 등단 · 단편소설 발표</h3>
              <p>지역 문예지 신인상으로 등단, 단편소설 세 편 발표.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="about-block">
        <h2>Education</h2>
        <p className="edu-line">OO대학교 국어국문학과 졸업 (2014 — 2018)</p>
      </section>
    </>
  );
}
