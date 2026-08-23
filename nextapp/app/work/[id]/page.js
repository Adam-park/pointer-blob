import { notFound } from "next/navigation";
import { works, catLabel, colorFor } from "../../lib/data";
import BackButton from "../../components/BackButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = works[Number(id)];
  return { title: item ? `${item.title} — 박무드` : "Work — 박무드" };
}

export default async function WorkDetailPage({ params }) {
  const { id } = await params;
  const item = works[Number(id)];

  if (!item) notFound();

  return (
    <section className="detail-section">
      <BackButton />
      <div className="thumb-frame detail-thumb-frame">
        <div className="thumb" data-color={colorFor(item)} />
      </div>
      <div className="detail-body">
        <p className="detail-cat">
          {catLabel[item.cat]} · {item.date}
        </p>
        <h1>{item.title}</h1>
        <p className="detail-desc">{item.desc}</p>
      </div>
    </section>
  );
}
