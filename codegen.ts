import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://35.154.9.143:5000/graphql", 
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
