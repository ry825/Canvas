# 開発ガイドライン (Development Guidelines)

## 1. 文書情報

| 項目 | 内容 |
|---|---|
| プロダクト | CanvasDoc（仮称） |
| 対象 | MVP以降の開発・レビュー・リリース |
| 参照文書 | `docs/product-requirements.md` |
| 機能設計 | `docs/functional-design.md` |
| アーキテクチャ | `docs/architecture.md` |
| リポジトリ構造 | 未作成。作成後は同文書をパス定義の正とする |

## 2. 目的と適用範囲

本ガイドラインは、CanvasDocの実装品質と開発プロセスを統一するための必須ルールを定義する。TypeScript、React、Konva、Tiptap、Zustand、ブラウザストレージ、HTML/ZIP生成、テストコード、ドキュメント、Git運用を対象とする。

規約と既存設計が衝突する場合は、次の優先順位を適用する。

1. ユーザーが明示した最新の要求
2. `docs/product-requirements.md`
3. `docs/functional-design.md`
4. `docs/architecture.md`
5. `docs/repository-structure.md`（作成後）
6. 本ガイドライン

設計上の決定を変更する実装は、コードだけで完結させず、該当設計書またはADRを同じ変更に含める。

## 3. 基本原則

### 3.1 データ保全を最優先する

- 読み込み、保存、自動保存、HTML/ZIP出力の失敗時に、現在の文書状態を変更しない。
- 外部入力は検証完了まで`unknown`として扱う。
- 複数モデルを変更する操作は、一つのCommandとして原子的に実行する。
- Undoできるべき編集操作を、Storeへ直接書き込まない。

### 3.2 依存方向を守る

```text
UI → Application → Domain
       ↓
Infrastructure（ApplicationのPortを実装）
```

- DomainはReact、Konva、Tiptap、Zustand、IndexedDB、File APIへ依存しない。
- UIはIndexedDB、JSZip、ファイルダウンロードを直接呼び出さない。
- Infrastructureの型をDomainの公開型へ混入させない。
- 層をまたぐ処理はApplicationのユースケースまたはPortを通す。

### 3.3 型と不変条件を設計として扱う

- `any`、無検証の型アサーション、非nullアサーションで設計上の問題を隠さない。
- 文書要素は判別共用体と網羅的分岐で扱う。
- ID、URL、日時など意味の異なる値を、必要に応じてブランド型または専用型で区別する。
- Zodは外部境界の検証に使い、内部のビジネスルールはDomain関数でも保証する。

### 3.4 計測してから最適化する

- 性能変更には、変更前後の計測値とデータ条件を記録する。
- Reactのメモ化、Web Worker、キャッシュ、データ構造の複雑化は、根拠なく追加しない。
- PRDの標準文書（50節、500要素、画像合計50MB）を性能判断の基準にする。

### 3.5 小さく検証可能な変更にする

- 1 PRは一つの利用者価値、修正、または内部改善に限定する。
- 仕様変更、リファクタリング、依存更新を、理由なく同じPRへ混在させない。
- 300変更行または10ファイルを超える場合は、分割できない理由をPRへ記載する。

## 4. TypeScript規約

### 4.1 コンパイラ方針

`tsconfig`では少なくとも次を有効にする。

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true
  }
}
```

型エラーを抑制する`@ts-ignore`は禁止する。外部型定義の既知問題など回避不能な場合だけ`@ts-expect-error`を使用し、理由と追跡Issueを同じ行の直前に記載する。

```typescript
// TODO(#142): upstreamの型定義修正後に削除する。
// @ts-expect-error ランタイムではサポート済みだが型定義に不足がある。
externalLibrary.supportedRuntimeOption = true;
```

### 4.2 型の使い分け

- オブジェクトの公開契約とPortは`interface`を使う。
- ユニオン、交差、ブランド、関数型は`type`を使う。
- `enum`は使用せず、文字列リテラルユニオンまたは`as const`を使う。
- `object`、`Function`、`{}`のような曖昧な型を公開APIに使わない。
- 外部入力、catch変数、JSON解析結果は`unknown`とする。

```typescript
interface RecoveryRepository {
  load(): Promise<AutoSaveRecord | null>;
  save(record: AutoSaveRecord): Promise<void>;
}

type ElementType =
  | "heading"
  | "richText"
  | "image"
  | "table"
  | "shape"
  | "connector"
  | "link";

const ELEMENT_TYPES = [
  "heading",
  "richText",
  "image",
  "table",
  "shape",
  "connector",
  "link",
] as const satisfies readonly ElementType[];
```

### 4.3 `any`と型アサーション

`any`は禁止する。型が分からない場合は`unknown`から絞り込む。

```typescript
// 良い例
function parseDocument(input: unknown): CanvasDocumentFile {
  return canvasDocumentFileSchema.parse(input);
}

// 悪い例
function parseDocument(input: any): CanvasDocumentFile {
  return input as CanvasDocumentFile;
}
```

型アサーションは、DOM APIなどコンパイラが表現できないが実行時条件を直前に確認した場合に限定する。二重アサーション（`as unknown as T`）は禁止する。

### 4.4 NullとOptional

- 値が「存在しない」状態を明示する場合は`null`を使う。
- オプション設定やパッチ入力は`?`を使う。
- `undefined`と`null`を同じフィールドで混在させない。
- `filter(Boolean)`による暗黙の型絞り込みに頼らず、型ガードを定義する。

```typescript
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
```

### 4.5 判別共用体の網羅性

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function getElementLabel(element: DocumentElement): string {
  switch (element.type) {
    case "heading":
      return element.text;
    case "richText":
      return "リッチテキスト";
    case "image":
      return element.caption || "画像";
    case "table":
      return "表";
    case "shape":
      return element.text || "図形";
    case "connector":
      return "コネクタ";
    case "link":
      return element.label;
    default:
      return assertNever(element);
  }
}
```

新しい要素型を追加した際、Renderer、Inspector、Validatorなどの不足がコンパイルエラーになる構造を維持する。

## 5. 命名規則

### 5.1 識別子

| 対象 | 規則 | 例 |
|---|---|---|
| 変数 | camelCase、役割を表す名詞 | `activeSectionId` |
| 関数 | camelCase、動詞から始める | `validateDocument` |
| Boolean | `is`、`has`、`can`、`should` | `isDirty` |
| クラス | PascalCase、名詞 | `CommandManager` |
| interface/type | PascalCase | `CanvasDocument` |
| React Component | PascalCase | `PropertyInspector` |
| Hook | `use` + PascalCase相当 | `useActiveSection` |
| 定数 | UPPER_SNAKE_CASE | `MAX_HISTORY_SIZE` |
| Zodスキーマ | camelCase + `Schema` | `canvasDocumentSchema` |
| Port | 役割 + `Repository`/`Gateway`/`Renderer` | `DocumentFileGateway` |
| 実装Adapter | 技術 + 役割 | `IndexedDbRecoveryRepository` |
| Command | 動詞 + 対象 + `Command` | `MoveElementsCommand` |
| Error code | UPPER_SNAKE_CASE | `DOC_INVALID_JSON` |

短縮語は一般的な`id`、`url`、`html`、`svg`、`json`、`ui`、`dto`に限定する。変数名では`documentId`、型名では`HTMLExporter`ではなく`HtmlExporter`のようにPascalCaseへ揃える。

### 5.2 ファイル名

| 種別 | 規則 | 例 |
|---|---|---|
| React Component | PascalCase.tsx | `CanvasEditor.tsx` |
| Hook | camelCase.ts | `useCanvasViewport.ts` |
| Domain model | camelCase.ts | `canvasDocument.ts` |
| Use case | camelCase.ts | `exportDocument.ts` |
| Command | PascalCase.ts | `MoveElementsCommand.ts` |
| Port | PascalCase.ts | `RecoveryRepository.ts` |
| Adapter | PascalCase.ts | `IndexedDbRecoveryRepository.ts` |
| Test | 対象名.test.ts(x) | `MoveElementsCommand.test.ts` |
| E2E | 機能名.spec.ts | `document-export.spec.ts` |
| Fixture | kebab-case | `invalid-duplicate-id.json` |

一つのファイルに主要な公開型・クラス・コンポーネントを一つ置く。密接な非公開型や小さな補助関数は同居可能とする。

## 6. コードフォーマット

- インデント: 2スペース
- 改行コード: LF
- 文字コード: UTF-8
- 末尾改行: 必須
- 文字列: TypeScript/JavaScriptではダブルクォート
- セミコロン: 付ける
- 末尾カンマ: 複数行では付ける
- 最大行長: 100文字を目安とし、Prettierの結果を正とする
- import順: 組み込み、外部、内部エイリアス、相対パスの順
- 未使用import・変数: エラー

手動でフォーマットを調整せず、Prettierへ委ねる。整形だけの変更は機能変更と別コミットまたは別PRにする。

## 7. Importと依存境界

### 7.1 パス

リポジトリ構造定義後、層ごとのパスエイリアスを設定する。想定する論理エイリアスは次のとおり。

```typescript
import type { CanvasDocument } from "@domain/document";
import { MoveElementsCommand } from "@application/commands";
import { Button } from "@ui/components";
```

- 3階層以上の相対import（`../../../`）は禁止する。
- barrel fileは外部公開境界だけに置き、内部実装を無差別に再exportしない。
- 循環依存は禁止し、CIの静的検査対象とする。
- 型だけのimportには`import type`を使用する。

### 7.2 層別禁止事項

| 層 | 禁止import |
|---|---|
| Domain | React、Konva、Tiptap、Zustand、idb、JSZip、ブラウザAPIラッパー |
| Application | React Component、Konva/Tiptapランタイム、Infrastructure具象クラス |
| UI | IndexedDB、idb、JSZip、永続化Adapter |
| Infrastructure | UI Component、Application Storeの内部実装 |

Portの具象実装はアプリ起動時のComposition Rootだけで生成・注入する。

## 8. 関数・クラス設計

### 8.1 関数

- 一つの関数は一つの判断または変換に集中する。
- 20行以内を目標、50行を超える場合は分割可能性を確認する。
- 100行超は、Rendererなど宣言的な処理を除きレビューで理由を必須とする。
- 引数が3個を超える場合はOptionsオブジェクトを検討する。
- Boolean引数で挙動を切り替えず、名前付きOptionsまたは別関数にする。
- Domain関数は可能な限り純粋関数とし、時刻とIDを引数またはPortから受け取る。

```typescript
interface CreateSectionInput {
  chapterId: string;
  title: string;
  now: string;
  sectionId: string;
}

function createSection(
  document: CanvasDocument,
  input: CreateSectionInput
): CanvasDocument {
  // Domainルールだけを実装する。
}
```

### 8.2 クラス

状態や差し替え可能なPortを持たない処理に、形式だけのクラスを使わない。純粋変換は関数、状態を持つ履歴管理やAdapterはクラスを選ぶ。

- constructor内で非同期処理を開始しない。
- publicメソッドを最小限にする。
- 継承より合成を優先する。
- staticなサービスロケーターやグローバルシングルトンを作らない。

### 8.3 React Component

- Componentは表示とユーザー操作の通知に集中する。
- 文書不変条件、永続化、HTML生成をComponent内に実装しない。
- Storeは用途別selectorで購読し、文書全体を購読しない。
- propsは読み取り専用とし、10項目を超える場合は責務分割を検討する。
- `useEffect`を状態同期の万能手段にしない。イベントまたは導出値で表せないか先に検討する。
- Contextは低頻度に変わる依存注入・テーマに限定し、高頻度キャンバス状態に使用しない。

```typescript
interface SaveStatusProps {
  readonly status: "idle" | "saving" | "saved" | "failed";
  readonly lastSavedAt: string | null;
}

export function SaveStatus({
  status,
  lastSavedAt,
}: SaveStatusProps): React.JSX.Element {
  return (
    <output aria-live="polite">
      {formatSaveStatus(status, lastSavedAt)}
    </output>
  );
}
```

### 8.4 Custom Hook

- HookはUIに関係する再利用可能な状態・副作用だけを扱う。
- HookからDomainの可変オブジェクトを返さない。
- Effectの依存配列を無効化しない。
- Hookのテストは利用Componentの統合テストを優先し、複雑な状態機械だけ個別テストする。

## 9. 状態管理とCommand

### 9.1 Store更新

- 文書変更はCommandまたは新規作成・読込ユースケースだけが行う。
- UIイベントからStoreの深いフィールドを直接変更しない。
- 配列順に意味がある`chapters`、`sectionIds`、`zOrder`、`ExportLayout.nodes`を`sort()`で暗黙変更しない。
- selectorは安定した参照を返し、毎回新しい巨大配列を作らない。

### 9.2 Command実装

各Commandは次を満たす。

- 実行前提をDomainで検証する。
- 成功時の文書更新を原子的に生成する。
- `undo()`で実行直前の意味的状態へ戻せる。
- 画像Data URLなどの大容量値を履歴ごとに複製しない。
- ユーザー向け名称とマージキーを持つ。
- 複数要素変更は一つのCommandにまとめる。

```typescript
interface EditorCommand {
  readonly label: string;
  readonly mergeKey?: string;
  execute(document: CanvasDocument): Result<CanvasDocument, DomainError>;
  undo(document: CanvasDocument): Result<CanvasDocument, DomainError>;
}
```

### 9.3 Konvaとの同期

- ドラッグ中はKonvaノードを直接動かし、ポインター終了時に一度だけCommandを実行する。
- Konva NodeをStore、Command、JSONへ保存しない。
- StageのイベントオブジェクトをApplicationへ渡さず、Domain DTOへ変換する。
- Componentアンマウント時にイベント、画像参照、Object URLを解放する。

### 9.4 Tiptapとの同期

- 許可ノード・マークをextension設定で限定する。
- HTML文字列をDomainモデルへ保存せず、検証済みJSONを保存する。
- 編集確定時に一つのCommandへ変換する。
- 貼り付け入力はTiptap設定とDomain Validatorの両方で検査する。

## 10. エラーハンドリング

### 10.1 原則

- 予測可能な失敗は`Result<T, E>`として返す。
- Domainの不変条件違反を汎用`Error`にしない。
- Infrastructureの例外はApplication Errorへ変換する。
- エラーを握りつぶさない。復旧する場合も原因を保持する。
- ユーザー向け文言と内部原因を分離する。

```typescript
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

interface ApplicationError {
  readonly code: ApplicationErrorCode;
  readonly userMessage: string;
  readonly cause?: unknown;
  readonly details?: Readonly<Record<string, string>>;
}
```

### 10.2 catch

```typescript
async function loadRecovery(
  repository: RecoveryRepository
): Promise<Result<AutoSaveRecord | null, ApplicationError>> {
  try {
    return { ok: true, value: await repository.load() };
  } catch (cause: unknown) {
    return {
      ok: false,
      error: {
        code: "AUTOSAVE_FAILED",
        userMessage: "自動保存データを読み込めませんでした。",
        cause,
      },
    };
  }
}
```

- `catch { return null; }`は禁止する。
- catch変数を即座に`as Error`へ変換しない。
- 予期しないErrorを文字列化する場合は型ガードを使う。
- 本番ログに文書タイトル、本文、URL、画像、パスを含めない。

### 10.3 UI表示

- 入力誤りはフィールド直下へ表示する。
- 継続可能な警告はトーストまたはステータス領域へ表示する。
- データ損失や処理中断に関わる問題はモーダルへ表示する。
- エラーコード、影響、次の操作を示す。
- 開発用スタックトレースを本番UIへ表示しない。

## 11. 非同期処理

- Promiseチェーンより`async`/`await`を使用する。
- 相互依存しない処理は`Promise.all`で並列化する。
- UIから開始する長時間処理は、進行中状態と二重実行防止を持つ。
- 古いプレビュー生成など結果が不要になり得る処理は、AbortSignalまたは世代番号で破棄する。
- React Componentのアンマウント後に状態更新しない。
- Blob URLは`URL.revokeObjectURL()`で確実に解放する。

非同期処理を`void somePromise()`で捨てる場合は、処理内で失敗を完結して扱うことを関数名またはコメントで明示する。

## 12. セキュリティ実装規約

### 12.1 外部入力

次をすべて信頼しない入力として扱う。

- JSONファイル
- 画像ファイル名、MIMEタイプ、バイナリ
- リッチテキスト貼り付け
- URL
- ドラッグ＆ドロップ、クリップボード
- IndexedDBに残る旧データ

型検証、サイズ検証、参照整合性検証が完了するまでStoreへ入れない。

### 12.2 HTML生成

- ユーザー文字列をHTML文字列連結へ直接挿入しない。
- DOM APIの`textContent`、属性設定、型別Rendererを使う。
- 最終段階でDOMPurifyを防御的に適用する。
- URLはURL APIで解析し、`http:`、`https:`、`mailto:`だけを許可する。
- `dangerouslySetInnerHTML`は原則禁止する。サニタイズ済み出力プレビューなど回避不能な場合は、専用ラッパーComponent一か所だけで使用し、セキュリティテストを必須にする。
- SVGで`foreignObject`、script、イベント属性、外部参照を生成しない。

### 12.3 プレビュー

- iframeに`allow-scripts`、`allow-same-origin`、`allow-top-navigation`を付けない。
- 新しい権限を追加する変更はセキュリティレビューとADRを必須にする。
- プレビュー内の外部リンク操作は既定で無効化する。

### 12.4 機密情報

- MVPは秘密情報を必要としない。
- `VITE_`環境変数はブラウザへ公開されるため、APIキーやトークンを置かない。
- `.env`、認証情報、個人文書fixtureをコミットしない。
- テストfixtureには架空データだけを使用する。

## 13. パフォーマンス規約

- 要素検索はID辞書を使用し、描画ループ内の配列全走査を避ける。
- React selectorから毎回巨大な新規オブジェクトを返さない。
- Canvasのpointer move中に文書Store全体を更新しない。
- Data URLや画像デコード結果を不用意に複製しない。
- 画像キャッシュには上限と破棄処理を持たせる。
- 大量データの最適化では、標準fixtureとPerformance APIの結果をPRへ添付する。
- `useMemo`、`useCallback`、`memo`は計測または参照安定性の必要性がある場所だけに使う。
- JSON、ZIP、HTML生成で50ms超のLong Taskが発生した場合、処理分割またはWorkerを検討する。

アルゴリズムの計算量が入力サイズに影響する場合はTSDocまたは近接コメントへ記載する。

```typescript
/**
 * 要素IDから要素を取得するインデックスを構築する。
 * 時間計算量: O(n)、参照: 平均O(1)
 */
function buildElementIndex(
  elements: readonly DocumentElement[]
): ReadonlyMap<string, DocumentElement> {
  return new Map(elements.map((element) => [element.id, element]));
}
```

## 14. コメントとドキュメント

### 14.1 コメント

コメントは「何をしているか」ではなく「なぜ必要か」「どの制約を守るか」を説明する。

```typescript
// 良い例:
// 読込検証が完了するまで現在文書を置換せず、失敗時のデータ損失を防ぐ。
const validatedDocument = validateIncomingDocument(input);

// 悪い例:
// 文書を検証する。
const validatedDocument = validateIncomingDocument(input);
```

コメントアウトしたコードは残さず削除する。履歴はGitに残る。

### 14.2 TSDoc

次にTSDocを必須とする。

- 層をまたいで公開するinterface、Port、Facade
- 複雑なDomainアルゴリズム
- 副作用、性能特性、セキュリティ制約が名前だけでは分からない関数
- 呼び出し側が扱うエラーまたは前提条件を持つAPI

単純な内部関数や自明なReact Componentへ定型コメントを量産しない。

### 14.3 TODO・FIXME

追跡番号のないTODO/FIXMEは禁止する。

```typescript
// TODO(#218): 2,000要素超の節へビューポートカリングを追加する。
// FIXME(#241): FirefoxでGIFデコード完了イベントが遅延する。
```

`HACK`を追加する場合は、理由、削除条件、Issueを必須とする。

## 15. テスト実装規約

### 15.1 原則

- 不具合修正は、修正前に失敗する回帰テストを追加する。
- Domainの新機能はユニットテストを先に書くTDDを基本とする。
- 実装詳細ではなく、公開契約、状態遷移、生成物を検証する。
- テスト間で状態を共有せず、実行順に依存させない。
- 時刻、UUID、保存先はPortを差し替えて決定的にする。
- スナップショットだけに依存せず、重要な意味を明示的に検証する。

### 15.2 Given-When-Then

```typescript
describe("MoveElementsCommand", () => {
  it("execute_twoUnlockedElements_movesBothAtomically", () => {
    // Given
    const document = createDocumentFixture();
    const command = createMoveElementsCommand({
      elementIds: ["element-a", "element-b"],
      delta: { x: 20, y: -10 },
    });

    // When
    const result = command.execute(document);

    // Then
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getFrame(result.value, "element-a")).toMatchObject({
      x: 120,
      y: 90,
    });
    expect(getFrame(result.value, "element-b")).toMatchObject({
      x: 220,
      y: 190,
    });
  });
});
```

### 15.3 テスト名

`[対象]_[条件]_[期待結果]`を基本とする。日本語の説明文を使う場合も、条件と期待結果を含める。

```typescript
it("parseDocument_duplicateElementId_returnsReferenceError", () => {});
it("画像の代替テキストが空の場合は出力警告を返す", () => {});
```

`works`、`test1`、`正常系`だけの名前は禁止する。

### 15.4 モック

- Portはinterfaceに対する手書きFakeまたはVitest mockで置き換える。
- Domainロジックをモックしない。
- Reactの内部Hookや子Componentを過剰にモックしない。
- IndexedDB Adapter統合テストではfake-indexeddbを使用し、E2Eでは実ブラウザを使う。
- HTML/ZIPは生成物を解析・展開して検証する。

### 15.5 カバレッジ

| 対象 | 行 | 分岐 |
|---|---:|---:|
| Domain | 90%以上 | 90%以上 |
| Application | 85%以上 | 80%以上 |
| Infrastructure | 80%以上 | 75%以上 |
| UI | 70%以上 | 65%以上 |
| 全体 | 80%以上 | 75%以上 |

データ損失、スキーマ移行、URL検証、HTML/SVGサニタイズは正常・異常分岐を100%テストする。カバレッジ除外には理由コメントを必須とし、生成コード以外の安易な除外は禁止する。

## 16. Git運用

### 16.1 ブランチ戦略

Git Flowを採用する。

```text
main
└── develop
    ├── feature/*
    ├── fix/*
    ├── refactor/*
    └── release/*

main
└── hotfix/*（本番緊急修正時）
```

| ブランチ | 起点 | マージ先 | 用途 |
|---|---|---|---|
| `main` | - | - | リリース済みで常に配布可能 |
| `develop` | `main` | `main` | 次リリースの統合 |
| `feature/<issue>-<slug>` | `develop` | `develop` | 新機能 |
| `fix/<issue>-<slug>` | `develop` | `develop` | 通常バグ修正 |
| `refactor/<issue>-<slug>` | `develop` | `develop` | 挙動を変えない改善 |
| `release/<version>` | `develop` | `main`, `develop` | リリース調整 |
| `hotfix/<issue>-<slug>` | `main` | `main`, `develop` | リリース済み版の緊急修正 |

- `main`と`develop`への直接pushを禁止する。
- 作業ブランチは短命にし、原則5営業日以内にPR化する。
- feature/fix/refactorからdevelopへはsquash mergeする。
- release/hotfixからmainへは履歴を残すmerge commitを使用する。
- mainのリリースコミットへSemVerタグを付ける。

個人開発でレビュー担当者がいない場合もPRを作り、セルフレビューとCI成功を記録してからマージする。

### 16.2 Conventional Commits

```text
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | 用途 |
|---|---|
| `feat` | 利用者に見える機能追加 |
| `fix` | 不具合修正 |
| `docs` | ドキュメントのみ |
| `refactor` | 挙動を変えない構造改善 |
| `perf` | 性能改善 |
| `test` | テストのみ |
| `style` | フォーマットのみ |
| `build` | ビルド、依存関係 |
| `ci` | CI設定 |
| `chore` | その他の保守 |

推奨scopeは`document`、`canvas`、`editor`、`export`、`persistence`、`ui`、`security`、`build`とする。

```text
feat(export): 単一HTMLへの画像埋め込みを追加

ExportBundleの画像アセットをData URLへ変換し、
ネットワークなしで閲覧できるHTMLを生成する。

Closes #84
```

- subjectは命令形・現在形で50文字程度にする。
- 本文には「何を」だけでなく「なぜ」を記載する。
- 破壊的変更には`BREAKING CHANGE:`と移行方法を記載する。
- Issueを閉じる場合は`Closes #123`、参照だけなら`Refs #123`を使う。

## 17. Pull Request

### 17.1 作成条件

- 対応Issueと受け入れ条件がある。
- 実装・テスト・必要な文書更新が揃っている。
- formatter、lint、型チェック、関連テスト、ビルドが成功している。
- 変更者が差分全体をセルフレビュー済みである。
- スクリーンショットまたは短い動画が必要なUI変更に添付されている。
- 性能変更には条件と変更前後の数値がある。
- スキーマ、依存境界、信頼境界の変更には設計書またはADR更新がある。

### 17.2 PRテンプレート

リポジトリ構築時に、次を`.github/pull_request_template.md`へ配置する。

```markdown
## 概要

<!-- 変更を1〜3文で説明してください。 -->

## 背景・目的

<!-- なぜ必要か、利用者または設計上の課題を説明してください。 -->

## 変更内容

- 

## 受け入れ条件

- [ ] 

## 検証

- [ ] Unit test
- [ ] Integration test
- [ ] E2E test
- [ ] 手動確認
- [ ] 型チェック・Lint・Build

### 結果

<!-- コマンドと結果、UI変更時は画像を記載してください。 -->

## 影響とリスク

<!-- データ、互換性、性能、セキュリティへの影響を記載してください。 -->

## 文書・ADR

- [ ] 不要
- [ ] 更新済み

## 関連Issue

Closes #

## レビューポイント

<!-- 特に確認してほしい判断を書いてください。 -->
```

### 17.3 マージ条件

- 必須CIがすべて成功している。
- 未解決の`[必須]`コメントがない。
- 1名以上の承認がある。個人開発ではセルフレビュー記録で代替する。
- 最新developとの競合が解消されている。
- 新規不具合や警告を意図的に残す場合はIssue化されている。

## 18. コードレビュー

### 18.1 レビュー順序

1. 要求と受け入れ条件
2. データ損失・セキュリティ・互換性
3. アーキテクチャ境界
4. 正常系・異常系の挙動
5. テストの妥当性
6. 性能とリソース解放
7. 可読性と命名

フォーマットは自動化し、人間のレビュー時間を設計と挙動へ使う。

### 18.2 コメント分類

- `[必須]`: 不具合、要件未達、データ損失、セキュリティ、設計違反
- `[推奨]`: 保守性、性能、テスト強化の改善
- `[提案]`: 今回必須ではない代替案
- `[質問]`: 意図・前提の確認
- `[称賛]`: 再利用したい良い判断

コメントには問題、影響、可能なら具体的な修正案を含める。

```markdown
[必須] 外部JSONを型アサーションだけでStoreへ入れているため、
壊れた参照で現在文書を置換する可能性があります。
`DocumentValidator.validateForLoad()`の成功後に置換してください。
```

### 18.3 セルフレビュー

- デバッグコード、個人データ、不要ファイルがない。
- 差分がIssueの範囲に収まっている。
- エラー経路と取消経路を確認した。
- Object URL、イベントリスナー、タイマーを解放している。
- 新しい要素型が全Renderer、Inspector、Validatorへ追加されている。
- 単一HTMLとZIPが同じExportBundleを使用している。
- アクセシブル名、フォーカス、キーボード操作を確認した。

## 19. CI/CD

### 19.1 Pull Request CI

次を順に実行し、一つでも失敗した場合はマージ不可とする。

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test:coverage`
6. `npm run build`
7. `npm run test:e2e:smoke`

ChromiumのE2Eスモークでは、新規作成、要素追加、JSON保存、単一HTML出力までを確認する。

### 19.2 Main・Release CI

PR CIに加え、次を実行する。

- FirefoxとWebKitで生成HTMLの閲覧テスト
- XSS、危険URL、SVG、ZIPのセキュリティfixture
- 500要素・50MBの性能テスト
- 依存関係とライセンスの監査
- ビルド成果物サイズの比較

静的ホスティングへの自動デプロイは配布先決定後に追加する。デプロイを導入するまでは、`dist/`をCI artifactとして保存し、手動確認可能にする。

### 19.3 推奨npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:smoke": "playwright test --grep @smoke"
  }
}
```

## 20. Pre-commitとローカル品質確認

Pre-commitには変更ファイルの自動整形とLintだけを置き、長いE2Eや全テストはCIへ任せる。型チェックと関連ユニットテストはコミット前またはPR前に実行する。

推奨構成:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

- 自動修正後の差分を確認してからコミットする。
- `--no-verify`での回避は、フック障害など例外時だけ許可し、PRへ理由を記載する。
- CIを通すために検査対象を除外しない。

## 21. 開発フロー

### 21.1 Issue

Issueには次を含める。

- 背景と利用者価値
- 対象PRD要件または不具合再現手順
- スコープ内・外
- 測定可能な受け入れ条件
- データ、互換性、性能、セキュリティのリスク
- 必要な文書更新

### 21.2 実装

1. Issueと参照設計を確認する。
2. 作業ブランチをdevelopから作る。
3. Domainの契約と失敗テストを先に追加する。
4. 最小実装でテストを通す。
5. Application、Infrastructure、UIの順に接続する。
6. 異常系、セキュリティ、アクセシビリティを追加検証する。
7. リファクタリングし、設計文書と実装を同期する。
8. 全ローカル品質チェック後にPRを作る。

### 21.3 Definition of Ready

- 目的と利用者価値が説明されている。
- 受け入れ条件が検証可能である。
- 依存する設計・Issueが完了している。
- 未決定事項が実装者へ残されていない。
- 性能・セキュリティ・データ移行への影響が評価されている。

### 21.4 Definition of Done

- 受け入れ条件をすべて満たす。
- Unit、Integration、必要なE2Eを追加し成功する。
- lint、型チェック、フォーマット、ビルドが成功する。
- エラー、取消、未保存、復元の経路を確認する。
- アクセシビリティと正式対応ブラウザを確認する。
- カバレッジ閾値を満たす。
- 文書、ADR、fixtureを必要に応じて更新する。
- PRレビューとCIが完了し、未解決の必須指摘がない。

## 22. バージョニングとリリース

SemVerを採用する。

- `MAJOR`: 文書ファイル互換性や公開契約の破壊的変更
- `MINOR`: 後方互換な機能追加
- `PATCH`: 後方互換な不具合修正

リリース手順:

1. `release/<version>`をdevelopから作る。
2. 全CI、全ブラウザ、セキュリティ、性能テストを実行する。
3. バージョン、変更履歴、スキーマ互換性を確認する。
4. mainへmerge commitでマージする。
5. `vX.Y.Z`タグを付ける。
6. developへ変更を戻す。
7. `dist/`のハッシュとリリースノートを保存する。

文書スキーマを変更する場合は、Migration fixture、後方互換テスト、ユーザー向け移行説明をリリース条件に追加する。

## 23. 開発環境

### 23.1 必要ツール

| ツール | 系列 | 用途 |
|---|---|---|
| Git | 2.x最新安定版 | バージョン管理 |
| Node.js | 24 LTS | 開発・ビルド・テスト |
| npm | 11.x | 依存管理 |
| Chrome / Edge | 最新安定版 | 正式対応ブラウザ確認 |
| VS Code | 任意 | 推奨エディタ |

### 23.2 初期セットアップ

リポジトリ作成後の標準手順:

```powershell
git clone <repository-url>
Set-Location EditorTool
npm ci
npm run typecheck
npm run test:run
npm run dev
```

MVPは秘密環境変数を必要としない。`.env`を追加する場合は`.env.example`へ公開可能な設定だけを記載し、`VITE_`変数がブラウザへ露出することをレビューする。

### 23.3 推奨エディタ設定

- ESLint: 保存時に問題を表示する。
- Prettier: 保存時フォーマットを有効にする。
- TypeScript: ワークスペース版を使用する。
- EditorConfig: UTF-8、LF、2スペース、末尾改行を統一する。
- markdownlint: 設計文書の基本的なMarkdown崩れを検査する。

## 24. 実装前後チェックリスト

### 実装前

- [ ] PRD、機能設計、アーキテクチャ、関連Issueを確認した
- [ ] 変更する層と依存方向が明確である
- [ ] 受け入れ条件とテスト方法が決まっている
- [ ] データ、互換性、性能、セキュリティへの影響を確認した
- [ ] 作業ブランチ名が規約に従っている

### 実装後

- [ ] 文書変更はCommandまたはユースケースを通っている
- [ ] 外部入力を`unknown`から検証している
- [ ] 失敗時に現在文書を変更しない
- [ ] 型アサーション、`any`、Lint抑制で問題を隠していない
- [ ] Unit、Integration、必要なE2Eを追加した
- [ ] セキュリティとアクセシビリティを確認した
- [ ] リソース、イベント、タイマー、Object URLを解放した
- [ ] formatter、lint、型チェック、テスト、ビルドが成功した
- [ ] 設計書、ADR、変更履歴を必要に応じて更新した
- [ ] PR本文へ検証結果とレビューポイントを記載した

## 25. 保留事項

- `docs/repository-structure.md`の作成後、実パスとパスエイリアスを本ガイドへ反映する。
- リポジトリ初期化後、PRテンプレート、Issueテンプレート、CI workflow、EditorConfig、Lint/Format設定を実ファイルとして追加する。
- 静的ホスティング先の決定後、デプロイ、CSPヘッダー、リリース成果物の公開手順を確定する。

