import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // toast는 전역 중복 제거 래퍼(@/lib/toast)를 통해서만 쓴다 — sonner의 `toast` 직접 import 금지
  // (재발 방지). `Toaster`는 sonner 직접 허용.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sonner",
              importNames: ["toast"],
              message:
                "toast는 '@/lib/toast' 래퍼에서 import하세요 (전역 중복 제거). Toaster는 sonner 직접 허용.",
            },
          ],
        },
      ],
    },
  },
  // 래퍼 자신은 sonner의 toast를 감싸야 하므로 이 규칙에서 예외
  {
    files: ["src/lib/toast.ts"],
    rules: { "no-restricted-imports": "off" },
  },
]);

export default eslintConfig;
