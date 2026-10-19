/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { GenericDialog } from "../../common/GenericDialog";
import {
  CircuitPythonError,
  WebFileSystemConnection,
} from "../../device/web-file-system-device";
import { FinalFocusRef } from "../../project/project-actions";

export default function CircuitPythonDirectoryDialog({
  device,
  callback,
  finalFocusRef,
}: {
  device: WebFileSystemConnection;
  callback: (ready: boolean) => void;
  finalFocusRef: FinalFocusRef;
}) {
  const intl = useIntl();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const select = async () => {
    setBusy(true);
    setError(undefined);
    try {
      callback(await device.selectDirectory());
    } catch (e) {
      setError(e instanceof CircuitPythonError ? e.code : "directory");
    } finally {
      setBusy(false);
    }
  };
  return (
    <GenericDialog
      header={intl.formatMessage({ id: "circuitpython-directory-title" })}
      finalFocusRef={finalFocusRef}
      onClose={() => {
        if (!busy) callback(false);
      }}
      body={
        <>
          <p>
            <FormattedMessage id="circuitpython-directory-help" />
          </p>
          <p>
            <FormattedMessage id="circuitpython-directory-reuse" />
          </p>
          {error && (
            <p role="alert">
              {intl.formatMessage({ id: `circuitpython-error-${error}` })}
            </p>
          )}
        </>
      }
      footer={
        <HStack gap="2.5">
          <Button isDisabled={busy} onPress={() => callback(false)}>
            <FormattedMessage id="cancel-action" />
          </Button>
          <Button isDisabled={busy} variant="primary" onPress={select}>
            <FormattedMessage id="circuitpython-directory-select" />
          </Button>
        </HStack>
      }
    />
  );
}
