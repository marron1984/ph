/* ミンダナオ島地震 緊急支援募金 — UI演出（Trust Blue モーションシステム） */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var hasIO = "IntersectionObserver" in window;

  // ── スクロール進捗バー ──────────────────────────
  var progress = document.createElement("div");
  progress.className = "progress-bar";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  // ── ヘッダー影 + 進捗更新（rAFでまとめて処理） ──
  var header = document.querySelector(".site-header");
  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (y / max) * 100 + "%" : "0%";
      updateParallax(y);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── ヒーローのパララックス ──────────────────────
  var heroFigure = document.querySelector(".hero-figure");
  var auroras = document.querySelectorAll(".aurora");
  function updateParallax(y) {
    if (reduceMotion) return;
    if (y > 900) return;
    if (heroFigure) {
      heroFigure.style.transform = "translateY(" + y * 0.08 + "px)";
    }
    Array.prototype.forEach.call(auroras, function (a, i) {
      var f = 0.03 + i * 0.02;
      a.style.marginTop = y * f + "px";
    });
  }
  onScroll();

  // ── ふわっとリビール（タイトル・カード類、時差つき） ──
  if (!reduceMotion && hasIO) {
    var targets = document.querySelectorAll(
      ".section-eyebrow, .section-title, .stat, .use-card, .update-card," +
      ".mission-card, .gallery figure, .fact-list li, .trust-list li," +
      ".situation-map, .about-card, .sources, .update-meta"
    );
    Array.prototype.forEach.call(targets, function (el) {
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", Math.min(index, 6) * 75 + "ms");
    });

    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    Array.prototype.forEach.call(targets, function (el) {
      revealObs.observe(el);
    });
  } else {
    // 低減設定時もタイトル下線は表示
    Array.prototype.forEach.call(
      document.querySelectorAll(".section-title"),
      function (el) { el.classList.add("is-visible"); }
    );
  }

  // ── 3Dチルト（ヒーロー写真・寄付カード / ホバー環境のみ） ──
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var tiltTargets = document.querySelectorAll(".hero-photo, .donate-card");
    Array.prototype.forEach.call(tiltTargets, function (el) {
      var strength = el.classList.contains("donate-card") ? 3 : 6;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -strength;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * strength;
        el.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  // ── ボタンのクリックリップル ────────────────────
  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn");
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      var d = Math.max(r.width, r.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = d + "px";
      span.style.left = e.clientX - r.left - d / 2 + "px";
      span.style.top = e.clientY - r.top - d / 2 + "px";
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 600);
    });
  }

  // ── 数字のカウントアップ（統計バンド） ─────────────
  (function countUp() {
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length || !hasIO || reduceMotion) return;

    var animate = function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^([^\d.]*)([\d.]+)(.*)$/);
      if (!m) return;
      var prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
      var decimals = (m[2].split(".")[1] || "").length;
      var start = null, dur = 1200;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      };
      el.textContent = prefix + (0).toFixed(decimals) + suffix;
      requestAnimationFrame(step);
    };

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animate(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    Array.prototype.forEach.call(nums, function (el) { obs.observe(el); });
  })();

  // ── ナビのスクロールスパイ ──────────────────────
  (function scrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.site-nav a[href^="#"]')
    );
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length || !hasIO) return;

    var visible = {};
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
        });
        var best = null, bestRatio = 0;
        ids.forEach(function (id) {
          if ((visible[id] || 0) > bestRatio) {
            bestRatio = visible[id];
            best = id;
          }
        });
        links.forEach(function (a) {
          a.classList.toggle("is-active", best !== null && a === map[best]);
        });
      },
      { threshold: [0.15, 0.5, 0.85], rootMargin: "-88px 0px -45% 0px" }
    );
    ids.forEach(function (id) {
      obs.observe(document.getElementById(id));
    });
  })();

  // ── モバイル用フローティングCTA ───────────────────
  var floatCta = document.getElementById("float-cta");
  var donateSection = document.getElementById("donate");
  if (floatCta && donateSection && hasIO) {
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

  // ── ギャラリーのライトボックス ────────────────────
  (function lightbox() {
    var figures = Array.prototype.slice.call(
      document.querySelectorAll(".gallery figure")
    );
    if (!figures.length) return;

    var items = figures.map(function (fig) {
      var img = fig.querySelector("img");
      var cap = fig.querySelector("figcaption");
      return {
        src: img ? img.src : "",
        alt: img ? img.alt : "",
        cap: cap ? cap.textContent : ""
      };
    });

    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox-close" aria-label="閉じる">×</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="前へ">‹</button>' +
      '<button class="lightbox-nav lightbox-next" aria-label="次へ">›</button>' +
      '<img alt="" />' +
      "<figcaption></figcaption>";
    document.body.appendChild(box);

    var bImg = box.querySelector("img");
    var bCap = box.querySelector("figcaption");
    var current = 0;

    var show = function (i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      bImg.src = it.src;
      bImg.alt = it.alt;
      bCap.textContent = it.cap;
    };
    var open = function (i) {
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      box.hidden = true;
      document.body.style.overflow = "";
    };

    figures.forEach(function (fig, i) {
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  })();

  // ── 口座・アドレスのコピー ──────────────────────
  (function copyButtons() {
    var cells = document.querySelectorAll(
      '.method-panel[data-method="bank"] .kv-table dd,' +
      '.method-panel[data-method="yucho"] .kv-table dd,' +
      '.method-panel[data-method="crypto"] .kv-table dd'
    );
    if (!cells.length) return;

    var copyText = function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          resolve();
        } catch (err) {
          reject(err);
        }
        document.body.removeChild(ta);
      });
    };

    Array.prototype.forEach.call(cells, function (dd) {
      var value = dd.textContent.replace(/（仮）\s*$/, "").trim();
      if (!value) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "コピー";
      btn.addEventListener("click", function () {
        copyText(value).then(function () {
          btn.textContent = "コピーしました";
          btn.classList.add("is-done");
          setTimeout(function () {
            btn.textContent = "コピー";
            btn.classList.remove("is-done");
          }, 1600);
        });
      });
      dd.appendChild(btn);
    });
  })();
})();
