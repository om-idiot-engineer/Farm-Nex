import { redirect } from "next/navigation";

export default function MessageAliasPage({ params }: { params: { id: string } }) {
  redirect(`/messages?conversation=${encodeURIComponent(params.id)}`);
}
