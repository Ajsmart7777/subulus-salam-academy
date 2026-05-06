import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

const OfflineBadge = () => {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500/95 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg backdrop-blur">
      <WifiOff className="h-3.5 w-3.5" />
      Offline — showing previously opened content
    </div>
  );
};

export default OfflineBadge;
