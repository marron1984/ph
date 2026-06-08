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

  // お支払い方法の切替（クレジットカード / 銀行振込）
  var bankDetails = document.getElementById("bank-details");
  var submitBtn = document.getElementById("submit-btn");
  var formNote = document.getElementById("form-note");
  var methodRadios = Array.prototype.slice.call(
    document.querySelectorAll('input[name="method"]')
  );

  function currentMethod() {
    var checked = form.querySelector('input[name="method"]:checked');
    return checked ? checked.value : "card";
  }

  function updateMethod() {
    var isBank = currentMethod() === "bank";
    bankDetails.hidden = !isBank;
    submitBtn.textContent = isBank ? "振込で寄付を申し込む" : "寄付を確定する";
    formNote.textContent = isBank
      ? "銀行振込をお選びの場合は、上記口座へお振込みください。お申し込み後、確認のご連絡を差し上げます（口座情報は現在は仮の値です）。"
      : "ボタンを押すと確認画面に進みます。これはデモ用の受付フォームです。実際の決済を有効にするには、決済事業者（Stripe／PayPal 等）との連携が必要です。";
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

    if (currentMethod() === "bank") {
      thanksBody.textContent =
        "お申し込みありがとうございます。" +
        freqText +
        " " +
        yen(selectedAmount) +
        " を、ご案内の口座へお振込みください（口座情報は現在は仮の値です）。お振込みの確認後、改めてご連絡いたします。";
    } else {
      thanksBody.textContent =
        freqText +
        " " +
        yen(selectedAmount) +
        " のご寄付ありがとうございます。あなたの支援は、ミンダナオ島地震の被災者支援に役立てられます。";
    }

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
