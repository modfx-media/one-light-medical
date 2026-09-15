"use client";

import Script from "next/script";
import { useRef } from "react";

const FORM_ID = "RE5TQcFb6e0bkrE1f7W3";

export function IntakeFormModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="btn btn-gradient"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span aria-hidden="true">♦️</span> One Light Medical Intake Form
      </button>

      <dialog
        ref={dialogRef}
        className="intake-modal"
        aria-labelledby="intake-modal-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <header className="intake-modal-head">
          <h2 id="intake-modal-title">One Light Medical Intake Form</h2>
          <button
            type="button"
            className="intake-modal-close"
            aria-label="Close intake form"
            onClick={() => dialogRef.current?.close()}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div className="intake-modal-body">
          <iframe
            src={`https://api.leadconnectorhq.com/widget/form/${FORM_ID}`}
            id={`inline-${FORM_ID}`}
            data-layout='{"id":"INLINE"}'
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="♦️ One Light Medical Intake Form"
            data-height="3482"
            data-layout-iframe-id={`inline-${FORM_ID}`}
            data-form-id={FORM_ID}
            data-cookie-consent="true"
            data-cookie-consent-provider="auto"
            title="One Light Medical Intake Form"
          />
        </div>
      </dialog>

      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
