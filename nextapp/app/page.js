import Shelf from "./components/Shelf";
import RecentGuestbook from "./components/RecentGuestbook";

export default function HomePage() {
  return (
    <>
      <Shelf />

      <RecentGuestbook />

      <section className="cta-section">
        <a href="/contact" className="cta-title">
          Contact<span className="cta-arrow">→</span>
        </a>
        <div className="cta-meta">
          <div className="cta-info">
            <a href="mailto:hello@example.com">hello@example.com</a>
            <span>010-1234-5678</span>
            <span>서울, 대한민국</span>
          </div>
          <div className="cta-social">
            <a href="#">Instagram</a>
            <a href="#">Brunch</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </section>
    </>
  );
}
