/* 令和8年熊本地震 義援金受付 — SNSシェアボタン */
(function () {
  "use strict";

  var url = location.href.split("#")[0];
  var text = document.title;

  var intents = {
    x:
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text) +
      "&url=" +
      encodeURIComponent(url),
    facebook:
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(url),
    line:
      "https://social-plugins.line.me/lineit/share?url=" +
      encodeURIComponent(url) +
      "&text=" +
      encodeURIComponent(text)
  };

  // シェアリンクを設定（小窓で開く）
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-share]"),
    function (a) {
      var href = intents[a.dataset.share];
      if (!href) return;
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.addEventListener("click", function (e) {
        if (window.innerWidth < 700) return; // モバイルはそのまま遷移
        e.preventDefault();
        window.open(href, "share", "width=600,height=520,noopener");
      });
    }
  );

  // URLコピー
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-share-copy]"),
    function (btn) {
      var label = btn.querySelector("span:last-child") || btn;
      var original = label.textContent;
      btn.addEventListener("click", function () {
        var done = function () {
          label.textContent = "コピーしました";
          btn.classList.add("is-done");
          setTimeout(function () {
            label.textContent = original;
            btn.classList.remove("is-done");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = url;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) {}
          document.body.removeChild(ta);
        }
      });
    }
  );

  // 端末の共有メニュー（対応環境のみ表示）
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-share-native]"),
    function (btn) {
      if (!navigator.share) return; // 非対応環境では hidden のまま
      btn.hidden = false;
      btn.addEventListener("click", function () {
        navigator.share({ title: text, text: text, url: url }).catch(function () {});
      });
    }
  );
})();
