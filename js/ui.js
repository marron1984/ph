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

  // 数字のカウントアップ（統計バンド）
  (function countUp() {
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length || !("IntersectionObserver" in window)) return;

    var animate = function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^([^\d.]*)([\d.]+)(.*)$/);
      if (!m) return;
      var prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
      if (reduceMotion) {
        return;
      }
      var decimals = (m[2].split(".")[1] || "").length;
      var start = null, dur = 1100;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = (target * eased).toFixed(decimals);
        el.textContent = prefix + val + suffix;
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
    Array.prototype.forEach.call(nums, function (el) {
      obs.observe(el);
    });
  })();

  // ナビのスクロール連動ハイライト（スクロールスパイ）
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
    if (!ids.length || !("IntersectionObserver" in window)) return;

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
      { threshold: [0.15, 0.5, 0.85], rootMargin: "-86px 0px -45% 0px" }
    );
    ids.forEach(function (id) {
      obs.observe(document.getElementById(id));
    });
  })();

  // ギャラリーのライトボックス
  (function lightbox() {
    var figures = Array.prototype.slice.call(
      document.querySelectorAll(".gallery figure")
    );
    if (!figures.length) return;

    var items = figures.map(function (fig) {
      var img = fig.querySelector("img");
      var cap = fig.querySelector("figcaption");
      return { src: img ? img.src : "", alt: img ? img.alt : "", cap: cap ? cap.textContent : "" };
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
      '<figcaption></figcaption>';
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
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
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

  // 口座・アドレスのコピー
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
        try { document.execCommand("copy"); resolve(); }
        catch (err) { reject(err); }
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
