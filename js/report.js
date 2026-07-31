/* 令和8年熊本地震 義援金受付 — 活動報告ページ（ご芳名の表示） */
(function () {
  "use strict";

  var KEY = "plp_kifu_records";
  var grid = document.getElementById("donor-grid");
  if (!grid) return;
  var empty = document.getElementById("donor-empty");

  var records;
  try {
    records = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    records = [];
  }

  // HTMLに固定掲載済みの名前は重複させない
  var seen = {};
  Array.prototype.forEach.call(
    grid.querySelectorAll(".donor-chip"),
    function (chip) {
      seen[chip.textContent.trim()] = true;
    }
  );

  // 匿名希望を除き、受付順（古い順）に重複なく掲載
  var names = [];
  records
    .slice()
    .sort(function (a, b) { return a.t - b.t; })
    .forEach(function (r) {
      if (r.anon) return;
      var name = (r.name || "").trim();
      if (!name || seen[name]) return;
      seen[name] = true;
      names.push(name);
    });

  if (!names.length) return;

  if (empty) empty.remove();
  names.forEach(function (name) {
    var chip = document.createElement("span");
    chip.className = "donor-chip";
    chip.textContent = name;
    grid.appendChild(chip);
  });
})();
