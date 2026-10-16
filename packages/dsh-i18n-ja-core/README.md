# dsh-i18n-ja-core

DSH Web GUI の**コア UI 向け日本語ロケールパック**です。アプリ本体（app.asar に同梱の
`@deepseek-ai/*` コアプラグイン）が登録する名前空間 — `common`, `settings.*`, `chat`,
`workspace`, `trajectory`, `pluginManager`, `schedule.*`, `sidebar*` など 57 名前空間・
約 2,600 キー — に対する `ja` 辞書を登録し、言語カタログに「日本語」を追加します。

`dsh-i18n-ja`（dsh-web-all 拡張バンドルの名前空間向け）とは**別パック**で、
名前空間の重複はゼロ。両方を同時に有効化できます。

## 動作の仕組み

- ブラウザ側（`lib/client.js`）が `ctx.locale.addLanguage({ id: "ja", label: "日本語", fallback: "en" })`
  を呼び、続いて各名前空間の ja 辞書を `ctx.locale.register(ns, "ja", dict)` で個別登録します。
  登録は名前空間ごとに独立しており、重複や競合が起きても他を止めません
  （`addLanguage` は他パックが先に登録済みなら無視されます）。
- ホスト側（`lib/index.js`）は純ブラウザプラグインのため no-op です。
- 未翻訳キーは SDK のフォールバックチェーン（ns → `common` → `en` → キーそのまま）で
  英語表示になります。

## 翻訳の再構築

翻訳パイプラインはこのリポジトリの `tools/` に同梱しています（dsh-i18n-ja 側と共通手順）:

1. `node tools/asar-extract.mjs <app.asar> out-core "<コア client.js の正規表現>"`
   — app.asar からコアプラグインのクライアントバンドンを抽出
2. `node tools/extract-locale.mjs out-core/dsh/node_modules/@deepseek-ai out/locales.json`
   — `ctx.locale.register(...)` 呼び出しの zh/en 辞書リテラルを静的評価で抽出
3. `out/src/<ns>.json` に分割し、`out/GLOSSARY.md` の用語・文体ルールで
   `out/ja/<ns>.json`（キー完全一致）を翻訳
4. `node tools/build-client.mjs` — プレースホルダ互換・キー整合を検証しつつ
   `lib/client.js` を生成

## インストール

```
plugin_manager install_bundle → link:<このフォルダの絶対パス>
```

インストール後、プラグイン一覧で `dsh-i18n-ja-core` を有効化し、GUI をリロードして
**設定 → 一般 → 言語 → 日本語** を選択してください。

## ライセンス

Apache-2.0
