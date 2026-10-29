import React, { useState, useEffect, useRef } from "react";
import { Coins, Sparkles, Star, Heart, Lightbulb, ArrowRight, RefreshCw, Lock } from "lucide-react";

/* =========================================================================
   Rinogical（りのじかる）— Phase 1 minimal working demo
   ダークファンタジー × 粘土風パステル / 中1数学「正負の数」/ ボス：ダーク・ナンバー
   - Lottie → CSSアニメで代替（実機は lottie-react に差し替え）
   - Firebase/localStorage → メモリ状態で代替（artifactでは保存しない）
   - Claude API（claude-sonnet-4-6）：AI解説・応用問題生成は本物が動作
   - index.html は GitHub Actions が src/ から自動生成（2026-10-29〜）
   ========================================================================= */
