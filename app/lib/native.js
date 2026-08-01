"use client";

let capacitorCore = null;
async function getCore() {
  if (!capacitorCore) {
    capacitorCore = await import("@capacitor/core");
  }
  return capacitorCore;
}

export async function isNative() {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await getCore();
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function shareImage(dataUri, filename, title) {
  try {
    const { Share } = await import("@capacitor/share");
    const { Filesystem, Directory } = await import("@capacitor/filesystem").catch(() => ({}));
    if (Filesystem) {
      const base64 = dataUri.split(",")[1];
      const written = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({ title, url: written.uri, dialogTitle: title });
      return true;
    }
  } catch {
    // fall through to web share
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const res = await fetch(dataUri);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title, files: [file] });
        return true;
      }
      await navigator.share({ title });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function cacheLastReveal(data) {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: "inkling_last_reveal", value: JSON.stringify(data) });
  } catch {
    try {
      window.localStorage.setItem("inkling_last_reveal", JSON.stringify(data));
    } catch {}
  }
}

export async function getCachedReveal() {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: "inkling_last_reveal" });
    return value ? JSON.parse(value) : null;
  } catch {
    try {
      const value = window.localStorage.getItem("inkling_last_reveal");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
}

export async function notifyPortraitReady(characterName) {
  try {
    if (!(await isNative())) return;
    if (typeof document !== "undefined" && document.visibilityState === "visible") return;
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 100000),
          title: "Portrait ready",
          body: `${characterName}'s portrait has been painted. Come take a look.`,
          smallIcon: "ic_launcher",
        },
      ],
    });
  } catch {
    // notifications are best-effort
  }
}

export async function initNativeChrome() {
  try {
    if (!(await isNative())) return;
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0c0d1c" });
  } catch {}
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {}
}
