# リポジトリ構造定義書 (Repository Structure Document)

## 1. 文書情報

| 項目 | 内容 |
|---|---|
| プロダクト | CanvasDoc（仮称） |
| リポジトリ形式 | 単一SPA・単一npmパッケージ |
| 参照PRD | `docs/product-requirements.md` |
| 参照機能設計 | `docs/functional-design.md` |
| 参照アーキテクチャ | `docs/architecture.md` |
| 参照開発規約 | `docs/development-guidelines.md` |

## 2. 基本方針

- アーキテクチャのUI、Application、Domain、Infrastructureをトップレベルディレクトリとして表現する。
- Domainを最も内側に置き、外部ライブラリやブラウザAPIから隔離する。
- アプリ起動と依存注入は`src/app/`だけで行う。
- 本番コードとテストコードを分け、テスト種別ごとに実行・設定できるようにする。
- `utils/`、`helpers/`、`misc/`、`common/`のような責務が曖昧なディレクトリを作らない。
- ルートはツール設定とプロジェクト入口だけにし、機能コードを置かない。
- MVPは単一パッケージで開始し、必要性が実証されるまでモノレポ化しない。

## 3. 全体構造

```text
EditorTool/
├── .agents/                         # 開発支援用スキル（アプリには含めない）
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   └── feature-request.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release-check.yml
│   └── pull_request_template.md
├── .husky/
│   └── pre-commit
├── .steering/                       # 作業単位の一時的な計画（Git除外）
├── docs/
│   ├── ideas/
│   │   └── initial-requirements.md
│   ├── decisions/
│   │   └── README.md
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md
│   └── development-guidelines.md
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── scripts/
│   ├── checkArchitecture.mjs
│   ├── checkBundleSize.mjs
│   └── generatePerformanceFixture.ts
├── src/
│   ├── app/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── ui/
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   ├── performance/
│   ├── fixtures/
│   └── support/
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

`coverage/`、`dist/`、`node_modules/`、`playwright-report/`、`test-results/`は生成物のため構造図へ含めず、Gitから除外する。

## 4. `src/`の構造

```text
src/
├── app/
│   ├── composition/
│   │   ├── createApplication.ts
│   │   └── createInfrastructure.ts
│   ├── providers/
│   │   ├── ApplicationProvider.tsx
│   │   └── ErrorBoundary.tsx
│   ├── App.tsx
│   └── main.tsx
├── domain/
│   ├── document/
│   │   ├── models/
│   │   │   ├── canvasDocument.ts
│   │   │   ├── documentElement.ts
│   │   │   ├── exportLayout.ts
│   │   │   ├── imageAsset.ts
│   │   │   └── richTextDocument.ts
│   │   ├── operations/
│   │   │   ├── createDocument.ts
│   │   │   ├── modifyDocumentTree.ts
│   │   │   ├── modifyElements.ts
│   │   │   └── modifyExportLayout.ts
│   │   ├── validation/
│   │   │   ├── documentInvariants.ts
│   │   │   └── validationIssue.ts
│   │   └── index.ts
│   ├── geometry/
│   │   ├── alignElements.ts
│   │   ├── calculateConnectorPath.ts
│   │   ├── coordinateTransform.ts
│   │   ├── geometryTypes.ts
│   │   └── index.ts
│   ├── export/
│   │   ├── models/
│   │   │   ├── exportBundle.ts
│   │   │   └── renderNode.ts
│   │   ├── createExportProjection.ts
│   │   ├── createSvgModel.ts
│   │   ├── normalizeHeadingLevels.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── result.ts
│   │   ├── brandedTypes.ts
│   │   ├── exhaustive.ts
│   │   └── index.ts
│   └── index.ts
├── application/
│   ├── commands/
│   │   ├── elements/
│   │   │   ├── CreateElementCommand.ts
│   │   │   ├── DeleteElementsCommand.ts
│   │   │   ├── MoveElementsCommand.ts
│   │   │   └── UpdateElementCommand.ts
│   │   ├── document-tree/
│   │   │   ├── CreateSectionCommand.ts
│   │   │   ├── DeleteDocumentNodeCommand.ts
│   │   │   └── MoveSectionCommand.ts
│   │   ├── export-layout/
│   │   │   ├── CreateExportGroupCommand.ts
│   │   │   └── MoveExportNodeCommand.ts
│   │   ├── CommandManager.ts
│   │   ├── EditorCommand.ts
│   │   └── index.ts
│   ├── use-cases/
│   │   ├── createNewDocument.ts
│   │   ├── openDocument.ts
│   │   ├── saveDocument.ts
│   │   ├── exportDocument.ts
│   │   ├── loadRecovery.ts
│   │   └── discardRecovery.ts
│   ├── ports/
│   │   ├── ArchivePackager.ts
│   │   ├── Clock.ts
│   │   ├── DocumentFileGateway.ts
│   │   ├── ExportRenderer.ts
│   │   ├── HtmlSanitizer.ts
│   │   ├── IdGenerator.ts
│   │   └── RecoveryRepository.ts
│   ├── services/
│   │   ├── AutoSaveService.ts
│   │   ├── DocumentSerializer.ts
│   │   ├── DocumentValidator.ts
│   │   └── ExportCoordinator.ts
│   ├── store/
│   │   ├── createEditorStore.ts
│   │   ├── documentSlice.ts
│   │   ├── persistenceSlice.ts
│   │   ├── selectors.ts
│   │   ├── uiSlice.ts
│   │   └── types.ts
│   ├── errors/
│   │   ├── applicationError.ts
│   │   └── errorCodes.ts
│   ├── EditorFacade.ts
│   └── index.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── IndexedDbRecoveryRepository.ts
│   │   ├── indexedDbSchema.ts
│   │   └── migrations/
│   │       └── README.md
│   ├── files/
│   │   ├── BrowserDocumentFileGateway.ts
│   │   ├── createDownload.ts
│   │   ├── decodeDataUrl.ts
│   │   └── normalizeFileName.ts
│   ├── export/
│   │   ├── renderers/
│   │   │   ├── HeadingRenderer.ts
│   │   │   ├── ImageRenderer.ts
│   │   │   ├── LinkRenderer.ts
│   │   │   ├── RichTextRenderer.ts
│   │   │   ├── ShapeRenderer.ts
│   │   │   ├── TableRenderer.ts
│   │   │   └── rendererRegistry.ts
│   │   ├── BrowserHtmlRenderer.ts
│   │   ├── JsZipArchivePackager.ts
│   │   ├── createExportCss.ts
│   │   ├── createSingleHtml.ts
│   │   └── createZipBundle.ts
│   ├── security/
│   │   ├── DomPurifyHtmlSanitizer.ts
│   │   ├── sanitizeRichText.ts
│   │   └── validateExternalUrl.ts
│   ├── browser/
│   │   ├── BrowserClock.ts
│   │   ├── CryptoIdGenerator.ts
│   │   ├── imageDecoder.ts
│   │   └── objectUrlRegistry.ts
│   ├── schemas/
│   │   ├── canvasDocumentFileSchema.ts
│   │   ├── documentElementSchema.ts
│   │   ├── richTextSchema.ts
│   │   └── schemaVersion.ts
│   ├── workers/
│   │   ├── README.md
│   │   └── workerMessages.ts
│   └── index.ts
├── ui/
│   ├── features/
│   │   ├── application-shell/
│   │   │   ├── ApplicationShell.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── document-tree/
│   │   │   ├── DocumentTree.tsx
│   │   │   ├── DocumentTreeItem.tsx
│   │   │   └── useDocumentTreeActions.ts
│   │   ├── canvas-editor/
│   │   │   ├── elements/
│   │   │   │   ├── ConnectorNode.tsx
│   │   │   │   ├── HeadingNode.tsx
│   │   │   │   ├── ImageNode.tsx
│   │   │   │   ├── LinkNode.tsx
│   │   │   │   ├── RichTextNode.tsx
│   │   │   │   ├── ShapeNode.tsx
│   │   │   │   └── TableNode.tsx
│   │   │   ├── CanvasEditor.tsx
│   │   │   ├── CanvasStage.tsx
│   │   │   ├── SelectionTransformer.tsx
│   │   │   ├── useCanvasInteractions.ts
│   │   │   └── useCanvasViewport.ts
│   │   ├── property-inspector/
│   │   │   ├── editors/
│   │   │   │   ├── BorderEditor.tsx
│   │   │   │   ├── ColorEditor.tsx
│   │   │   │   ├── FrameEditor.tsx
│   │   │   │   └── TextStyleEditor.tsx
│   │   │   ├── ElementPropertyPanel.tsx
│   │   │   └── PropertyInspector.tsx
│   │   ├── export-outline/
│   │   │   ├── ExportGroupItem.tsx
│   │   │   ├── ExportNodeItem.tsx
│   │   │   └── ExportOutline.tsx
│   │   ├── preview/
│   │   │   ├── ExportPreview.tsx
│   │   │   └── useExportPreview.ts
│   │   ├── rich-text/
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── richTextExtensions.ts
│   │   └── file-operations/
│   │       ├── ExportDialog.tsx
│   │       ├── FileMenu.tsx
│   │       ├── LoadErrorDialog.tsx
│   │       └── RecoveryDialog.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── IconButton.tsx
│   │   ├── NumberField.tsx
│   │   ├── ResizablePanel.tsx
│   │   ├── SelectField.tsx
│   │   └── TextField.tsx
│   ├── hooks/
│   │   ├── useGlobalShortcuts.ts
│   │   ├── useObjectUrl.ts
│   │   └── useUnsavedChangesWarning.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── tokens.css
│   │   └── export-preview.css
│   ├── accessibility/
│   │   ├── focusManagement.ts
│   │   └── keyboardNavigation.ts
│   └── index.ts
└── vite-env.d.ts
```

この構造は実装予定を示す。機能が存在しない段階で空ディレクトリや空のbarrel fileを先に作らない。各ファイルは該当機能の実装時に追加する。

## 5. レイヤーディレクトリ

### 5.1 `src/domain/`

**役割**: CanvasDoc固有のモデル、不変条件、純粋な計算、出力用Projectionを配置する。

**配置するもの**:

- 文書、章、節、要素、アセット、出力レイアウトの型
- 文書ツリー・要素・出力レイアウト操作
- 座標、整列、コネクタ経路などの幾何計算
- Domain検証ルール
- HTML出力前の技術非依存モデル

**配置しないもの**:

- React Component、Hook、Zustand Store
- Konva/Tiptapのランタイム型
- Zodによる外部JSON解析
- IndexedDB、File API、DOM、Blob、JSZip
- UI表示文言と通知

**依存可能**: `src/domain/`内、TypeScript標準機能  
**依存禁止**: `application/`、`infrastructure/`、`ui/`、`app/`

`domain/shared/`はDomain内で複数サブドメインから使う型だけを置く。文字列処理を何でも集める場所にしない。

### 5.2 `src/application/`

**役割**: ユースケース、Command、状態管理、Port、処理調停を配置する。

**配置するもの**:

- `EditorFacade`
- 新規作成、読込、保存、復元、出力ユースケース
- Undo/Redo可能なCommand
- Infrastructureが実装するPort interface
- Zustand Store、slice、selector
- Application Errorとエラーコード

**配置しないもの**:

- React JSX、Konva Node、Tiptap Editor
- IndexedDB、JSZip、DOMPurifyの具象呼び出し
- Domainモデルの不変条件そのもの
- ダイアログやトースト表示

**依存可能**: `domain/`、Application内で定義したPort、Zustand、Immer  
**依存禁止**: `ui/`、`app/`、`infrastructure/`の具象実装

`use-cases/`は利用者またはアプリ起動から開始する処理、`services/`は複数ユースケースから共有する調停、`commands/`はUndo/Redo対象の文書変更に使う。

### 5.3 `src/infrastructure/`

**役割**: Application Portの実装と、ブラウザ・外部ライブラリへの接続を配置する。

**配置するもの**:

- IndexedDB Adapter
- File API、Blob、ダウンロード
- Zodスキーマ
- DOMPurifyサニタイザー
- HTML要素Renderer、CSS、単一HTML生成
- JSZipパッケージャー
- Browser Clock、UUID、画像デコード
- 必要になったWeb Worker

**配置しないもの**:

- React Component
- Zustand Storeへの直接書込み
- Domainの不変条件
- 利用者操作の順序を決めるユースケース

**依存可能**: `domain/`、`application/ports/`、外部ライブラリ、ブラウザAPI  
**依存禁止**: `ui/`、`app/`、Application Store内部

`infrastructure/index.ts`はComposition Rootが必要とする具象クラスだけをexportし、内部の小関数は公開しない。

### 5.4 `src/ui/`

**役割**: React UI、Konva/Tiptap Adapter、画面固有の状態と操作を配置する。

**配置するもの**:

- 機能単位のComponentとHook
- キャンバス要素描画
- プロパティ入力、文書ツリー、出力アウトライン
- リッチテキスト編集面
- 共通の視覚Component
- CSS、デザイントークン、フォーカス管理

**配置しないもの**:

- Domainルール
- IndexedDBやZIP生成
- JSON読込・出力の調停
- ブラウザダウンロードの具象処理

**依存可能**: `application/`のFacade・selector・公開DTO、`domain/`の読み取り専用型、UIライブラリ  
**依存禁止**: `infrastructure/`、`app/composition/`

`features/`は利用者が認識できる編集領域ごとに分ける。`components/`には2機能以上で実際に再利用する、CanvasDoc固有のビジネス判断を持たない部品だけを置く。

### 5.5 `src/app/`

**役割**: アプリの起動、依存注入、最上位Provider、Composition Rootを配置する。

**配置するもの**:

- `main.tsx`と`App.tsx`
- PortとAdapterの接続
- Store、Facade、CommandManagerの生成
- Error Boundaryと最上位Provider

**配置しないもの**:

- Domainルール
- 個別機能Componentの実装
- 再利用するInfrastructure処理
- 文書モデル定義

**依存可能**: すべてのレイヤー  
**依存禁止**: なし。ただし依存を接続するだけとし、ビジネスロジックを持たない

## 6. 機能ディレクトリの規則

### 6.1 UI機能

UI機能は`src/ui/features/<feature-name>/`へ置く。機能内でのみ使うComponent、Hook、型、スタイルはその機能へ同居させる。

```text
features/export-outline/
├── ExportOutline.tsx
├── ExportGroupItem.tsx
├── ExportNodeItem.tsx
├── useExportOutlineActions.ts
└── exportOutline.css
```

次の場合だけ`ui/components/`または`ui/hooks/`へ昇格する。

- 2つ以上の機能から利用される。
- 機能固有の文言・Domain判断を持たない。
- 公開propsを小さく安定して定義できる。

将来使いそうという理由だけで共有化しない。

### 6.2 Domain機能

Domainは技術要素ではなく、意味のある領域で分ける。

- `document/`: 文書集約と編集規則
- `geometry/`: キャンバス座標と図形計算
- `export/`: 出力Projectionと技術非依存の描画モデル
- `shared/`: Domain全体で共有する最小の基本型

Domain内の操作からHTML DOM、Konva、Zodなどの技術名を見せない。

### 6.3 Application Command

Commandは変更対象でサブディレクトリを分ける。

- `commands/elements/`
- `commands/document-tree/`
- `commands/export-layout/`

Command間で共通化が必要な処理は、Domain操作へ抽出する。Command用の巨大な`base/`や`utils/`を作らない。

## 7. テスト構造

```text
tests/
├── unit/
│   ├── domain/
│   │   ├── document/
│   │   ├── geometry/
│   │   └── export/
│   ├── application/
│   │   ├── commands/
│   │   ├── services/
│   │   └── use-cases/
│   ├── infrastructure/
│   │   ├── schemas/
│   │   ├── export/
│   │   └── security/
│   └── ui/
│       ├── components/
│       └── features/
├── integration/
│   ├── persistence/
│   │   ├── autosave.test.ts
│   │   └── recovery.test.ts
│   ├── document-files/
│   │   ├── save-load-roundtrip.test.ts
│   │   └── invalid-file-preservation.test.ts
│   ├── export/
│   │   ├── single-html.test.ts
│   │   └── zip-export.test.ts
│   └── editor/
│       ├── command-history.test.ts
│       └── outline-synchronization.test.ts
├── e2e/
│   ├── document-editing.spec.ts
│   ├── document-persistence.spec.ts
│   ├── document-export.spec.ts
│   ├── recovery.spec.ts
│   └── accessibility.spec.ts
├── security/
│   ├── fixtures/
│   │   ├── malicious-rich-text.json
│   │   ├── prototype-pollution.json
│   │   └── dangerous-urls.json
│   ├── html-injection.test.ts
│   ├── svg-injection.test.ts
│   └── zip-path.test.ts
├── performance/
│   ├── canvas-interaction.perf.spec.ts
│   ├── document-load.perf.spec.ts
│   └── export.perf.spec.ts
├── fixtures/
│   ├── documents/
│   │   ├── minimal.canvasdoc.json
│   │   ├── all-elements.canvasdoc.json
│   │   └── invalid/
│   ├── images/
│   │   ├── sample.png
│   │   └── sample.webp
│   └── performance/
│       └── README.md
└── support/
    ├── builders/
    │   ├── documentBuilder.ts
    │   └── elementBuilder.ts
    ├── fakes/
    │   ├── FakeClock.ts
    │   ├── FakeDocumentFileGateway.ts
    │   ├── FakeIdGenerator.ts
    │   └── InMemoryRecoveryRepository.ts
    ├── assertions/
    │   ├── expectDocumentsEqual.ts
    │   └── expectSafeHtml.ts
    └── setup/
        ├── integrationSetup.ts
        └── unitSetup.ts
```

### 7.1 Unit

`tests/unit/`は`src/`の論理構造を反映する。ファイル名は対象ファイル名に`.test.ts`または`.test.tsx`を付ける。

```text
src/domain/geometry/alignElements.ts
tests/unit/domain/geometry/alignElements.test.ts
```

一つのテストファイルが複数レイヤーの実装を同時に起動する場合はUnitではなくIntegrationへ置く。

### 7.2 Integration

`tests/integration/`は実装ファイルの構造ではなく、Portや複数Componentをまたぐ振る舞いで分ける。IndexedDB、ファイル往復、ExportBundle、StoreとCommandの接続を対象にする。

### 7.3 E2E

`tests/e2e/`はユーザーシナリオ単位とし、`.spec.ts`を使用する。page objectが必要になった場合は`tests/support/pages/`へ置き、テスト内だけで使用する。

### 7.4 Security・Performance

SecurityとPerformanceは通常のUnit/E2Eから独立して実行できるよう専用ディレクトリに置く。攻撃文字列や大規模fixtureを通常テストへ混ぜず、CIジョブを分ける。

### 7.5 Fixture

- 実ユーザー文書や機密データを置かない。
- UUIDと日時を固定し、期待値を決定的にする。
- JSONスキーマ変更時にMigrationテスト対象を残す。
- バイナリ画像には出所とライセンスをREADMEへ記載する。
- 50MBの性能fixtureはGitへ直接置かず、決定的な生成スクリプトで作成する。

## 8. ファイル配置規則

| ファイル種別 | 配置先 | 命名規則 | 例 |
|---|---|---|---|
| Domainモデル | `src/domain/<area>/models/` | camelCase.ts | `documentElement.ts` |
| Domain関数 | `src/domain/<area>/`または`operations/` | 動詞始まりcamelCase.ts | `createExportProjection.ts` |
| Command | `src/application/commands/<area>/` | PascalCase.ts | `MoveElementsCommand.ts` |
| Use case | `src/application/use-cases/` | 動詞始まりcamelCase.ts | `openDocument.ts` |
| Port | `src/application/ports/` | PascalCase.ts | `RecoveryRepository.ts` |
| Application Service | `src/application/services/` | PascalCase.ts | `AutoSaveService.ts` |
| Adapter | `src/infrastructure/<technology>/` | PascalCase.ts | `IndexedDbRecoveryRepository.ts` |
| Zodスキーマ | `src/infrastructure/schemas/` | camelCase + Schema.ts | `documentElementSchema.ts` |
| React Component | `src/ui/features/`または`components/` | PascalCase.tsx | `ExportOutline.tsx` |
| Hook | 使用機能の近く、共有時`ui/hooks/` | use + camelCase.ts | `useCanvasViewport.ts` |
| CSS | 使用Component/機能の近く、全体は`ui/styles/` | kebab-case.css | `export-outline.css` |
| Unit test | `tests/unit/` | 対象名.test.ts(x) | `alignElements.test.ts` |
| Integration | `tests/integration/<scenario>/` | kebab-case.test.ts | `save-load-roundtrip.test.ts` |
| E2E | `tests/e2e/` | kebab-case.spec.ts | `document-export.spec.ts` |
| ADR | `docs/decisions/` | NNN-kebab-case.md | `001-client-only-spa.md` |

## 9. 命名規則

### 9.1 ディレクトリ

- すべて小文字のkebab-caseを使用する。
- レイヤー名と集合は複数形または一般的な集合名を使う。
- 機能名は単数・複数より自然な概念名を優先する。
- 曖昧な`misc`、`stuff`、`temp`、`common`、トップレベル`utils`は禁止する。

良い例:

```text
document-tree/
export-layout/
use-cases/
property-inspector/
```

悪い例:

```text
misc/
helpers/
other/
shared-utils/
```

`shared/`は共有範囲が明確なレイヤー内にのみ許可する。共有対象が一つしかない時点では作らない。

### 9.2 ファイル

- React Component、クラス、Port、Command: PascalCase
- 関数、モデル、スキーマ、Hook: camelCase
- テストシナリオとCSS: kebab-case
- 定数専用ファイルを作る場合: 意味のあるcamelCaseを使用し、UPPER_SNAKE_CASEは変数名だけに使う

同じ役割に複数の規則を混在させない。

## 10. 公開APIとbarrel file

各レイヤーまたは明確な機能境界の`index.ts`だけを公開入口とする。

```typescript
// src/domain/document/index.ts
export type {
  CanvasDocument,
  Chapter,
  Section,
} from "./models/canvasDocument";
export type { DocumentElement } from "./models/documentElement";
export { createDocument } from "./operations/createDocument";
```

ルール:

- `export *`は禁止し、公開対象を明示する。
- テスト専用関数を本番barrelからexportしない。
- 内部ファイル間では同一ディレクトリのbarrelを経由せず、具体ファイルをimportして循環を避ける。
- `src/domain/index.ts`のような最上位barrelは、外側のレイヤーへ許可する安定APIだけを公開する。
- UI機能の内部Componentを`src/ui/index.ts`から公開しない。

## 11. パスエイリアス

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@ui/*": ["src/ui/*"],
      "@test/*": ["tests/support/*"]
    }
  }
}
```

- 本番コードから`@test/*`をimportしてはならない。
- 3階層以上の相対importは禁止する。
- 同一機能内の近接ファイルは`./`を使用してよい。
- エイリアスはTypeScript、Vite、Vitest、Playwright、ESLintで同じ定義を共有する。

## 12. 依存関係ルール

### 12.1 許可マトリクス

| Import元＼Import先 | Domain | Application | Infrastructure | UI | App |
|---|---:|---:|---:|---:|---:|
| Domain | ○ | × | × | × | × |
| Application | ○ | ○ | × | × | × |
| Infrastructure | ○ | Portのみ | ○ | × | × |
| UI | 読取型 | 公開APIのみ | × | ○ | × |
| App | ○ | ○ | ○ | ○ | ○ |

InfrastructureからApplicationへのimportは`application/ports/`と、Adapterが返す公開DTOだけに限定する。ApplicationのStore、CommandManager、具象Serviceへ依存してはならない。

### 12.2 Enforcement

依存ルールは人手だけに頼らず、次で自動検査する。

- ESLintのimport制約ルールで層間importを禁止する。
- `scripts/checkArchitecture.mjs`で許可マトリクスを検査する。
- 循環依存検査をCIへ追加する。
- 各レイヤーのbarrelが公開対象だけをexportしているかレビューする。

違反を一時許可するコメントは禁止する。必要な依存であれば、Port抽出またはアーキテクチャ変更として解決する。

### 12.3 循環依存

循環依存は同一レイヤー内も含めて禁止する。

```typescript
// 禁止: Application Service同士が相互import
// AutoSaveService.ts -> DocumentSerializer.ts
// DocumentSerializer.ts -> AutoSaveService.ts
```

解決方法:

1. 共通する純粋ロジックをDomainへ抽出する。
2. 呼び出し順をUse caseへ移す。
3. 相互参照をPortへ反転する。
4. 一つの責務ならモジュールを統合する。

## 13. Composition Root

具象依存の生成は`src/app/composition/`だけで行う。

```typescript
export function createApplication(): ApplicationDependencies {
  const clock = new BrowserClock();
  const idGenerator = new CryptoIdGenerator();
  const recoveryRepository = new IndexedDbRecoveryRepository();
  const fileGateway = new BrowserDocumentFileGateway();
  const sanitizer = new DomPurifyHtmlSanitizer();
  const renderer = new BrowserHtmlRenderer(sanitizer);
  const packager = new JsZipArchivePackager();

  return createEditorFacade({
    clock,
    idGenerator,
    recoveryRepository,
    fileGateway,
    renderer,
    packager,
  });
}
```

UI Component内で`new IndexedDbRecoveryRepository()`のような生成をしない。テストは同じ生成関数へFake Portを注入できる形にする。

## 14. 設定ファイル

### 14.1 ルートに置くもの

| ファイル | 役割 |
|---|---|
| `package.json` | npm scripts、依存、メタデータ |
| `package-lock.json` | 解決済み依存の固定 |
| `vite.config.ts` | ViteとVitest共通設定 |
| `playwright.config.ts` | E2Eブラウザ・artifact設定 |
| `eslint.config.js` | Flat Config、層間import規則 |
| `.prettierrc.json` | フォーマット |
| `.editorconfig` | エディタ共通設定 |
| `tsconfig.json` | Project References入口 |
| `tsconfig.app.json` | ブラウザアプリ型チェック |
| `tsconfig.node.json` | Vite設定・scripts用 |
| `index.html` | Vite HTML入口 |

ツールが標準で探索する設定はルートへ置く。`config/`ディレクトリを作って設定を移動しない。

### 14.2 アプリ設定

MVPは実行時設定を持たない。既定テーマ、サイズ上限、履歴件数などのDomain/Application定数は、それを所有する機能の近くへ置く。

```text
src/application/commands/historyLimits.ts
src/domain/document/models/documentLimits.ts
src/ui/styles/tokens.css
```

秘密情報は不要である。将来`.env`を追加する場合、公開可能なビルド設定だけを`.env.example`へ記載する。

## 15. `docs/`の構造

| ファイル・ディレクトリ | 内容 |
|---|---|
| `ideas/initial-requirements.md` | 壁打ちで決めた初期要求 |
| `product-requirements.md` | PRD、要求の正 |
| `functional-design.md` | 機能、データ、UI、処理設計 |
| `architecture.md` | 技術選定、層、品質、ADR概要 |
| `repository-structure.md` | 本文書、配置と依存の正 |
| `development-guidelines.md` | 実装、Git、レビュー、CI規約 |
| `decisions/` | 個別のArchitecture Decision Record |

ADRは次の命名と構成にする。

```text
docs/decisions/
├── README.md
├── 001-client-only-spa.md
├── 002-typed-json-source-of-truth.md
└── 003-konva-canvas-rendering.md
```

ADR番号は3桁の連番とし、削除せずStatusを`Superseded`へ変更する。

## 16. `scripts/`の規則

`scripts/`には開発・CIを補助する、複数コマンドから再利用される処理だけを置く。

| スクリプト | 役割 |
|---|---|
| `checkArchitecture.mjs` | 層間importと循環依存の検査 |
| `checkBundleSize.mjs` | production buildのサイズ閾値検査 |
| `generatePerformanceFixture.ts` | 大規模fixtureの決定的生成 |

- 一度しか使わない手動処理を保存しない。
- アプリのビジネスロジックをscriptsへ置かない。
- PowerShell、Bashへ同じロジックを二重実装せず、NodeでOS非依存にする。
- スクリプトの引数、終了コード、生成物をREADMEまたはTSDocへ記載する。
- 失敗時は非0で終了し、CIが検出できるようにする。

## 17. `.github/`の構造

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── bug-report.yml
│   └── feature-request.yml
├── workflows/
│   ├── ci.yml
│   └── release-check.yml
└── pull_request_template.md
```

- `ci.yml`: PRでformat、lint、typecheck、unit/integration、coverage、build、Chromium smokeを実行する。
- `release-check.yml`: main/releaseで全ブラウザ、security、performance、依存監査を実行する。
- Workflow内へ長いシェル処理を書かず、`npm scripts`または`scripts/`を呼ぶ。
- Actionはメジャータグだけでなく、運用開始時に信頼するバージョンまたはcommit SHAへ固定する方針を決める。

## 18. `.steering/`の構造

作業指示ごとの一時的な計画を次の形式で置く。

```text
.steering/
└── YYYYMMDD-task-name/
    ├── requirements.md
    ├── design.md
    └── tasklist.md
```

- ディレクトリ名は日付とkebab-caseの作業名にする。
- `requirements.md`: 今回の要求、対象・対象外、受け入れ条件
- `design.md`: 変更箇所、データフロー、判断
- `tasklist.md`: 実装・検証タスクと完了状態
- 一時作業記録のためGitから除外する。
- 恒久的な決定は`docs/`、Issue、ADRへ転記する。

## 19. 除外設定

### 19.1 `.gitignore`

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
.steering/

.env
.env.*
!.env.example

*.log
*.tsbuildinfo
.DS_Store
Thumbs.db
```

`package-lock.json`、テストfixture、設計文書は除外しない。個人の文書ファイル（`*.canvasdoc.json`）はルートで一律除外せず、テストfixtureだけを明示配置する。誤コミット防止が必要な場合は個人用global gitignoreを利用する。

### 19.2 `.prettierignore`

```text
node_modules/
dist/
coverage/
playwright-report/
test-results/
package-lock.json
.agents/
```

### 19.3 ESLint対象

ESLintは`src/`、`tests/`、`scripts/`、ルートのTypeScript/JavaScript設定を対象にする。`dist/`、`coverage/`、レポート、`.agents/`を除外する。

## 20. 生成物

| 生成物 | 出力先 | Git管理 | 生成元 |
|---|---|---|---|
| 本番SPA | `dist/` | 除外 | `npm run build` |
| カバレッジ | `coverage/` | 除外 | `npm run test:coverage` |
| Playwright report | `playwright-report/` | 除外 | `npm run test:e2e` |
| E2E artifact | `test-results/` | 除外 | Playwright |
| 性能fixture | `tests/fixtures/performance/generated/` | 除外 | fixture生成script |
| TypeScript build info | `*.tsbuildinfo` | 除外 | `tsc -b` |

ビルド成果物をソースと同じ場所へ生成しない。CIでは必要な生成物をartifactとして期限付き保存する。

## 21. スケーリング戦略

### 21.1 ファイル数

次を分割検討の目安にする。

- 一つのディレクトリに実装ファイルが10個を超える。
- 一つのファイルが300行を超える。
- 一つの機能に独立した状態、UI、テストが揃う。
- 別の変更理由を持つコードが同じモジュールに混在する。

500行を超える実装ファイルは、生成コードまたは宣言的な定義を除き分割を必須とする。

### 21.2 新要素型

新要素を追加するときは、配置を次の順に確認する。

```text
domain/document/models/          型
domain/document/operations/      編集規則
infrastructure/schemas/          外部JSONスキーマ
application/commands/elements/   Undo可能な変更
ui/features/canvas-editor/       キャンバス描画
ui/features/property-inspector/  プロパティUI
infrastructure/export/renderers/ HTML/SVG出力
tests/                            各層・E2E
```

必要な場所が多いことを理由に層を統合しない。網羅性を検出する型マップとテストを使用する。

### 21.3 モノレポ化の条件

次のいずれかが実際に発生するまで単一パッケージを維持する。

- エディタ以外の独立して配布するアプリが追加される。
- HTML Rendererを別製品またはCLIから再利用する。
- Worker処理を独立パッケージとして異なるビルド設定で配布する。
- 共有ライブラリに独立したリリース周期が必要になる。

条件を満たした場合は、npm workspacesによる`apps/`と`packages/`を検討し、移行ADRを作成する。

## 22. 禁止パターン

### 22.1 曖昧な共有ディレクトリ

```text
src/utils/
src/helpers/
src/misc/
src/common/
```

処理の所有者が不明になるため禁止する。たとえばファイル名正規化は`infrastructure/files/`、座標計算は`domain/geometry/`へ置く。

### 22.2 技術依存の逆流

```typescript
// 禁止: DomainがKonva型に依存
import type { Vector2d } from "konva/lib/types";

export function alignElements(points: Vector2d[]): Vector2d[] {
  // ...
}
```

Domain独自の`Point`型へ変換してから呼び出す。

### 22.3 ルートへの機能コード

```text
EditorTool/
├── DocumentService.ts
├── ExportHelper.ts
└── Canvas.tsx
```

ルートには入口と設定だけを置き、機能コードは所有レイヤーへ配置する。

### 22.4 巨大barrel

`src/index.ts`から全内部実装を再exportしない。依存範囲が見えなくなり、循環依存とバンドル混入を招く。

### 22.5 テスト専用コードの本番混入

`src/`から`tests/`、`@test/*`をimportしない。BuilderやFakeは`tests/support/`に置く。本番でも必要な生成関数だけDomainへ移す。

## 23. 構造変更プロセス

次の変更はリポジトリ構造の更新を必要とする。

- トップレベルまたはレイヤーディレクトリの追加・名称変更
- 依存許可マトリクスの変更
- 新しいテスト種別または生成物の追加
- モノレポ化
- 配布アプリ、Worker、共有パッケージの分離
- 設定ファイル配置方針の変更

変更手順:

1. Issueで必要性と代替案を整理する。
2. `docs/architecture.md`への影響を確認する。
3. 必要ならADRを作成する。
4. 本文書の構造図、依存表、配置規則を更新する。
5. import制約、パスエイリアス、CIを同時に更新する。
6. 移動後に型チェック、循環依存検査、全テスト、ビルドを実行する。

## 24. レビューチェックリスト

- [ ] 各ディレクトリが一つの明確な責務を持つ
- [ ] UI、Application、Domain、Infrastructureが物理的に分離されている
- [ ] Domainが外側のレイヤーや外部UI技術へ依存していない
- [ ] ApplicationがInfrastructure具象実装へ依存していない
- [ ] UIがInfrastructureを直接参照していない
- [ ] Composition Root以外で具象依存を生成していない
- [ ] 循環依存がない
- [ ] テストの種類と配置が明確である
- [ ] Fixtureに実データや機密情報がない
- [ ] 曖昧な共有ディレクトリがない
- [ ] 設定・生成物・文書の配置が決まっている
- [ ] 新要素型や将来の規模拡大に対応できる

