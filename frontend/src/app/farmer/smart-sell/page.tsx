import { redirect } from "next/navigation";

export default function SmartSellLegacyRedirectPage({
  searchParams,
}: {
  searchParams?: { listing_id?: string };
}) {
  const query = searchParams?.listing_id ? `?listing_id=${encodeURIComponent(searchParams.listing_id)}` : "";
  redirect(`/farmer/buyers${query}`);
}
