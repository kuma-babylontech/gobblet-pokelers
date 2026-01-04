# Gobblet Pokelers

Gobblet Gobblers × ポケモン初代御三家（進化系対応）の2人対戦ボードゲーム

## ゲーム概要

3×3の盤面で、自分の駒を縦・横・斜めに3つ揃えると勝利。
大きい駒で小さい駒を覆うことができる戦略的なボードゲームです。

### 使用ポケモン

| ライン | 小(S) | 中(M) | 大(L) | 能力 |
|--------|-------|-------|-------|------|
| 草 | フシギダネ | フシギソウ | フシギバナ | やどりぎのタネ |
| 炎 | ヒトカゲ | リザード | リザードン | ひのこ |
| 水 | ゼニガメ | カメール | カメックス | まもる |

### 能力

- **やどりぎのタネ**: 相手の駒を次のターンまで固定
- **ひのこ**: 任意のトップ駒を手札に戻す
- **まもる**: 自分の駒にバリアを付与（覆われなくなる）

---

## 起動方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

開発サーバー: http://localhost:5173/gobblet-pokelers/

---

## ファイル構成

```
src/
├── main.tsx                 # エントリーポイント
├── App.tsx                  # メインアプリケーション
├── App.css                  # アプリスタイル
├── index.css                # グローバルスタイル
├── vite-env.d.ts            # Vite型定義
├── types/
│   └── index.ts             # 型定義
├── engine/
│   └── gameEngine.ts        # ゲームロジック
├── api/
│   └── pokeApi.ts           # PokeAPI連携
└── components/
    ├── GameBoard.tsx/css    # ゲームボード
    ├── PieceComponent.tsx/css # 駒
    ├── Reserve.tsx/css      # 手札
    ├── AbilityPanel.tsx/css # 能力パネル
    ├── LineSelector.tsx/css # ライン選択
    └── GameOver.tsx/css     # ゲーム終了
```

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 18 |
| 言語 | TypeScript |
| ビルドツール | Vite 6 |
| API | PokeAPI v2 |
| デプロイ | GitHub Pages |
