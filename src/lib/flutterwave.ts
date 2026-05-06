// Preloads and caches the Flutterwave inline checkout SDK so the modal opens
// instantly when the user clicks pay/donate, instead of waiting for the script
// to download after the click.

const FLW_SRC = "https://checkout.flutterwave.com/v3.js";
let loadPromise: Promise<void> | null = null;

export function loadFlutterwave(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).FlutterwaveCheckout) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${FLW_SRC}"]`);
    if (existing) {
      if ((window as any).FlutterwaveCheckout) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => {
        loadPromise = null;
        reject(new Error("Failed to load Flutterwave checkout"));
      });
      return;
    }
    const script = document.createElement("script");
    script.src = FLW_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Flutterwave checkout"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

// Fire-and-forget warmup; safe to call multiple times.
export function preloadFlutterwave(): void {
  loadFlutterwave().catch(() => {
    /* silently ignore; loadFlutterwave will retry on next call */
  });
}
