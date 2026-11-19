/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext } from "react";
import { createStubCompliance } from "../compliance/stub";
import { Logger } from "../logging/logger";
import { Logging } from "../logging/logging";
import { disabledAnalyticsSink } from "../logging/sink";

// This is configured via a vite alias, defaulting to ./default
import { default as df } from "theme-package";

/**
 * Brand-and-content config supplied by the (optionally private) theme
 * package. The deployment loader configures diagnostic logging and
 * functional-only consent without external analytics or a cookie modal.
 */
export interface BrandConfig {
  /**
   * Stable analytics identifier slug for this product. Attached as
   * the `product` param on every event the logger emits, so dashboards
   * can split traffic by product when multiple sibling apps share a
   * GA4 property.
   */
  product: string;
  welcomeVideoYouTubeId?: string;
  squareLogo?: ReactNode;
  horizontalLogo?: ReactNode;

  supportLink?: string;
  guideLink?: string;
  userGuideLink?: string;
  accessibilityLink?: string;
  termsOfUseLink?: string;
  privacyPolicyLink?: string;
  translationLink?: string;
}

export type BrandConfigFactory = (env: Record<string, string>) => BrandConfig;

export interface CookieConsent {
  analytics: boolean;
  functional: boolean;
}

export interface DeploymentConfig extends BrandConfig {
  compliance: {
    /**
     * A provider that will be used to wrap the app UI.
     */
    ConsentProvider: (props: { children: ReactNode }) => JSX.Element;
    /**
     * Context that will be used to read the current consent value.
     * The provider is not used directly.
     */
    consentContext: React.Context<CookieConsent | undefined>;
    /**
     * Optional hook for the user to revisit cookie settings.
     */
    manageCookies: (() => void) | undefined;
  };
  logging: Logging;
}

const brandFactory: BrandConfigFactory = df;

const createLogging = (env: Record<string, string>, product: string): Logging =>
  new Logger(disabledAnalyticsSink, env, product);

export const deployment: DeploymentConfig = (() => {
  const env = import.meta.env as unknown as Record<string, string>;
  const brand = brandFactory(env);
  return {
    ...brand,
    logging: createLogging(env, brand.product),
    compliance: createStubCompliance(),
  };
})();

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- hook-shaped by design and used as one throughout
export const useDeployment = (): DeploymentConfig => deployment;

export const useCookieConsent = (): CookieConsent | undefined => {
  const { compliance } = useDeployment();
  return useContext(compliance.consentContext);
};
