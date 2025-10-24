import { memo, Suspense, lazy, ComponentType } from "react";

import { Spinner } from "./Spinner";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
}

// Generic lazy loading component
export function createLazyComponent<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

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
