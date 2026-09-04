import { FlaskConical } from "lucide-react";
import { DEMO_SOURCE_LABEL } from "@/lib/data/demo";

export default function DemoNotice({ children = "Some workspace records are sample data while this feature is awaiting its backend service." }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border border-sand bg-sand/45 px-3 py-2 text-xs text-earth-900" role="status">
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-earth-700" aria-hidden="true" />
      <span><strong className="font-semibold">{DEMO_SOURCE_LABEL}:</strong> {children}</span>
    </div>
  );
}
