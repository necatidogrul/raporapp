import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoaderProps {
  className?: string;
  text?: string;
  spinnerSize?: "sm" | "md" | "lg";
}

export function Loader({
  className,
  text = "Yükleniyor...",
  spinnerSize = "md",
  ...props
}: LoaderProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 space-y-2",
        className
      )}
      {...props}
    >
      <Spinner size={spinnerSize} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
