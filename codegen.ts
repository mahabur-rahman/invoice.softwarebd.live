import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: 'https://sellyx.softwarebd.live/graphql', 
  documents: ["./lib/graphql/**/*.{ts,tsx}"],
  generates: {
    "./lib/graphql/generated-types.ts": {
      plugins: [
        "typescript",
        "typescript-operations"
      ],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        avoidOptionals: true,
        immutableTypes: false
      }
    }
  }
};

export default config;
