# CanvasDoc

CanvasDocは、無限キャンバス上の自由配置と、意味的でレスポンシブなHTML文書出力を
両立するクライアント完結型のブラウザ文書エディターです。

## 必要環境

- Node.js 24 LTS
- npm 11.x
- Git 2.x
- Chromium（E2Eテスト）

Node.jsとnpmの系列が一致しない場合、依存インストールは`.npmrc`の`engine-strict`により
失敗します。

## セットアップ

```powershell
git clone https://github.com/ry825/Canvas.git
Set-Location Canvas
git switch develop
npm ci
npx playwright install chromium
npm run dev
```

開発サーバーは、既定でViteが表示するローカルURLから開きます。

## 主要コマンド

| コマンド                 | 用途                                       |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | 開発サーバーを起動                         |
| `npm run build`          | TypeScript検査後に本番SPAを生成            |
| `npm run format:check`   | Prettier整形を検査                         |
| `npm run lint`           | ESLint、層間依存、循環依存を検査           |
| `npm run typecheck`      | strict TypeScript Project Referencesを検査 |
| `npm run test:run`       | Unit・Integration testを一回実行           |
| `npm run test:coverage`  | カバレッジ付きでテストを実行               |
| `npm run test:e2e:smoke` | Chromiumの最小起動フローを検証             |

Pull Request前には、CIと同じ順序で次を実行します。

```powershell
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e:smoke
```

## アーキテクチャ

依存方向は`UI → Application → Domain`です。InfrastructureはApplicationのPortを実装し、
具象依存の接続は`src/app/`だけで行います。ESLintと
[`scripts/checkArchitecture.mjs`](scripts/checkArchitecture.mjs)が、層間importと循環依存を
自動検査します。

```text
src/
├── app/             # 起動とComposition Root
├── domain/          # 技術非依存のモデルとルール
├── application/     # ユースケース、Command、Port
├── infrastructure/  # ブラウザAPI・外部ライブラリAdapter
└── ui/              # React UI
```

## 設計文書

- [プロダクト要求](docs/product-requirements.md)
- [機能設計](docs/functional-design.md)
- [アーキテクチャ設計](docs/architecture.md)
- [リポジトリ構造](docs/repository-structure.md)
- [開発ガイドライン](docs/development-guidelines.md)

実装作業は`.steering/`の対象タスクリストに従い、完了条件を満たした項目だけ進捗更新します。
