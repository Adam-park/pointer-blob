import { effectFor, sizeFor, colorFor } from "../lib/data";

// data.js의 createWorkCard()와 동일한 마크업 — className/dataset 값이 globals.css 선택자와 1:1로 대응한다
export default function WorkCard({ work, id }) {
  return (
    <article
      className="work-item"
      data-id={id}
      data-cat={work.cat}
      data-date={work.date}
      data-desc={work.desc}
      data-effect={effectFor(work)}
      tabIndex={0}
    >
      <div className="thumb-frame" data-size={sizeFor(work)}>
        <div className="thumb" data-cat={work.cat} data-color={colorFor(work)} />
      </div>
      <p className="static-caption">{work.title}</p>
    </article>
  );
}
