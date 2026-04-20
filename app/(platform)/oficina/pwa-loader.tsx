"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function PwaLoader() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/oficina" }).catch(() => {
        // PWA install is best-effort for the demo
      });
    }

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) {
    return (
      <div className="flex justify-end">
        <Badge variant="secondary" className="text-[10px]">● online · PWA activa</Badge>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <Badge variant="warning" className="text-[10px]">● offline · rascunhos guardados localmente</Badge>
    </div>
  );
}
