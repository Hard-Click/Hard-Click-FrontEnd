import * as Sentry from "@sentry/nextjs";
import { extractDomain } from "@/lib/sentryDomain";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Slack 알림에서 어느 화면 도메인인지 바로 보이게 태그 부착 (백엔드 domain 태그와 대칭)
  beforeSend(event) {
    const path = typeof window !== "undefined" ? window.location.pathname : event.request?.url;
    event.tags = { ...event.tags, domain: extractDomain(path) };
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
