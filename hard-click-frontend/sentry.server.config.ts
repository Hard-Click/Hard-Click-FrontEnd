import * as Sentry from "@sentry/nextjs";
import { extractDomain } from "./src/lib/sentryDomain";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  enableLogs: true,

  // Slack 알림에서 어느 화면 도메인인지 바로 보이게 태그 부착 (백엔드 domain 태그와 대칭)
  beforeSend(event) {
    event.tags = { ...event.tags, domain: extractDomain(event.request?.url) };
    return event;
  },
});
