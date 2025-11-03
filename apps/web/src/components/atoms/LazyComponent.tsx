import { memo, Suspense, lazy, ComponentType } from "react";

import { Spinner } from "./Spinner";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
}

// Generic lazy loading component
export function createLazyComponent<T extends object>(
  importFunc: () => Promise<unknown>,
  fallback?: React.ReactNode
) {
  // Try to resolve a usable component from a module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function resolveComponent(mod: any): ComponentType<T> | null {
    if (mod && mod.default) return mod.default as ComponentType<T>;
    if (mod && typeof mod === "object") {
      for (const key of Object.keys(mod)) {
        const val = (mod as Record<string, unknown>)[key];
        if (typeof val === "function" && /^[A-Z]/.test(key)) {
          return val as ComponentType<T>;
        }
      }
    }
    return null;
  }

  const LazyComponent = lazy(async () => {
    const mod = await importFunc();
    const Comp = resolveComponent(mod);
    if (!Comp) {
      throw new Error(
        "LazyComponent: module does not export a React component (default or named)."
      );
    }
    return { default: Comp };
  });

  return memo(function LazyWrapper(props: T & LazyComponentProps) {
    const { fallback: customFallback, className, ...componentProps } = props;

    return (
      <Suspense
        fallback={
          customFallback ||
          fallback || (
            <div
              className={`flex justify-center items-center p-8 ${className || ""}`}
            >
              <Spinner size="lg" />
            </div>
          )
        }
      >
        <LazyComponent {...(componentProps as T)} />
      </Suspense>
    );
  });
}
