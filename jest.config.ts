import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/image$": "<rootDir>/__mocks__/next/image.tsx",
    "\\.(css|scss|png|webp|jpg|jpeg|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
};

export default config;
