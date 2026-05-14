import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/cine-suntem": {
      ro: "/cine-suntem",
      en: "/who-we-are",
    },
    "/ce-facem": {
      ro: "/ce-facem",
      en: "/what-we-do",
    },
    "/implica-te": {
      ro: "/implica-te",
      en: "/get-involved",
    },
    "/turnee": {
      ro: "/turnee",
      en: "/tournaments",
    },
    "/turnee/[slug]": {
      ro: "/turnee/[slug]",
      en: "/tournaments/[slug]",
    },
    "/politica-confidentialitate": {
      ro: "/politica-confidentialitate",
      en: "/privacy-policy",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
