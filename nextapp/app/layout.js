import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CursorTooltip from "./components/CursorTooltip";

export const metadata = {
  title: "박무드 — Portfolio",
  description: "작가 박무드의 포트폴리오",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <CursorTooltip />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
