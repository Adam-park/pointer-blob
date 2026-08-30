import { getSql } from "../lib/db";
import { works } from "../lib/data";
import GuestbookList from "../components/GuestbookList";

export const dynamic = "force-dynamic"; // 항상 최신 목록

export const metadata = { title: "방명록 — 박무드" };

export default async function GuestbookPage() {
  let entries = [];
  try {
    const sql = getSql();
    const rows = await sql`
      select id, nickname, message, work_id, created_at
      from guestbook_entries
      where hidden = false
      order by created_at desc
      limit 50
    `;
    entries = rows.map((e) => ({
      id: e.id,
      nickname: e.nickname,
      message: e.message,
      work_id: e.work_id,
      created_at: e.created_at.toISOString(),
    }));
  } catch (err) {
    console.error("[guestbook page]", err);
  }

  const workTitles = works.map((w) => ({ title: w.title }));

  return (
    <section className="guestbook-page">
      <h1>방명록</h1>
      <p className="guestbook-sub">읽고 떠오른 한 줄을 남겨주세요.</p>
      <GuestbookList initial={entries} works={workTitles} />
    </section>
  );
}
