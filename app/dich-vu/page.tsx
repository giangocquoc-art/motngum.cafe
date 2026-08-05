import { permanentRedirect } from "next/navigation";

export default function ServicesPage() {
  permanentRedirect("/bang-gia?category=services");
}
