# ミンダナオ島地震 緊急支援募金サイト

フィリピン・ミンダナオ島で2026年6月8日に発生したマグニチュード7.8の地震に対する
**緊急人道支援募金サイト**です。**国際 P-LP 財団
（International Peace-Loving People Foundation / [iplpf.org](https://iplpf.org/)）**
が運営主体となります。

## 概要

- 被害状況の紹介（地図・現地写真）
- ご寄付の使い道の説明
- 金額選択・カスタム金額に対応した寄付フォーム（単発／毎月）
- 運営団体（IPLPF）の紹介
- レスポンシブ対応（スマートフォン・タブレット・PC）
- 依存ライブラリなしの静的サイト（HTML / CSS / Vanilla JS）

## ファイル構成

```
.
├── index.html          # メインページ
├── css/style.css       # スタイル
├── js/main.js          # 寄付フォームの制御
├── assets/images/      # 地図・被害写真
└── README.md
```

## ローカルでの確認

静的サイトなので、任意の HTTP サーバーで表示できます。

```bash
# 例: Python の簡易サーバー
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## 決済連携について（重要）

現在のフォームは **デモ（UI のみ）** です。実際の寄付決済を受け付けるには、
決済事業者との連携が必要です。代表的な選択肢:

- **Stripe Checkout / Payment Links** — クレジットカード・Apple Pay 等
- **PayPal Donations**
- 国内の **銀行振込** 口座情報の掲載

`js/main.js` の送信処理（`form.addEventListener("submit", ...)`）を、
決済プロバイダのリダイレクトまたは API 呼び出しに置き換えてください。

### 銀行振込について

寄付フォームには **銀行振込** の選択肢を用意しています。現在の口座情報は
**仮（サンプル）の値** です。`index.html` の `#bank-details`（銀行名・支店名・
口座種別・口座番号・口座名義・カナ）を正式な振込先に差し替えてください。

## 出典・クレジット

- 地震情報: USGS / PHIVOLCS および各国報道（2026年6月8日時点）
- 地図データ: © Natural Earth
- 被害写真: 現地で撮影されたもの

## 運営

- **名称**: 一般財団法人 国際ピース・ラビング・ピープル財団（略称：国際 P-LP 財団）
- **英語表記**: International Peace-Loving People Foundation（IPLPF）
- **設立**: 2020年11月（設立者：長澤英男）
- **理事長**: 前田 淳
- **所在地**: 〒102-0093 東京都千代田区平河町2-3-10-108
- **Web**: https://www.iplpf.org
- **E-mail**: office@iplpf.org
