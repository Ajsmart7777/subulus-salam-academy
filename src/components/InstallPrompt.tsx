import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "sj_install_dismissed_at";
const DISMISS_DAYS = 7;

const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Skip if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Skip if recently dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const daysAgo = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysAgo < DISMISS_DAYS) return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setOpen(true), 2500);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (iOS) {
      setIsIOS(true);
      setTimeout(() => setOpen(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setDeferred(null);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[60] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-card border border-primary/15 shadow-2xl rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <img src={logoIcon} alt="Sabilul Jannah" className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-foreground text-sm">
              Install Sabilul Jannah
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isIOS
                ? "Tap the Share icon, then 'Add to Home Screen' for the best experience."
                : "Get quick access, work offline-friendly, and a fullscreen learning experience."}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {isIOS ? (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Share className="h-3.5 w-3.5" /> Share → Add to Home Screen
                </div>
              ) : (
                <Button size="sm" variant="hero" onClick={install} className="gap-1.5 h-8">
                  <Download className="h-3.5 w-3.5" /> Install
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismiss} className="h-8 text-xs">
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
