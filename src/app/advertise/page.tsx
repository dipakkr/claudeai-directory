import { redirect } from "next/navigation";

// Sponsorship is handled by a dialog (opened from the sidebar). Old links land
// on the homepage with the dialog open.
export default function AdvertisePage() {
  redirect("/?advertise=1");
}
