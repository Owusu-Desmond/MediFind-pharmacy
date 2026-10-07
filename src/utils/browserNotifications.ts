// Utility for Browser Web Notifications & Audio Alerts

class BrowserNotificationManager {
  private audioCtx: AudioContext | null = null;
  private lastNotifiedIds = new Set<string | number>();

  // Request browser permission for system notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return "denied";
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  }

  // Plays a pleasant, professional chime using Web Audio API (no external mp3 files needed)
  playAlertSound(type: "order" | "success" | "alert" = "order") {
    if (typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === "order") {
        // High-low-high triple chime for new incoming orders
        const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6
        notes.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      } else {
        // Gentle double chime for standard alerts
        const notes = [523.25, 659.25]; // C5, E5
        notes.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.3);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.35);
        });
      }
    } catch (err) {
      console.warn("Audio alert failed to play:", err);
    }
  }

  // Show a real OS/browser desktop notification banner
  showNotification(
    title: string,
    options?: {
      body?: string;
      id?: string | number;
      sound?: boolean;
      soundType?: "order" | "success" | "alert";
      url?: string;
      tag?: string;
    }
  ) {
    if (typeof window === "undefined") return;

    // Deduplicate if already notified
    if (options?.id) {
      if (this.lastNotifiedIds.has(options.id)) {
        return;
      }
      this.lastNotifiedIds.add(options.id);
      // Keep set bounded
      if (this.lastNotifiedIds.size > 200) {
        const first = this.lastNotifiedIds.values().next().value;
        if (first !== undefined) {
          this.lastNotifiedIds.delete(first);
        }
      }
    }

    // Play chime if enabled
    if (options?.sound !== false) {
      this.playAlertSound(options?.soundType || "order");
    }

    // Check system permission
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body: options?.body || "MediFind Ghana Alert",
          icon: "/favicon.ico",
          tag: options?.tag || (options?.id ? String(options.id) : undefined),
        });

        if (options?.url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = options.url!;
          };
        }
      } catch (e) {
        console.warn("Failed to create browser notification:", e);
      }
    }
  }
}

export const browserNotifications = new BrowserNotificationManager();
