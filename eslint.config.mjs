import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".claude/worktrees/**",
      ".playwright-cli/**",
      "output/**",
      "node_modules/**"
    ]
  },
  ...nextVitals
];

export default eslintConfig;
