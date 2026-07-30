import { render, screen } from "@testing-library/react";

import { App } from "@app/App";

describe("App", () => {
  it("render_projectFoundation_showsLayerStatusAndAccessibleHeading", () => {
    // Given / When
    render(<App />);

    // Then
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "文書を、自由に描いて、正しく届ける。",
      }),
    ).toBeVisible();
    expect(screen.getByRole("list").children).toHaveLength(4);
    expect(screen.getByText("Domain")).toBeVisible();
    expect(screen.getByText("Application")).toBeVisible();
    expect(screen.getByText("Infrastructure")).toBeVisible();
    expect(screen.getByText("UI")).toBeVisible();
  });
});
