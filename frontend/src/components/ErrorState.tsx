import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({ message = "We could not load this workspace.", onRetry }: { message?: string; onRetry?: () => void }) {
  return <div className="flex items-start gap-3 border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div className="flex-1"><p className="font-semibold">Something needs attention</p><p className="mt-0.5 text-xs text-destructive/80">{message}</p></div>{onRetry && <Button variant="outline" size="sm" onClick={onRetry} className="border-destructive/30 text-destructive hover:bg-destructive/10"><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Retry</Button>}</div>;
}
