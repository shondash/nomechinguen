// Fontsource: self-hosted fonts (replaces Google Fonts CDN)
// DM Sans: 400 (body), 600 (medium), 700 (headings)
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
// Space Mono: 400 only (labels, mono display)
import "@fontsource/space-mono/400.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NoMeChinguen from "./NoMeChinguen";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NoMeChinguen />
  </StrictMode>
);
