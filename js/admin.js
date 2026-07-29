/* 令和8年熊本地震 義援金受付 — 振込番号 管理画面 */
(function () {
  "use strict";

  var KEY = "plp_kifu_records";

  // main.js と同一のロジック（メールアドレス→6桁の振込番号）
  function transferCode(email) {
    var s = email.trim().toLowerCase();
    var h = 5381;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    }
    return String(100000 + (h % 900000));
  }

  var yen = function (n) {
    return "¥" + Number(n).toLocaleString("ja-JP");
  };

  function loadRecords() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveRecords(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function fmtDate(t) {
    var d = new Date(t);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ── 受付リスト ──────────────────────────────────
  var body = document.getElementById("records-body");
  var empty = document.getElementById("records-empty");
  var statCount = document.getElementById("stat-count");
  var statTotal = document.getElementById("stat-total");
  var search = document.getElementById("search");

  function render() {
    var q = (search.value || "").trim().toLowerCase();
    var records = loadRecords().slice().sort(function (a, b) { return b.t - a.t; });
    var filtered = records.filter(function (r) {
      if (!q) return true;
      return (r.code + " " + r.name + " " + r.email).toLowerCase().indexOf(q) !== -1;
    });

    statCount.textContent = records.length;
    statTotal.textContent = yen(records.reduce(function (s, r) { return s + (r.amount || 0); }, 0));

    body.innerHTML = filtered.map(function (r) {
      return "<tr>" +
        "<td>" + fmtDate(r.t) + "</td>" +
        '<td class="code">' + esc(r.code) + "</td>" +
        "<td>" + esc(r.name) + (r.anon ? ' <span class="tag tag-anon">匿名希望</span>' : "") + "</td>" +
        "<td>" + esc(r.email) + "</td>" +
        '<td class="num">' + yen(r.amount) + "</td>" +
        "<td>" + (r.freq === "monthly"
          ? '<span class="tag tag-monthly">毎月</span>'
          : '<span class="tag tag-once">今回のみ</span>') + "</td>" +
        '<td><button type="button" class="del" data-t="' + r.t + '">削除</button></td>' +
        "</tr>";
    }).join("");

    empty.style.display = filtered.length ? "none" : "";
  }

  search.addEventListener("input", render);

  body.addEventListener("click", function (e) {
    var btn = e.target.closest(".del");
    if (!btn) return;
    if (!confirm("この受付記録を削除しますか？")) return;
    var t = Number(btn.dataset.t);
    saveRecords(loadRecords().filter(function (r) { return r.t !== t; }));
    render();
  });

  document.getElementById("clear-all").addEventListener("click", function () {
    var n = loadRecords().length;
    if (!n) return;
    if (!confirm("受付記録 " + n + " 件をすべて削除します。よろしいですか？")) return;
    saveRecords([]);
    render();
  });

  // CSVエクスポート（Excel向けにBOM付きUTF-8）
  function downloadCsv(filename, rows) {
    var csv = rows.map(function (row) {
      return row.map(function (v) {
        v = String(v == null ? "" : v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(",");
    }).join("\r\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  document.getElementById("export-csv").addEventListener("click", function () {
    var records = loadRecords().slice().sort(function (a, b) { return b.t - a.t; });
    if (!records.length) {
      alert("エクスポートする受付記録がありません。");
      return;
    }
    var rows = [["受付日時", "振込番号", "お名前", "メールアドレス", "金額", "種別", "匿名希望"]];
    records.forEach(function (r) {
      rows.push([
        fmtDate(r.t), r.code, r.name, r.email, r.amount,
        r.freq === "monthly" ? "毎月" : "今回のみ",
        r.anon ? "はい" : ""
      ]);
    });
    downloadCsv("kifu_records.csv", rows);
  });

  render();

  // ── 照合ツール（1件） ────────────────────────────
  var calcEmail = document.getElementById("calc-email");
  var calcResult = document.getElementById("calc-result");
  calcEmail.addEventListener("input", function () {
    var v = calcEmail.value.trim();
    if (/^\S+@\S+\.\S+$/.test(v)) {
      calcResult.innerHTML = '振込番号：<span class="code">' + esc(transferCode(v)) + "</span>";
    } else {
      calcResult.textContent = "";
    }
  });

  // ── 照合ツール（まとめて） ────────────────────────
  var bulkInput = document.getElementById("calc-bulk");
  var bulkWrap = document.getElementById("bulk-wrap");
  var bulkBody = document.getElementById("bulk-body");
  var bulkCsvBtn = document.getElementById("calc-bulk-csv");
  var bulkRows = [];

  document.getElementById("calc-bulk-run").addEventListener("click", function () {
    bulkRows = [];
    bulkInput.value.split("\n").forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var parts = line.split(/[,\t]/);
      var name = (parts[0] || "").trim();
      var email = (parts[1] || parts[0] || "").trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return;
      if (email === name) name = "";
      bulkRows.push([name, email, transferCode(email)]);
    });

    bulkBody.innerHTML = bulkRows.map(function (r) {
      return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) +
        '</td><td class="code">' + esc(r[2]) + "</td></tr>";
    }).join("");
    bulkWrap.hidden = bulkRows.length === 0;
    bulkCsvBtn.hidden = bulkRows.length === 0;
    if (!bulkRows.length) {
      alert("有効な行がありません。「お名前,メールアドレス」の形式で1行ずつ入力してください。");
    }
  });

  bulkCsvBtn.addEventListener("click", function () {
    var rows = [["お名前", "メールアドレス", "振込番号"]].concat(bulkRows);
    downloadCsv("transfer_codes.csv", rows);
  });
})();
