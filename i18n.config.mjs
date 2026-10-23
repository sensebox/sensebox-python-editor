import { defineConfig } from "@microbit/i18n-tools";

// English is the source catalog; German is the only translated catalog.
// Together, they are the two languages offered by the senseBox editor.
const languages = ["de"];

export default defineConfig({
  crowdin: {
    project: "microbitorg",
    branch: "new",
    directory: "apps/python-editor-v3",
  },
  languages,
  catalogs: [
    {
      source: "lang/ui.en.json",
      // The Crowdin file predates Crowdin's react-intl support and keeps
      // its strings' screenshots and other hand-added context, so it stays
      // in the format it was created in.
      crowdinFormat: "chrome",
      out: "src/messages/ui.{lang}.json",
      packages: ["@microbit/ui", "@microbit/ui-patterns"],
    },
  ],
});
