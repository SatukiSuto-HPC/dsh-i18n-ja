# dsh-i18n-ja — DeepSeek Harness Web GUI 日本語ロケールパック

[DeepSeek Harness](https://deepseek.com)（DSH）の Web GUI を日本語表示にするロケールパック集です。
言語カタログに `ja`（日本語）を登録し、各名前空間の日本語辞書を供給します。
インストール後、**設定 → 一般 → 言語 → 日本語** を選ぶと UI が日本語になります。

## パッケージ

| パッケージ | 対象 | 規模 |
|---|---|---|
| [`dsh-i18n-ja`](packages/dsh-i18n-ja) | [dsh-web-all](https://www.npmjs.com/package/dsh-web-all) 拡張バンドルの 17 名前空間 | 約 1,700 キー |
| [`dsh-i18n-ja-core`](packages/dsh-i18n-ja-core) | DSH コア UI（`common` / `settings.*` / `chat` / `workspace` / `sidebar*` など 57 名前空間） | 約 2,600 キー |

両者は名前空間が重複しない設計で、同時に有効化できます（`dsh-i18n-ja` がコア側の `ja` 言語登録も兼ねますが、コア単体でも動作します）。

## インストール

npm に公開済みです（[`dsh-i18n-ja`](https://www.npmjs.com/package/dsh-i18n-ja) / [`dsh-i18n-ja-core`](https://www.npmjs.com/package/dsh-i18n-ja-core)）。
DSH のプラグイン管理（GUI のプラグイン管理画面、または `plugin_manager`）から次を追加します:

```
dsh-i18n-ja
dsh-i18n-ja-core
```

有効化後、Web GUI をリロード → **設定 → 一般 → 言語 → 日本語**。

ローカルCheckoutから試す場合:

```
link:<このリポジトリ>/packages/dsh-i18n-ja
link:<このリポジトリ>/packages/dsh-i18n-ja-core
```

## 仕組み

- `ctx.locale.addLanguage({ id: "ja", label: "日本語", fallback: "en" })` で言語を登録
- 各名前空間ごとに `ctx.locale.register(ns, "ja", dict)` で辞書を登録
- 未翻訳キーは **ns → common → en → キー名** のフォールバックチェーンで英語表示になるため、翻訳が一部でも安全

## 翻訳パイプライン（再ビルド手順）

各パッケージの `tools/` に再現手順のスクリプトが入っています:

1. `tools/asar-extract.mjs` — DSH の `app.asar` からロケール辞書を含むバンドルを抽出
2. `tools/extract-locale.mjs` — 名前空間ごとの `out/locales.json` / `out/src/<ns>.json` を抽出
3. `out/src → out/ja` を翻訳（用語集・文体ルールは `out/GLOSSARY.md`）
4. `node tools/build-client.mjs` — `lib/client.js`（Client バンドル）を生成

翻訳の品質チェック: 全キーで en と ja のキー集合一致・`{...}` プレースホルダ一致を機械検証しています。

## npm 公開（Trusted Publishing）

初回リリース（v0.1.0）は OTP 付きのローカル publish で行い、以後は npm の Trusted Publishing（GitHub OIDC）で公開する設計です。トークン不要で、公開はタグ push のみ:

```
# packages/*/package.json の version を上げ
git tag v<version> && git push origin v<version>
```

→ `.github/workflows/publish.yml` が両パッケージを `npm publish --provenance` で公開します。
（信頼設定は `npm trust github <pkg> --repo SatukiSuto-HPC/dsh-i18n-ja --file publish.yml --allow-publish` を 1 回実行して登録します。2FA 認証が対話的に必要です）

## ライセンス

Apache-2.0（各パッケージに `LICENSE` を同梱）。
翻訳文は DSH 本体の英中ロケール文字列から導出した派生物です。DSH / DeepSeek は各権利者の商標です。
