import Shelf from "./components/Shelf";
import RecentGuestbook from "./components/RecentGuestbook";
import { siteConfig } from "./lib/siteConfig";

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
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <span>{siteConfig.phone}</span>
            <span>{siteConfig.location}</span>
          </div>
          <div className="cta-social">
            {siteConfig.social.map((s) => (
              <a key={s.label} href={s.href}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
