import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Đường dẫn đến Next.js app để tải next.config.js và .env trong môi trường test
  dir: "./",
});

// Các cấu hình tùy chỉnh cho Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Đường dẫn đến tệp setup chạy trước mỗi bài test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  moduleNameMapper: {
    // Map alias @/ để trỏ về thư mục src
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
