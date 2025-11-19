import "../config/env";

function parseIntOrDefault(
  value: string | undefined,
  defaultValue: number
): number {
  const n = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return n;
}

export interface SchedulerConfig {
  cron: string;
  batchSize: number;
  delayBetweenBatchesMs: number;
}

export interface HttpConfig {
  timeoutMs: number;
}

export interface AppRuntimeConfig {
  scheduler: SchedulerConfig;
  http: HttpConfig;
}

export const appConfig: AppRuntimeConfig = {
  scheduler: {
    cron: process.env.PRICE_CHECK_CRON ?? "*/30 * * * *",
    batchSize: parseIntOrDefault(
      process.env.PRICE_CHECK_BATCH_SIZE,
      5
    ),
    delayBetweenBatchesMs: parseIntOrDefault(
      process.env.PRICE_CHECK_DELAY_MS,
      4000
    ),
  },
  http: {
    timeoutMs: parseIntOrDefault(process.env.HTTP_TIMEOUT_MS, 10000),
  },
};
