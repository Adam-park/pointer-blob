import WorkGrid from "../components/WorkGrid";

export const metadata = { title: "Work — 박무드" };

export default function WorkPage() {
  return (
    <>
      <section className="page-intro">
        <h1>Work</h1>
      </section>
      <section className="work-section">
        <WorkGrid />
      </section>
    </>
  );
}
