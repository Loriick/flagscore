import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Supprimer les warnings React pour les tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Unknown event handler property") ||
      args[0].includes("You provided a `value` prop to a form field"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement("img", props);
  },
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return React.createElement("a", { href }, children);
  },
}));

// Mock environment variables
process.env.FFFA_BASE = "https://api.example.com";
process.env.FFFA_ACTION = "test_action";

// Global test setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock shadcn/ui components
vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) =>
    React.createElement("label", props, children),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, ...props }: any) =>
    React.createElement("div", { ...props, role: "combobox" }, children),
  SelectContent: ({ children, ...props }: any) =>
    React.createElement("div", { ...props, role: "listbox" }, children),
  SelectItem: ({ children, value, ...props }: any) =>
    React.createElement(
      "div",
      { ...props, role: "option", "data-value": value },
      children
    ),
  SelectTrigger: ({ children, id, name, ...props }: any) =>
    React.createElement(
      "button",
      { ...props, id, name, role: "combobox", "aria-haspopup": "listbox" },
      children
    ),
  SelectValue: ({ placeholder, ...props }: any) =>
    React.createElement(
      "span",
      { ...props, "aria-label": placeholder },
      placeholder
    ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) =>
    React.createElement("div", props, children),
  CardContent: ({ children, ...props }: any) =>
    React.createElement("div", props, children),
  CardHeader: ({ children, ...props }: any) =>
    React.createElement("div", props, children),
  CardTitle: ({ children, ...props }: any) =>
    React.createElement("h3", props, children),
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => React.createElement("div"),
}));
