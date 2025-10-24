import { memo } from "react";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "elevated";
}

export const Card = memo(function Card({
  children,
  className,
  padding = "md",
  variant = "default",
}: CardProps) {
  const baseClasses = "rounded-lg transition-all duration-200";

  const variantClasses = {
    default: "bg-white/5 backdrop-blur-sm",
    outlined: "bg-transparent border border-gray-600",
    elevated: "bg-white/10 backdrop-blur-sm shadow-lg",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
});
