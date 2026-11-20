/* ================= 図を出すしくみ（フェーズ5・数学の図形・グラフ・データ）=================
   問題に fig: { type, ... } を持たせると、バトル画面の問題文の上に図（SVG）を出す。fig が無ければ何も出さない。
   ・sector  … おうぎ形   { r, deg }            半径 r cm・中心角 deg°
   ・circle  … 円         { r }
   ・coord   … 座標とグラフ { kind: "line" | "hyper" | "none", a, pts: [[x, y, "A"], ...] }
   ・bars    … ヒストグラム { edges: [0,10,20,...], counts: [..], unit: "点" }
   ・solid   … 立体の見取図 { kind: "cuboid" | "cube" | "prism3" | "cylinder" | "cone" | "pyramid" | "sphere", labels: {...} }
   ※図は「目安」。長さの比はおおよそでよく、数値はラベルで示す（図の長さで答えを読ませない）。 */
function Figure({ fig }) {
  if (!fig) return null;
  const W = 240, H = 170;
  const stroke = C.aqua, txt = C.ink, sub = C.inkDim, fill = "rgba(110,231,224,.14)";
  const label = (x, y, s, o = {}) => (
    <text key={o.key} x={x} y={y} fill={o.color || txt} fontSize={o.size || 13} fontWeight="800" textAnchor={o.anchor || "middle"}
      dominantBaseline="middle" stroke={C.bg0} strokeWidth="4" strokeLinejoin="round" paintOrder="stroke"
      style={{ fontFamily: "inherit" }}>{s}</text>
  );
  let body = null;

  if (fig.type === "sector" || fig.type === "circle") {
    const cx = W / 2, cy = H / 2 + 6, R = 62;
    if (fig.type === "circle") {
      body = (<>
        <circle cx={cx} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth="3" />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.gold} strokeWidth="3" />
        <circle cx={cx} cy={cy} r="3" fill={txt} />
        {label(cx + R / 2, cy - 12, `${fig.r}cm`, { color: C.gold })}
      </>);
    } else {
      const deg = fig.deg, rad = (a) => (a - 90) * Math.PI / 180; // 上向きから時計回り
      const a0 = -deg / 2, a1 = deg / 2;
      const p = (a) => [cx + R * Math.cos(rad(a)), cy + R * Math.sin(rad(a))];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      const large = deg > 180 ? 1 : 0;
      // 半径のラベルは、右側の半径の中点から外向き（図の外側）にずらす。中心角は図の内側に小さな弧で示す
      const nx = Math.cos(rad(a1 + 90)), ny = Math.sin(rad(a1 + 90));
      const q = (a, rr) => [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))];
      const [s0x, s0y] = q(a0, 14), [s1x, s1y] = q(a1, 14), [dx, dy] = q(0, 30);
      body = (<>
        <path d={`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`} fill={fill} stroke={stroke} strokeWidth="3" />
        <path d={`M ${s0x} ${s0y} A 14 14 0 ${large} 1 ${s1x} ${s1y}`} fill="none" stroke={C.peach} strokeWidth="2" />
        <circle cx={cx} cy={cy} r="3" fill={txt} />
        {label((cx + x1) / 2 + nx * 16, (cy + y1) / 2 + ny * 16, `${fig.r}cm`, { color: C.gold })}
        {deg < 150 ? label(cx, cy + 18, `${deg}°`, { color: C.peach, size: 12 }) : label(dx, dy, `${deg}°`, { color: C.peach, size: 12 })}
      </>);
    }
  }

  if (fig.type === "coord") {
    const cx = W / 2, cy = H / 2, s = 12; // 1目もり 12px、-6〜6
    const X = (x) => cx + x * s, Y = (y) => cy - y * s;
    const grid = [];
    for (let i = -6; i <= 6; i++) {
      grid.push(<line key={"v" + i} x1={X(i)} y1={Y(-6.5)} x2={X(i)} y2={Y(6.5)} stroke="rgba(255,255,255,.08)" />);
      grid.push(<line key={"h" + i} x1={X(-6.5)} y1={Y(i)} x2={X(6.5)} y2={Y(i)} stroke="rgba(255,255,255,.08)" />);
    }
    let graph = null;
    if (fig.kind === "line") {
      const xm = Math.min(6.5, 6.5 / Math.max(1, Math.abs(fig.a)));
      graph = <line x1={X(-xm)} y1={Y(-xm * fig.a)} x2={X(xm)} y2={Y(xm * fig.a)} stroke={C.gold} strokeWidth="3" />;
    } else if (fig.kind === "hyper") {
      const pts = (sgn) => {
        const out = [];
        for (let x = 0.3; x <= 6.5; x += 0.1) {
          const y = fig.a / (sgn * x);
          if (Math.abs(y) <= 6.5) out.push(`${X(sgn * x)},${Y(y)}`);
        }
        return out.join(" ");
      };
      graph = <>{[1, -1].map(sg => <polyline key={sg} points={pts(sg)} fill="none" stroke={C.gold} strokeWidth="3" />)}</>;
    }
    body = (<>
      {grid}
      <line x1={X(-6.5)} y1={cy} x2={X(6.5)} y2={cy} stroke={sub} strokeWidth="1.5" />
      <line x1={cx} y1={Y(-6.5)} x2={cx} y2={Y(6.5)} stroke={sub} strokeWidth="1.5" />
      {label(X(6.5) + 8, cy, "x", { color: sub, size: 12 })}
      {label(cx, Y(6.5) - 6, "y", { color: sub, size: 12 })}
      {label(cx - 7, cy + 8, "O", { color: sub, size: 10 })}
      {graph}
      {(fig.pts || []).map(([x, y, nm], i) => (
        <g key={i}>
          <circle cx={X(x)} cy={Y(y)} r="4" fill={C.peach} />
          {nm && label(X(x) + 12, Y(y) - 9, nm, { color: C.peach, size: 12 })}
        </g>
      ))}
    </>);
  }

  if (fig.type === "bars") {
    const n = fig.counts.length, max = Math.max(...fig.counts, 1);
    const left = 26, bottom = H - 26, top = 14, bw = (W - left - 34) / n; // 右はしに単位を書くすき間
    const hY = (c) => bottom - (bottom - top) * c / max;
    body = (<>
      <line x1={left} y1={bottom} x2={left + n * bw + 6} y2={bottom} stroke={sub} strokeWidth="1.5" />
      <line x1={left} y1={top} x2={left} y2={bottom} stroke={sub} strokeWidth="1.5" />
      {fig.counts.map((c, i) => (
        <g key={i}>
          <rect x={left + i * bw} y={hY(c)} width={bw} height={bottom - hY(c)} fill={fill} stroke={stroke} strokeWidth="2" />
          {label(left + i * bw + bw / 2, hY(c) - 9, String(c), { color: C.gold, size: 12 })}
        </g>
      ))}
      {fig.edges.map((e, i) => label(left + i * bw, bottom + 12, String(e), { color: sub, size: 10, key: "e" + i }))}
      {label(W - 4, bottom - 10, fig.unit ? `（${fig.unit}）` : "", { color: sub, size: 10, anchor: "end" })}
    </>);
  }

  if (fig.type === "solid") {
    const L = fig.labels || {}, k = fig.kind;
    const sw = { stroke, strokeWidth: 2.5, fill: "none" };
    const dash = { stroke, strokeWidth: 1.5, strokeDasharray: "4 4", fill: "none" };
    if (k === "cuboid" || k === "cube" || k === "prism3") {
      const x0 = 50, y0 = 130, w = k === "cube" ? 90 : 110, h = k === "cube" ? 80 : 70, dx = 40, dy = -30;
      if (k === "prism3") {
        // 三角柱：手前の三角形と奥の三角形
        const A = [x0, y0], B = [x0 + w, y0], T = [x0 + w / 2, y0 - h];
        const o = (P) => [P[0] + dx, P[1] + dy];
        body = (<>
          <polygon points={[A, B, T].map(p => p.join(",")).join(" ")} {...sw} fill={fill} />
          <polyline points={[B, o(B), o(T), T].map(p => p.join(",")).join(" ")} {...sw} />
          <line x1={T[0]} y1={T[1]} x2={o(T)[0]} y2={o(T)[1]} {...sw} />
          <polyline points={[A, o(A), o(B)].map(p => p.join(",")).join(" ")} {...dash} />
          <line x1={o(A)[0]} y1={o(A)[1]} x2={o(T)[0]} y2={o(T)[1]} {...dash} />
          {L.base && label(x0 + w / 2, y0 + 14, L.base, { color: C.gold })}
          {L.h && label(x0 + w / 2 - 4, y0 - h / 2 + 10, L.h, { color: C.peach, size: 12 })}
          {L.d && label(x0 + w + dx / 2 + 14, y0 + dy / 2, L.d, { color: C.gold })}
        </>);
      } else {
        const P = [[x0, y0], [x0 + w, y0], [x0 + w, y0 - h], [x0, y0 - h]];
        const o = (p) => [p[0] + dx, p[1] + dy];
        body = (<>
          <polygon points={P.map(p => p.join(",")).join(" ")} {...sw} fill={fill} />
          <polyline points={[P[1], o(P[1]), o(P[2]), o(P[3]), P[3]].map(p => p.join(",")).join(" ")} {...sw} />
          <line x1={P[2][0]} y1={P[2][1]} x2={o(P[2])[0]} y2={o(P[2])[1]} {...sw} />
          <polyline points={[P[0], o(P[0]), o(P[1])].map(p => p.join(",")).join(" ")} {...dash} />
          <line x1={o(P[0])[0]} y1={o(P[0])[1]} x2={o(P[3])[0]} y2={o(P[3])[1]} {...dash} />
          {L.w && label(x0 + w / 2, y0 + 14, L.w, { color: C.gold })}
          {L.h && label(x0 - 20, y0 - h / 2, L.h, { color: C.gold })}
          {L.d && label(x0 + w + dx / 2 + 16, y0 + dy / 2, L.d, { color: C.gold })}
        </>);
      }
    } else if (k === "cylinder" || k === "cone") {
      const cx = W / 2, by = 135, rx = 52, ry = 14, h = 100;
      body = (<>
        {k === "cylinder" ? (<>
          <ellipse cx={cx} cy={by - h} rx={rx} ry={ry} {...sw} fill={fill} />
          <line x1={cx - rx} y1={by - h} x2={cx - rx} y2={by} {...sw} />
          <line x1={cx + rx} y1={by - h} x2={cx + rx} y2={by} {...sw} />
        </>) : (<>
          <line x1={cx} y1={by - h} x2={cx - rx} y2={by} {...sw} />
          <line x1={cx} y1={by - h} x2={cx + rx} y2={by} {...sw} />
          <line x1={cx} y1={by - h} x2={cx} y2={by} {...dash} />
        </>)}
        <path d={`M ${cx - rx} ${by} A ${rx} ${ry} 0 0 0 ${cx + rx} ${by}`} {...sw} />
        <path d={`M ${cx - rx} ${by} A ${rx} ${ry} 0 0 1 ${cx + rx} ${by}`} {...dash} />
        <line x1={cx} y1={by} x2={cx + rx} y2={by} stroke={C.gold} strokeWidth="2" />
        {L.r && label(cx + rx / 2, by + ry + 10, L.r, { color: C.gold })}
        {L.h && (k === "cone"
          ? label(cx + 5, by - h * 0.3, L.h, { color: C.peach, size: 12, anchor: "start" })
          : label(cx + rx + 22, by - h / 2, L.h, { color: C.peach }))}
      </>);
    } else if (k === "pyramid") {
      const x0 = 55, y0 = 135, w = 100, dx = 40, dy = -26, apex = [x0 + (w + dx) / 2, 20];
      const A = [x0, y0], B = [x0 + w, y0], Cc = [x0 + w + dx, y0 + dy], D = [x0 + dx, y0 + dy];
      const centre = [(A[0] + Cc[0]) / 2, (A[1] + Cc[1]) / 2];
      body = (<>
        <polyline points={[A, B, Cc].map(p => p.join(",")).join(" ")} {...sw} />
        <polyline points={[A, D, Cc].map(p => p.join(",")).join(" ")} {...dash} />
        {[A, B, Cc].map((p, i) => <line key={i} x1={apex[0]} y1={apex[1]} x2={p[0]} y2={p[1]} {...sw} />)}
        <line x1={apex[0]} y1={apex[1]} x2={D[0]} y2={D[1]} {...dash} />
        <line x1={apex[0]} y1={apex[1]} x2={centre[0]} y2={centre[1]} stroke={C.peach} strokeWidth="1.5" strokeDasharray="3 3" />
        {L.base && label(x0 + w / 2, y0 + 14, L.base, { color: C.gold })}
        {L.h && label(centre[0] + 20, (apex[1] + centre[1]) / 2, L.h, { color: C.peach })}
      </>);
    } else if (k === "sphere") {
      const cx = W / 2, cy = H / 2 + 4, R = 64;
      body = (<>
        <circle cx={cx} cy={cy} r={R} {...sw} fill={fill} />
        <path d={`M ${cx - R} ${cy} A ${R} 16 0 0 0 ${cx + R} ${cy}`} {...sw} />
        <path d={`M ${cx - R} ${cy} A ${R} 16 0 0 1 ${cx + R} ${cy}`} {...dash} />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.gold} strokeWidth="2" />
        <circle cx={cx} cy={cy} r="3" fill={txt} />
        {L.r && label(cx + R / 2, cy - 12, L.r, { color: C.gold })}
      </>);
    }
  }

  if (!body) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 8px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label="図">{body}</svg>
    </div>
  );
}
