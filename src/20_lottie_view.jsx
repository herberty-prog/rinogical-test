/* ================= Lottie再生部品（lottie-web を遅延読み込み）=================
   ・src があれば再生。読み込み失敗・ライブラリ未読込なら onFail を呼んで何も描かない
     （呼び出し側＝Heroが従来表示にフォールバックする）。
   ・lottie-web は importmap（esm.sh）で追加する必要がある（index.html側）。 */
function LottieView({ src, size = 200, loop = true, onFail }) {
  const box = useRef(null);
  useEffect(() => {
    if (!src) { if (onFail) onFail(); return; }
    var anim = null; var alive = true;
    import("lottie-web").then(function (mod) {
      if (!alive || !box.current) return;
      var lottie = mod.default || mod;
      anim = lottie.loadAnimation({
        container: box.current,
        renderer: "svg",
        loop: loop,
        autoplay: true,
        path: src,
      });
      anim.addEventListener("data_failed", function () { if (onFail) onFail(); });
    }).catch(function () { if (onFail) onFail(); });
    return function () { alive = false; if (anim) anim.destroy(); };
  }, [src, loop]);
  return <div ref={box} style={{ width: size, height: size, margin: "0 auto" }} />;
}
