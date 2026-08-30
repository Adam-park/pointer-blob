"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 로고를 누르면 보통 홈으로 돌아가지만, 홈 화면 자체에서는 그게 제자리 이동이라 의미가 없어서
// 홈에서만 예외적으로 "작가의 뽀모도로 타이머" 체험 페이지로 연결한다.
// 발견되기 어려우니, 실제 뽀모도로 타이머 제품처럼 P 원 안에 색칠된 파이 웨지를 두고
// 10초에 걸쳐 시계방향으로 줄어들게 한다 — 다 줄어들면 로고가 한 번 부르르 떨리며 사라진다.
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const logoHref = isHome ? "/pomodoro" : "/";
  const [dialVisible, setDialVisible] = useState(true);
  const [shaking, setShaking] = useState(false);
  const dialRef = useRef(null);

  useEffect(() => {
    if (!isHome) return;
    setDialVisible(true);
    setShaking(false);

    const DURATION = 10000;
    const start = performance.now();
    let raf;

    function tick(now) {
      const elapsed = now - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      dialRef.current?.style.setProperty("--progress", pct);
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        setShaking(true);
        setDialVisible(false);
        setTimeout(() => setShaking(false), 500);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isHome]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-wrap">
          {isHome && (
            <div
              ref={dialRef}
              className={`pomodoro-dial${dialVisible ? "" : " fade-out"}`}
              style={{ "--progress": 100 }}
              aria-hidden="true"
            />
          )}
          <Link
            href={logoHref}
            className={`logo-badge logo-badge--sm${shaking ? " shake" : ""}`}
            aria-label={isHome ? "뽀모도로 타이머 체험 신청" : "박무드"}
          >
            <span className="logo-letter">P</span>
          </Link>
        </div>
        <nav className="main-nav">
          <Link href="/work" className={pathname.startsWith("/work") ? "is-active" : ""} aria-current={pathname.startsWith("/work") ? "page" : undefined}>
            Work
          </Link>
          <Link href="/about" className={pathname === "/about" ? "is-active" : ""} aria-current={pathname === "/about" ? "page" : undefined}>
            About
          </Link>
          <Link href="/guestbook" className={pathname === "/guestbook" ? "is-active" : ""} aria-current={pathname === "/guestbook" ? "page" : undefined}>
            Guestbook
          </Link>
          <Link href="/contact" className={pathname === "/contact" ? "is-active" : ""} aria-current={pathname === "/contact" ? "page" : undefined}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
