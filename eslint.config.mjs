import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "src/components/ai-elements/**",
      "components/ui/carousel.tsx",
    ],
  },
];

export default config;
