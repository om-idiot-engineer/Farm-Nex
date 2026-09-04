import { redirect } from "next/navigation";

export default function FarmerListLegacyRedirectPage() {
  redirect("/farmer/produce/new");
}
