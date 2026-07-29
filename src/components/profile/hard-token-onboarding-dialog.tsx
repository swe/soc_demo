"use client";

import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Usb,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type HardTokenOnboardingResult = {
  name: string;
};

type OnboardingStep = "prepare" | "name" | "register" | "success";

const steps: OnboardingStep[] = ["prepare", "name", "register", "success"];

function stepIndex(step: OnboardingStep) {
  return steps.indexOf(step);
}

export function HardTokenOnboardingDialog({
  open,
  onOpenChange,
  defaultName,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onComplete: (result: HardTokenOnboardingResult) => void;
}) {
  const [step, setStep] = useState<OnboardingStep>("prepare");
  const [name, setName] = useState(defaultName);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep("prepare");
    setName(defaultName);
    setRegisterError(null);
    setIsRegistering(false);
  }, [open, defaultName]);

  useEffect(() => {
    if (!open || step !== "register" || registerError) {
      return;
    }

    setIsRegistering(true);

    const timer = window.setTimeout(() => {
      setIsRegistering(false);
      setStep("success");
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, step, registerError]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isRegistering) {
      return;
    }
    onOpenChange(nextOpen);
  };

  const handleFinish = () => {
    const trimmed = name.trim() || defaultName;
    onComplete({ name: trimmed });
    onOpenChange(false);
  };

  const handleRetry = () => {
    setRegisterError(null);
    setIsRegistering(false);
    setStep("register");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isRegistering}>
        <DialogHeader>
          <DialogTitle>
            {step === "prepare" && "Register a hard token"}
            {step === "name" && "Name your security key"}
            {step === "register" && "Confirm on your key"}
            {step === "success" && "Hard token ready"}
          </DialogTitle>
          <DialogDescription>
            {step === "prepare" &&
              "Add a FIDO2 / hardware passkey for phishing-resistant sign-in."}
            {step === "name" &&
              "Choose a label so you can tell keys apart later."}
            {step === "register" &&
              (registerError
                ? "Registration did not complete."
                : "Touch or tap your security key when your browser prompts you.")}
            {step === "success" &&
              "This key can now be used as a second factor when you sign in."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 py-1" aria-hidden="true">
          {steps.map((item, index) => (
            <div
              key={item}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= stepIndex(step) ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {step === "prepare" ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Usb className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">Have your key ready</p>
                <p className="text-muted-foreground">
                  USB, NFC, or built-in platform authenticator that supports
                  FIDO2.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Wifi className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">Stay on this device</p>
                <p className="text-muted-foreground">
                  Complete registration in this browser window. Do not close the
                  tab while waiting for the key prompt.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <KeyRound className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">You may need a PIN</p>
                <p className="text-muted-foreground">
                  Some keys ask for a PIN or biometric before creating a new
                  credential.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === "name" ? (
          <Field>
            <FieldLabel htmlFor="hard-token-name">Key name</FieldLabel>
            <Input
              id="hard-token-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="YubiKey 5 NFC"
              autoFocus
              maxLength={64}
            />
            <FieldDescription>
              Examples: “YubiKey 5 NFC”, “Office desk key”, “Backup key”.
            </FieldDescription>
          </Field>
        ) : null}

        {step === "register" ? (
          <div className="space-y-4 py-2">
            {registerError ? (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                {registerError}
              </div>
            ) : (
              <div className="bg-muted/40 flex flex-col items-center gap-3 rounded-md border px-4 py-8 text-center">
                <Loader2 className="text-primary size-8 animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Waiting for your key…</p>
                  <p className="text-muted-foreground text-xs">
                    Insert the key and touch the sensor, or hold it near your
                    device for NFC.
                  </p>
                </div>
              </div>
            )}
            {!registerError ? (
              <p className="text-muted-foreground text-center text-xs">
                Insert the key and touch the sensor when prompted.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === "success" ? (
          <div className="bg-muted/40 flex flex-col items-center gap-3 rounded-md border px-4 py-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{name.trim() || defaultName}</p>
              <p className="text-muted-foreground text-xs">
                Registered just now · Ready for sign-in challenges
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "prepare" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => setStep("name")}>
                Continue
              </Button>
            </>
          ) : null}

          {step === "name" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("prepare")}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep("register")}
              >
                Register key
              </Button>
            </>
          ) : null}

          {step === "register" && registerError ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("name")}
              >
                Back
              </Button>
              <Button type="button" onClick={handleRetry}>
                Try again
              </Button>
            </>
          ) : null}

          {step === "success" ? (
            <Button type="button" onClick={handleFinish}>
              Done
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
