"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type BeforeInstallPromptLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}
type InstallButtonProps = Pick<
  ButtonProps,
  "className" | "fullWidth" | "size" | "variant"
>;

export function InstallButton({
  className,
  fullWidth,
  size = "default",
  variant = "primary",
}: InstallButtonProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<BeforeInstallPromptLike | null>(null);
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" && isStandalone(),
  );
  const [prompting, setPrompting] = useState(false);
  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptLike);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  async function handleClick() {
    if (installed) return router.push("/app");
    if (!prompt) return router.push("/install");
    setPrompting(true);
    const installPrompt = prompt;
    setPrompt(null);
    try {
      await installPrompt.prompt();
      if ((await installPrompt.userChoice).outcome === "dismissed")
        router.push("/install");
    } catch {
      router.push("/install");
    } finally {
      setPrompting(false);
    }
  }
  return (
    <Button
      type="button"
      className={className}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
      loading={prompting}
      loadingLabel="Opening install…"
      onClick={handleClick}
    >
      {installed ? "Open app" : "Install WoodLoop"}
      {!installed ? <Download aria-hidden="true" /> : null}
    </Button>
  );
}
