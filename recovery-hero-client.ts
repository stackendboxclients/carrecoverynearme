import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { RecoveryHero } from "./recovery-hero";

const root = document.getElementById("recovery-hero-root");
if (root) {
  hydrateRoot(root, createElement(RecoveryHero, {
    bookingHref: "#request-recovery",
    servicesHref: "/services/",
  }));
}
