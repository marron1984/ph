/* ミンダナオ島地震 緊急支援募金 — UI演出（スクロール連動） */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ヘッダー：スクロールで影を付ける
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // カード類のふわっと表示（reduced-motion時は無効）
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".stat, .use-card, .update-card, .mission-card, .gallery figure, .fact-list li, .trust-list li"
    );
    Array.prototype.forEach.call(targets, function (el) {
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", Math.min(index, 5) * 70 + "ms");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  // モバイル用フローティング寄付ボタン：寄付セクション表示中は隠す
  var floatCta = document.getElementById("float-cta");
  var donateSection = document.getElementById("donate");
  if (floatCta && donateSection && "IntersectionObserver" in window) {
    var ctaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          floatCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );
    ctaObserver.observe(donateSection);
  }
})();
