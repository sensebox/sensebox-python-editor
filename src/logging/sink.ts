/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export type AnalyticsParams = Record<string, string | number | boolean>;

/**
 * Output target for analytics events. The Logger owns the cross-cutting
 * concerns (Sentry, param building, breadcrumbs); the sink owns whatever
 * is specific to the analytics SDK in use. Same shape as ml-trainer's
 * sink so a native (Firebase) sink could be dropped in later.
 */
export interface AnalyticsSink {
  event(name: string, params: AnalyticsParams): void;
  setUserProperty(name: string, value: string): void;
}

/**
 * This editor has no analytics backend. Logger still records diagnostic
 * breadcrumbs locally, or in Sentry when explicitly configured.
 */
export const disabledAnalyticsSink: AnalyticsSink = {
  event: () => undefined,
  setUserProperty: () => undefined,
};
