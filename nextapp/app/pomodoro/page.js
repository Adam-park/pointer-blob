import PomodoroForm from "../components/PomodoroForm";

export const metadata = { title: "뽀모도로 타이머 무료체험 — 박무드" };

export default function PomodoroPage() {
  return (
    <>
      <section className="page-intro">
        <h1>작가의 뽀모도로 타이머</h1>
        <p>
          25분 몰입하면 울리는 벨, 그리고 5분의 산책 시간. 마감 앞에서 자꾸 흐트러지는
          집중력을 대신 붙잡아주는, 글 쓰는 사람을 위한 타이머예요.
          무료 체험을 신청하면 안내 메일을 보내드려요.
        </p>
      </section>

      <section className="contact-grid">
        <div className="contact-info">
          <div className="info-row">
            <span className="info-label">이런 분께</span>
            <span>마감이 있는 모든 글 쓰는 사람</span>
          </div>
          <div className="info-row">
            <span className="info-label">체험 기간</span>
            <span>14일 무료</span>
          </div>
          <div className="info-row">
            <span className="info-label">문의</span>
            <a href="/contact">Contact 페이지로</a>
          </div>
        </div>

        <div className="form-card">
          <PomodoroForm />
        </div>
      </section>
    </>
  );
}
