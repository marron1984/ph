/* ミンダナオ島地震 緊急支援募金 — フォーム制御 */
(function () {
  "use strict";

  var form = document.getElementById("donation-form");
  if (!form) return;

  var amountButtons = Array.prototype.slice.call(
    document.querySelectorAll(".amount-btn")
  );
  var customInput = document.getElementById("custom-amount");
  var summary = document.getElementById("summary-amount");
  var impact = document.getElementById("amount-impact");

  var selectedAmount = 5000;

  var yen = function (n) {
    return "¥" + Number(n).toLocaleString("ja-JP");
  };

  // 寄付額に応じた支援イメージ
  function impactMessage(amount) {
    if (!amount || amount < 100) return "";
    if (amount < 3000) return "被災者へ清潔な飲料水を届けられます。";
    if (amount < 5000) return "1家族分の食料・衛生用品を支援できます。";
    if (amount < 10000) return "毛布や避難用品で夜の寒さから守れます。";
    if (amount < 30000) return "1家族に一定期間の緊急支援物資を届けられます。";
    return "避難所運営や医療支援など、より広い支援につながります。";
  }

  function render() {
    summary.textContent = selectedAmount > 0 ? yen(selectedAmount) : "¥0";
    impact.textContent = impactMessage(selectedAmount);
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

  // お支払い方法ごとの設定
  var submitBtn = document.getElementById("submit-btn");
  var formNote = document.getElementById("form-note");
  var panels = Array.prototype.slice.call(
    document.querySelectorAll(".method-panel")
  );
  var methodRadios = Array.prototype.slice.call(
    document.querySelectorAll('input[name="method"]')
  );

  var DEMO_NOTE =
    "これはデモ用の受付フォームです。実際の決済を有効にするには、決済事業者（Stripe／KOMOJU 等）との連携が必要です。";

  var METHODS = {
    card: {
      btn: "寄付を確定する",
      note: "ボタンを押すと確認画面に進みます。" + DEMO_NOTE,
      thanks: function (f, a) {
        return f + " " + yen(a) + " のご寄付ありがとうございます。あなたの支援は、ミンダナオ島地震の被災者支援に役立てられます。";
      }
    },
    qr: {
      btn: "QRコードで寄付する",
      note: "決済アプリでQRコードを読み取ってお支払いください（QRコードは現在は仮です）。",
      thanks: function (f, a) {
        return "お申し込みありがとうございます。" + f + " " + yen(a) + " を、表示のQRコードからお支払いください（QRは現在は仮です）。";
      }
    },
    konbini: {
      btn: "コンビニ／キャリア決済で申し込む",
      note: "お申し込み後、払込票番号をご案内します（コンビニ・キャリア決済の稼働には決済代行の連携が必要です）。",
      thanks: function (f, a) {
        return "お申し込みありがとうございます。" + f + " " + yen(a) + " を、コンビニ／キャリア決済でお支払いください。払込票番号は追ってご案内します（仮）。";
      }
    },
    bank: {
      btn: "振込で寄付を申し込む",
      note: "上記口座へお振込みください。お申し込み後、確認のご連絡を差し上げます（口座情報は現在は仮の値です）。",
      thanks: function (f, a) {
        return "お申し込みありがとうございます。" + f + " " + yen(a) + " を、ご案内の口座へお振込みください（口座情報は現在は仮です）。確認後、改めてご連絡いたします。";
      }
    },
    yucho: {
      btn: "ゆうちょ振替で申し込む",
      note: "ゆうちょの振替口座へお振込みください（口座情報は現在は仮の値です）。",
      thanks: function (f, a) {
        return "お申し込みありがとうございます。" + f + " " + yen(a) + " を、ゆうちょ振替口座へお振込みください（口座情報は現在は仮です）。";
      }
    },
    crypto: {
      btn: "暗号資産で寄付する",
      note: "表示のアドレス宛にお送りください。送金前に最新の正式アドレスをご確認ください（アドレスは現在は仮です）。",
      thanks: function (f, a) {
        return "ありがとうございます。" + f + " " + yen(a) + " 相当を、表示のアドレス宛にお送りください（アドレスは現在は仮です）。";
      }
    },
    platform: {
      btn: "寄付サイトへ進む",
      note: "外部の寄付プラットフォームのページからお手続きください（リンクは現在は仮です）。",
      thanks: function (f, a) {
        return "ありがとうございます。外部の寄付プラットフォームのページからお手続きください（リンクは現在は仮です）。";
      }
    }
  };

  function currentMethod() {
    var checked = form.querySelector('input[name="method"]:checked');
    return checked ? checked.value : "card";
  }

  function updateMethod() {
    var method = currentMethod();
    panels.forEach(function (p) {
      p.hidden = p.dataset.method !== method;
    });
    var cfg = METHODS[method] || METHODS.card;
    submitBtn.textContent = cfg.btn;
    formNote.textContent = cfg.note;
  }

  methodRadios.forEach(function (r) {
    r.addEventListener("change", updateMethod);
  });
  updateMethod();

  // 送信処理（デモ）
  var modal = document.getElementById("thanks-modal");
  var thanksBody = document.getElementById("thanks-body");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedAmount || selectedAmount < 100) {
      alert("寄付金額を選択するか、100円以上の金額を入力してください。");
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var freq = form.querySelector('input[name="frequency"]:checked').value;
    var freqText = freq === "monthly" ? "毎月" : "今回";
    var cfg = METHODS[currentMethod()] || METHODS.card;
    thanksBody.textContent = cfg.thanks(freqText, selectedAmount);

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
