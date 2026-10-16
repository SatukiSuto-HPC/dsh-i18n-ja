# dsh-i18n-ja — DSH Web GUI 日本語ロケールパック

`@linxin666/dsh-web-all`（Web GUI プラグイン集）の UI を日本語表示にする言語パックプラグインです。
公式の `@linxin666/dsh-i18n`（ロシア語パック）と同じ機構で、共有ロケールサービスに
**日本語（`ja`、ラベル「日本語」、フォールバック `en`）** を登録し、ファミリー全 17 名前空間の
日本語辞書をまとめて持ちます。

## 使い方

1. インストール（このディレクトリを直接リンク）:

   ```
   dsh plugin --profile desktop add link:C:\Users\sirok\Documents\てｓｔ\i18n-ja
   ```

2. DSH を再起動（または Web GUI をリロード）。
3. **設定 → 一般 → 言語** で「日本語」を選択。

## 対象名前空間（17 / 約1,700 キー）

| 名前空間 | 提供元パッケージ | キー数 |
|---|---|---|
| `task-board` | dsh-client-ui-task-board | 421 |
| `skinCenter` | dsh-client-ui-skin-center | 160 |
| `dsh-ssh` | dsh-ssh | 154 |
| `dsh-web-ui-session-archive` | dsh-session-archive | 124 |
| `remote` | dsh-remote-web-ui | 117 |
| `task-board-github` | dsh-client-ui-task-board-github | 113 |
| `dsh-web-ui-market` | dsh-client-ui-market | 106 |
| `pet` | dsh-pet | 81 |
| `dsh-skill-explorer` | dsh-client-ui-skill-explorer | 75 |
| `git-graph` | dsh-client-ui-git-graph | 63 |
| `dsh-web-ui-usage` | dsh-usage | 63 |
| `liangshen` | dsh-liangshen | 57 |
| `model-caps` | dsh-client-ui-model-capabilities | 48 |
| `dsh-web-ui-preset-center` | dsh-client-ui-preset-center | 46 |
| `update` | dsh-update | 43 |
| `settings.pluginManager` | dsh-client-ui-plugin-manager | 36 |
| `web-ui-plugins` | dsh-client-ui-web-ui-settings | 1 |

## 設計（dsh-i18n と同一）

- `apply(ctx)` は `ctx.effect` 内で `ctx.locale.addLanguage({id:'ja', label:'日本語', fallback:'en'})` を試み、
  続いて名前空間ごとに `ctx.locale.register(ns, 'ja', dict)` を**個別の try/catch** で登録します。
  1 つの名前空間が競合しても他を止めません。
- 名前空間の登録は `addLanguage` の成否と独立です（コアが先に `ja` を提供する状況でも辞書だけ先行登録できる）。
- ホスト側 `lib/index.js` は no-op（純ブラウザプラグイン）。
- 未翻訳キーは SDK のフォールバックチェーン（ns → common → en → キー名）で英語表示になります。
- `{count}` `{time}` `{error}` などのプレースホルダは原文のまま保持しています。

## 既知の制限

- コアシェル本体の名前空間（`common`、`settings.locale` など）は対象外です。
  日本語選択時、コア部分は英語（フォールバック）で表示されます。
- ファミリー側の新バージョンでキーが追加された場合は、同様に英語へフォールバックします。

## 再ビルド

辞書の原本は `out/` にあります（`out/src/*.json` = 抽出した en/zh、`out/ja/*.json` = 日本語）。
更新后は `node tools/build-client.mjs` で `lib/client.js` を再生成できます。
