/* 令和8年熊本地震 義援金受付 — 申込データの送信先設定
 *
 * 下記の PLP_SUBMIT_URL に送信先URLを設定すると、寄付フォームの申込内容
 * （受付日時・振込番号・お名前・メールアドレス・金額・匿名希望・ページ言語）が
 * 送信され、財団側でデータとして保管できます。
 *
 * 設定できるURLの例（どちらか一方）:
 *   1. Formspree のエンドポイント
 *      例: "https://formspree.io/f/xxxxxxxx"
 *      → 申込がメール通知され、Formspreeの管理画面に一覧保存されます
 *   2. Google Apps Script のウェブアプリURL
 *      例: "https://script.google.com/macros/s/XXXX/exec"
 *      → Googleスプレッドシートに1行ずつ追記されます（READMEに手順あり）
 *
 * 空文字("")のままの場合は送信されず、従来どおり申込者の端末への保存
 * （admin.html の受付リスト）のみ行われます。
 */
window.PLP_SUBMIT_URL = "";
