/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, createContext } from "react";
import { CookieConsent, DeploymentConfig } from "../deployment";

const stubConsentValue: CookieConsent = {
  analytics: false,
  functional: true,
};
const stubConsentContext = createContext<CookieConsent | undefined>(
  stubConsentValue
);

/**
 * The editor has no analytics backend or external cookie modal.
 * Consent is immediately "functional only" so features gated on
 * having a consent decision, such as the welcome dialog, still work.
 */
export const createStubCompliance = (): DeploymentConfig["compliance"] => ({
  ConsentProvider: ({ children }: { children: ReactNode }) => (
    <stubConsentContext.Provider value={stubConsentValue}>
      {children}
    </stubConsentContext.Provider>
  ),
  consentContext: stubConsentContext,
  manageCookies: undefined,
});
