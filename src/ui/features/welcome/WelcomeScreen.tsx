interface WelcomeScreenProps {
  readonly layerSummary: readonly string[];
}

export function WelcomeScreen({ layerSummary }: WelcomeScreenProps) {
  return (
    <main className="welcome-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">CanvasDoc MVP</p>
        <h1 id="welcome-title">文書を、自由に描いて、正しく届ける。</h1>
        <p className="welcome-copy">
          キャンバス上の自由な配置と、意味的でレスポンシブな文書出力を両立する
          ブラウザエディターの開発基盤が起動しました。
        </p>

        <div className="foundation-status" aria-labelledby="foundation-title">
          <h2 id="foundation-title">Project foundation</h2>
          <ul>
            {layerSummary.map((layer) => (
              <li key={layer}>
                <span aria-hidden="true">✓</span>
                {layer}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
