/* ---------- グローバルなキーフレーム ---------- */
function Keyframes() {
  return (
    <style>{`
      @keyframes rino-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes rino-happy { 0%{transform:translateY(0) scale(1)} 28%{transform:translateY(-26px) scale(1.06)} 55%{transform:translateY(2px) scale(.95)} 75%{transform:translateY(-8px) scale(1.02)} 100%{transform:translateY(0) scale(1)} }
      @keyframes rino-sad { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-7deg)} 50%{transform:rotate(7deg)} 80%{transform:rotate(-5deg)} }
      @keyframes rino-spark { 0%{opacity:0;transform:scale(.2) rotate(0)} 45%{opacity:1;transform:scale(1.15) rotate(40deg)} 100%{opacity:0;transform:scale(.4) rotate(90deg)} }
      @keyframes rino-slime { 0%,100%{transform:scale(1,1)} 50%{transform:scale(1.07,.93)} }
      @keyframes rino-numrise { 0%{opacity:0;transform:translateY(18px) scale(.7)} 25%{opacity:.85} 100%{opacity:0;transform:translateY(-64px) scale(1.1)} }
      @keyframes rino-spin { to{transform:rotate(360deg)} }
      @keyframes rino-hit { 0%,100%{filter:none;transform:translateX(0)} 25%{filter:brightness(2.2)} 30%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
      @keyframes rino-pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
      @keyframes rino-rune { 0%,100%{opacity:.18} 50%{opacity:.5} }
      @keyframes rino-glow { 0%,100%{box-shadow:0 0 18px rgba(110,231,224,.35)} 50%{box-shadow:0 0 34px rgba(110,231,224,.7)} }
      .rino-btn{transition:transform .12s ease, filter .12s ease; -webkit-tap-highlight-color:transparent;}
      .rino-btn:active{transform:scale(.96)}
      .rino-btn:focus-visible{outline:3px solid ${C.aqua}; outline-offset:3px}
      @media (prefers-reduced-motion: reduce){*{animation:none !important}}
    `}</style>
  );
}
