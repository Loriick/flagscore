import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import NotFound from "../../app/not-found";

describe("NotFound Page", () => {
  it("renders 404 page correctly", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page non trouvée")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Désolé, la page que vous recherchez n'existe pas ou a été déplacée."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Retour à l'accueil")).toBeInTheDocument();
  });

  it("has correct link to homepage", () => {
    render(<NotFound />);

    const homeLink = screen.getByRole("link", { name: /retour à l'accueil/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("displays 404 image", () => {
    render(<NotFound />);

    const image = screen.getByAltText("Page non trouvée");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/404.png");
  });
});
