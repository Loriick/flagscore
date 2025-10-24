import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

import { ErrorHandler } from "../error-handler";

const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("ErrorHandler", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
    mockToastError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should handle Error objects", () => {
    const error = new Error("Test error message");
    const context = "Test context";

    ErrorHandler.handle(error, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Test context: Test error message",
      error
    );
  });

  it("should handle string errors", () => {
    const errorMessage = "String error message";
    const context = "Test context";

    ErrorHandler.handle(errorMessage, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Test context: Une erreur inattendue s'est produite",
      errorMessage
    );
  });

  it("should handle unknown error types", () => {
    const error = { someProperty: "value" };
    const context = "Test context";

    ErrorHandler.handle(error, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Test context: Une erreur inattendue s'est produite",
      error
    );
  });

  it("should handle null/undefined errors", () => {
    const context = "Test context";

    ErrorHandler.handle(null, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Test context: Une erreur inattendue s'est produite",
      null
    );
  });

  it("should provide context when available", () => {
    const error = new Error("Test error");
    const context = "API call failed";

    ErrorHandler.handle(error, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "API call failed: Test error",
      error
    );
  });

  it("should handle API errors", () => {
    const error = new Error("API error");
    const endpoint = "/api/test";

    ErrorHandler.handleApiError(error, endpoint);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Erreur API (/api/test): API error",
      error
    );
  });

  it("should handle network errors", () => {
    const error = new Error("Network error");

    ErrorHandler.handleNetworkError(error);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Erreur réseau: Network error",
      error
    );
  });

  it("should handle validation errors", () => {
    const error = new Error("Validation error");
    const field = "email";

    ErrorHandler.handleValidationError(error, field);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Erreur de validation (email): Validation error",
      error
    );
  });
});
