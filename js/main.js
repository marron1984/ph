/* 令和8年熊本地震 緊急支援募金 — フォーム制御 */
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

  // 送信処理（受付は銀行振込のみ）
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
    thanksBody.textContent =
      "お申し込みありがとうございます。" +
      freqText +
      " " +
      yen(selectedAmount) +
      " を、GMOあおぞらネット銀行 本店営業部 普通 1576120" +
      "（一般財団法人　国際ピースラビングピープル財団義援金受付）へお振込みください。" +
      "あなたの義援金は、令和8年熊本地震の被災者支援に役立てられます。";

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
