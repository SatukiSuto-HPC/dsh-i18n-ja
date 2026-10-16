# DSH 日本語ローカライズ 翻訳ルール（全翻訳者共通）

## 入力・出力
- 入力 JSON: `{ "<key>": { "en": "英語文", "zh": "中国語原文" } }`
- 出力 JSON: `{ "<key>": "日本語文" }` — キーは入力と**完全に同一**（追加・削除・改名禁止）。
- 出力は素の JSON オブジェクトのみ。Markdown フェンスやコメント禁止。JSON として parse できること。
- 翻訳の基準は **en**。zh は意味の曖昧さを解消するための参照用。

## 絶対ルール
1. プレースホルダ `{count}` `{time}` `{date}` `{error}` `{name}` `{n}` `{provider}` `{model}` 等の `{...}` は**そのままコピー**（中身を変更しない。文中の位置は動かしてよい）。
2. 改行 `\n`、末尾の `…`、コロン・疑問符などの有無は元の構造を維持。
3. 次の固有名詞・技術語は翻訳しない: DSH, DeepSeek, GitHub, Git, SSH, OAuth, API, MCP, URL, JSON, YAML, CLI, Windows, macOS, Linux, Kimi, GLM, MiniMax, OpenCode, Codex, Claude, OpenAI, npm, pnpm, SQLite, Token Hub（固有名詞の場合）。バッククォート `...` 内のコード・コマンド・ファイル名はそのまま。
4. 数値・通貨記号・パーセントはそのまま。

##文体
- ボタン・メニュー・ラベル・タブ・列見出し → 短い名詞句／体言止め（例: 保存, 削除, 更新, 作成, 設定, リロード）。
- 説明文・エラー文・トースト・ダイアログ本文 → 「です・ます」調。エラーは「〜に失敗しました。〜を確認してください。」形式に寄せる。
- 敬語は一定に。くだけた表現（「〜してくださいね」等）は使わない。

## 用語集（厳守）
| 英語 | 日本語 |
|---|---|
| session | セッション |
| workspace | ワークスペース |
| plugin | プラグイン |
| branch | ブランチ |
| commit | コミット |
| merge | マージ |
| worktree | ワークツリー |
| repository | リポジトリ |
| HEAD | HEAD（そのまま） |
| task | タスク |
| subtask | サブタスク |
| board | ボード |
| backlog | バックログ |
| todo | 未着手 |
| running | 実行中 |
| done | 完了 |
| failed | 失敗 |
| cancel | キャンセル |
| confirm | 確定 |
| save | 保存 |
| delete | 削除 |
| retry | 再試行 |
| refresh | 更新 |
| loading… | 読み込み中… |
| settings | 設定 |
| provider | プロバイダー |
| model | モデル |
| token | トークン |
| usage | 使用量 |
| cost | コスト |
| input / output tokens | 入力 / 出力トークン |
| cache read / write | キャッシュ読み取り / キャッシュ書き込み |
| peak hours | ピーク時間帯 |
| skin | スキン |
| theme | テーマ |
| pet | ペット |
| archive | アーカイブ |
| remote | リモート |
| tunnel | トンネル |
| schedule | スケジュール |
| heartbeat | ハートビート |
| store / marketplace | ストア |
| install | インストール |
| uninstall | アンインストール |
| enable / disable | 有効化 / 無効化 |
| restart | 再起動 |
| update | 更新 |
| license | ライセンス |
| pull / push | プル / プッシュ |
| checkout | チェックアウト |
| stash | ストッシュ |
| diff | diff（そのまま） |
| PR / pull request | PR（そのまま） |
| issue | イシュー |
| draft | ドラフト |
| fork | フォーク |
