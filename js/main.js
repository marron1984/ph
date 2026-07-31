/* 令和8年熊本地震 緊急支援募金 — フォーム制御 */
(function () {
  "use strict";

  var form = document.getElementById("donation-form");
  if (!form) return;

  // ページ側で window.PLP_TEXTS を定義すると文言を差し替え可能（英語ページ用）
  var T = window.PLP_TEXTS || {};

  var amountButtons = Array.prototype.slice.call(
    document.querySelectorAll(".amount-btn")
  );
  var customInput = document.getElementById("custom-amount");
  var summary = document.getElementById("summary-amount");

  var selectedAmount = 5000;

  var yen = function (n) {
    return "¥" + Number(n).toLocaleString("ja-JP");
  };

  function render() {
    summary.textContent = selectedAmount > 0 ? yen(selectedAmount) : "¥0";
  }

  function setActiveButton(btn) {
    amountButtons.forEach(function (b) {
      b.classList.toggle("is-active", b === btn);
    });
  }

  amountButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedAmount = parseInt(btn.dataset.amount, 10);
      customInput.value = "";
      setActiveButton(btn);
      render();
    });
  });

  customInput.addEventListener("input", function () {
    var val = parseInt(customInput.value, 10);
    if (!isNaN(val) && val > 0) {
      selectedAmount = val;
      setActiveButton(null);
    } else {
      selectedAmount = 0;
    }
    render();
  });

  // ── 振込番号の発行 ──────────────────────────────
  // お名前とメールアドレスの入力が揃うと、メールアドレスから
  // 決定的に6桁の振込番号を発行する（同じメールなら常に同じ番号）。
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var codeBox = document.getElementById("transfer-code");
  var codeNum = document.getElementById("transfer-code-num");
  var codeExample = document.getElementById("transfer-code-example");
  var codeHint = document.getElementById("transfer-code-hint");
  var codeCopy = document.getElementById("transfer-code-copy");
  var currentCode = null;

  function transferCode(email) {
    var s = email.trim().toLowerCase();
    var h = 5381;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    }
    return String(100000 + (h % 900000));
  }

  function updateCode() {
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var emailOk = /^\S+@\S+\.\S+$/.test(email);

    if (name && emailOk) {
      currentCode = transferCode(email);
      codeNum.textContent = currentCode;
      codeExample.textContent = currentCode;
      codeBox.hidden = false;
      codeHint.hidden = true;
    } else {
      currentCode = null;
      codeBox.hidden = true;
      codeHint.hidden = false;
    }
  }

  nameInput.addEventListener("input", updateCode);
  emailInput.addEventListener("input", updateCode);
  updateCode();

  if (codeCopy) {
    codeCopy.addEventListener("click", function () {
      if (!currentCode) return;
      var done = function () {
        codeCopy.textContent = "コピーしました";
        codeCopy.classList.add("is-done");
        setTimeout(function () {
          codeCopy.textContent = "コピー";
          codeCopy.classList.remove("is-done");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentCode).then(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = currentCode;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  }

  // 送信処理（受付は銀行振込のみ）
  var modal = document.getElementById("thanks-modal");
  var thanksBody = document.getElementById("thanks-body");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedAmount || selectedAmount < 100) {
      alert(T.amountAlert || "寄付金額を選択するか、100円以上の金額を入力してください。");
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!currentCode) {
      alert(T.codeAlert || "お名前とメールアドレスを入力すると振込番号が発行されます。ご確認ください。");
      return;
    }

    // 申込記録をこの端末に保存（管理画面 admin.html で一覧表示）
    try {
      var KEY = "plp_kifu_records";
      var records = JSON.parse(localStorage.getItem(KEY) || "[]");
      records.push({
        t: Date.now(),
        code: currentCode,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        amount: selectedAmount,
        anon: document.getElementById("anonymous").checked
      });
      localStorage.setItem(KEY, JSON.stringify(records));
    } catch (err) { /* ストレージ不可でも申込は継続 */ }

    var anonChecked = document.getElementById("anonymous").checked;
    thanksBody.textContent = T.thanks ? T.thanks(currentCode, yen(selectedAmount), anonChecked) :
      "お申し込みありがとうございます。あなたの振込番号は「" +
      currentCode +
      "」です。" +
      yen(selectedAmount) +
      " を、GMOあおぞらネット銀行 法人営業部 普通 1576120" +
      "（一般財団法人　国際ピースラビングピープル財団義援金受付）へお振込みください。" +
      "振込人名義の先頭に振込番号をご入力ください（例：" +
      currentCode +
      " ヤマダ タロウ）。" +
      (anonChecked
        ? ""
        : "ご入金の確認後、活動報告ページにお名前を掲載させていただきます。");

    openModal();
  });

  // モーダル
  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  render();
})();
