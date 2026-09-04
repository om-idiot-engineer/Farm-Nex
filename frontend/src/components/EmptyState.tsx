import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ title, description, action, href, icon: Icon = Inbox }: { title: string; description: string; action?: string; href?: string; icon?: typeof Inbox }) {
  return (
    <div className="border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && href && <Button asChild className="mt-5" size="sm"><Link href={href}>{action}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
    </div>
  );
}
