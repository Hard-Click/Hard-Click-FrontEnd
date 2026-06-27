import nextJest from 'next/jest.js';

// next/jest: Next.js(SWC) 변환·tsconfig 경로·환경변수를 자동 적용 (수업자료 §2-2)
const createJestConfig = nextJest({ dir: './' });

const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // @/ → src/ 별칭
  },
  // 커버리지 대상 (테스트 우선순위가 높은 순수 로직 계층 위주)
  collectCoverageFrom: [
    'src/features/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.mock.ts',
  ],
};

export default createJestConfig(config);
