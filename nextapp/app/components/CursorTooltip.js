// 커서를 따라다니는 안내판의 고정 마크업. RootLayout에 한 번만 렌더되고,
// useWorkTooltip 훅이 #cursor-tooltip을 직접 찾아 조작한다.
export default function CursorTooltip() {
  return (
    <div id="cursor-tooltip" className="cursor-tooltip" aria-hidden="true">
      <div className="tooltip-card">
        <span className="tooltip-date"></span>
        <span className="tooltip-desc"></span>
      </div>
    </div>
  );
}
