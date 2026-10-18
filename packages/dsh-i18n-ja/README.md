# dsh-i18n-ja — DSH Web GUI 日本語ロケールパック

> *Japanese locale pack for the DSH (DeepSeek Harness) Web GUI. Registers the* 日本語 *language and ~1,700 translated strings for the* `@linxin666/dsh-web-all` *plugin family. Install it by its npm name from the DSH plugin manager.*

`@linxin666/dsh-web-all`（Web GUI プラグイン集）の UI を日本語表示にする言語パックプラグインです。
公式の `@linxin666/dsh-i18n`（ロシア語パック）と同じ機構で、共有ロケールサービスに
**日本語（`ja`、ラベル「日本語」、フォールバック `en`）** を登録し、ファミリー全 17 名前空間の
日本語辞書をまとめて持ちます。

コア UI 向けの名前空間は別パック [`dsh-i18n-ja-core`](https://www.npmjs.com/package/dsh-i18n-ja-core) が担当します（重複ゼロ・同時有効化可）。

## インストール（DSH での導入方法）

### 1. プラグイン管理から追加（推奨）

DSH Web GUI の **プラグイン管理** で、次のパッケージ名を追加してください：

```
dsh-i18n-ja
```

（エージェント経由で管理する場合は `plugin_manager` の `install_bundle`、spec は `dsh-i18n-ja`）

### 2. 有効化と適用

プラグイン一覧で `dsh-i18n-ja` が **有効（enabled）／適用（applied）** になっていることを確認します。

### 3. 反映

Web GUI をリロード（ブラウザなら F5、デスクトップアプリなら再起動）し、
**設定 → 一般 → 言語 → 日本語** を選択します。

### エージェントに導入を任せる場合のプロンプト

DSH のチャットに、次のプロンプトをそのまま貼り付けてください：

```
npm パッケージ「dsh-i18n-ja」を DSH のプラグインとして導入してください。
手順:
1. plugin_manager の install_bundle で spec "dsh-i18n-ja" をインストール
2. list_plugins / set_plugin で有効化（enabled）と適用状態を確認
3. 完了後、Web GUI の再読み込みと「設定 → 一般 → 言語 → 日本語」の手順を案内してください
```

（コア UI ごと日本語にしたい場合は `dsh-i18n-ja-core` も同様に導入してください）

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
