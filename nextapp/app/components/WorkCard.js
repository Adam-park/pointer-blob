import { sizeFor, colorFor } from "../lib/data";
import ParticleImage from "./ParticleImage";
import { SHAPE_BY_ID } from "../lib/particleShapes";

// data.js의 createWorkCard()와 동일한 마크업 — className/dataset 값이 globals.css 선택자와 1:1로 대응한다.
// 커서를 올리면(또는 키보드 포커스) 제목 아래로 간략한 설명(work-desc)이 펼쳐진다.
// 썸네일 위에는 점들이 별무리처럼 떠다니다가(ParticleImage), 커서를 올리면 그 작업의 주제를
// 상징하는 도형(SHAPE_BY_ID[id])으로 모여든다. 도형 목록은 lib/particleShapes.js에 모여 있다.
export default function WorkCard({ work, id }) {
  const shape = SHAPE_BY_ID[id];

  return (
    <article className="work-item" data-id={id} data-cat={work.cat} tabIndex={0}>
      <div className="thumb-frame" data-size={sizeFor(work)}>
        <div className="thumb" data-cat={work.cat} data-color={colorFor(work)} />
        {shape && <ParticleImage image={shape} />}
      </div>
      <p className="static-caption">{work.title}</p>
      <p className="work-desc" style={{ "--desc-len": work.desc.length }}>
        {work.desc}
      </p>
    </article>
  );
}
