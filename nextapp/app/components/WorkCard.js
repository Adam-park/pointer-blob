"use client";
import { useState } from "react";
import { sizeFor, colorFor } from "../lib/data";
import { pixelVariantFor, randomPixelVariant } from "../lib/pixelPalette";
import PixelReveal from "./PixelReveal";

// data.js의 createWorkCard()와 동일한 마크업 — className/dataset 값이 globals.css 선택자와 1:1로 대응한다.
// 커서를 올리면(또는 키보드 포커스) 제목 아래로 간략한 설명(work-desc)이 펼쳐지고,
// 썸네일 위로는 반짝이는 픽셀 격자(PixelReveal)가 함께 나타난다. 어떤 등장 방향·색을 쓸지는
// 호버/포커스가 들어올 때마다 randomPixelVariant로 새로 뽑아서, 같은 카드도 올릴 때마다 달라진다.
export default function WorkCard({ work, id }) {
  const [active, setActive] = useState(false);
  const [pixelVariant, setPixelVariant] = useState(() => pixelVariantFor(id));

  function activate() {
    setPixelVariant(randomPixelVariant());
    setActive(true);
  }

  return (
    <article
      className="work-item"
      data-id={id}
      data-cat={work.cat}
      tabIndex={0}
      onMouseEnter={activate}
      onMouseLeave={() => setActive(false)}
      onFocus={activate}
      onBlur={() => setActive(false)}
    >
      <div className="thumb-frame" data-size={sizeFor(work)}>
        <div className="thumb" data-cat={work.cat} data-color={colorFor(work)} />
        <PixelReveal active={active} {...pixelVariant} />
      </div>
      <p className="static-caption">{work.title}</p>
      <p className="work-desc" style={{ "--desc-len": work.desc.length }}>
        {work.desc}
      </p>
    </article>
  );
}
