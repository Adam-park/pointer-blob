import ContactForm from "../components/ContactForm";

export const metadata = { title: "Contact — 박무드" };

export default function ContactPage() {
  return (
    <>
      <section className="page-intro">
        <h1>Contact</h1>
        <p>채용 문의, 협업 제안, 프로젝트 견적 무엇이든 편하게 남겨주세요. 보통 1~2일 내로 답변드립니다.</p>
      </section>

      <section className="contact-grid">
        <div className="contact-info">
          <div className="info-row">
            <span className="info-label">Email</span>
            <a href="mailto:hello@example.com">hello@example.com</a>
          </div>
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span>010-1234-5678</span>
          </div>
          <div className="info-row">
            <span className="info-label">Location</span>
            <span>서울, 대한민국 · 원격 협업 가능</span>
          </div>
          <div className="info-row">
            <span className="info-label">Social</span>
            <div className="social-links">
              <a href="#">Instagram</a>
              <a href="#">Brunch</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="form-card">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
