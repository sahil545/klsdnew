"use client";

import { useEffect } from "react";

export default function ClientErrorHandler() {
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      // Filter out known external service errors that are non-critical
      const errorMessage = error.error?.message || error.message || "";
      const errorSource = error.filename || "";

      // Ignore FullStory and other analytics errors
      if (
        errorSource.includes("fullstory.com") ||
        errorSource.includes("edge.fullstory.com") ||
        errorMessage.includes("FullStory") ||
        errorMessage.includes("fs.js")
      ) {
        console.debug("External analytics error (ignored):", errorMessage);
        return;
      }

      // Ignore Next.js HMR errors in development
      if (
        process.env.NODE_ENV === "development" &&
        errorMessage.includes("Failed to fetch") &&
        (errorMessage.includes("webpack") || errorMessage.includes("_next"))
      ) {
        console.debug("Development HMR error (ignored):", errorMessage);
        return;
      }

      // Ignore transient network errors broadly in dev (HMR, navigation, analytics)
      if (errorMessage.includes("Failed to fetch")) {
        console.debug("Network fetch error (ignored):", errorMessage);
        return;
      }

      // Auto-recover from chunk loading failures (often after deploys or cache mismatch)
      const msg = errorMessage || "";
      const name = (error.error && (error.error as any).name) || "";
      if (
        name === "ChunkLoadError" ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk")
      ) {
        try {
          const key = "__chunk_reloaded__";
          const last = sessionStorage.getItem(key);
          if (!last || Date.now() - Number(last) > 30000) {
            sessionStorage.setItem(key, String(Date.now()));
            const url = new URL(window.location.href);
            url.searchParams.set("_r", String(Date.now()));
            window.location.replace(url.toString());
            return;
          }
        } catch {}
      }

      // Only log significant errors
      console.error("Client error:", error.error || error.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonString = reason?.toString() || "";

      // Filter out known non-critical rejections
      const isDevHmrFetch =
        process.env.NODE_ENV === "development" &&
        reasonString.includes("Failed to fetch") &&
        (reasonString.includes("webpack") || reasonString.includes("_next"));
      const isAnalytics =
        reasonString.includes("FullStory") ||
        reasonString.includes("fullstory.com") ||
        reasonString.includes("edge.fullstory.com");
      const isTransientNetwork =
        reasonString.includes("Failed to fetch") ||
        reasonString.includes("NetworkError") ||
        reasonString.includes("signal timed out") ||
        reasonString.includes("signal is aborted");

      // Chunk load auto-recover on unhandled rejections as well
      const reasonName = (reason && (reason as any).name) || "";
      const reasonMsg = (reason && (reason.message || reason.toString())) || "";
      if (
        reasonName === "ChunkLoadError" ||
        reasonMsg.includes("ChunkLoadError") ||
        reasonMsg.includes("Loading chunk")
      ) {
        try {
          const key = "__chunk_reloaded__";
          const last = sessionStorage.getItem(key);
          if (!last || Date.now() - Number(last) > 30000) {
            sessionStorage.setItem(key, String(Date.now()));
            const url = new URL(window.location.href);
            url.searchParams.set("_r", String(Date.now()));
            window.location.replace(url.toString());
            event.preventDefault();
            return;
          }
        } catch {}
      }

      if (isDevHmrFetch || isAnalytics || isTransientNetwork) {
        console.debug("Non-critical rejection (ignored):", reasonString);
        event.preventDefault();
        return;
      }

      console.error("Unhandled promise rejection:", reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
