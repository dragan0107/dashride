import * as Haptics from 'expo-haptics';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import {
  startBackgroundUpdates,
  stopBackgroundUpdates,
} from '@/src/services/locationTask';
import {
  getAverageSpeedMps,
  getTripElapsedMs,
  useTripStore,
} from '@/src/store/tripStore';

export function useTripActions() {
  const status = useTripStore((s) => s.status);
  const hydrated = useTripStore((s) => s.hydrated);
  const distanceMeters = useTripStore((s) => s.distanceMeters);
  const maxSpeedMps = useTripStore((s) => s.maxSpeedMps);
  const startedAt = useTripStore((s) => s.startedAt);
  const pausedAt = useTripStore((s) => s.pausedAt);
  const totalPausedMs = useTripStore((s) => s.totalPausedMs);
  const lastPoint = useTripStore((s) => s.lastPoint);

  const startTrip = useTripStore((s) => s.startTrip);
  const pauseTrip = useTripStore((s) => s.pauseTrip);
  const resumeTrip = useTripStore((s) => s.resumeTrip);
  const stopTrip = useTripStore((s) => s.stopTrip);
  const resetTrip = useTripStore((s) => s.resetTrip);

  const start = useCallback(async () => {
    startTrip();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await startBackgroundUpdates();
    } catch (e) {
      console.warn('Background updates failed to start', e);
    }
  }, [startTrip]);

  const pause = useCallback(async () => {
    pauseTrip();
    await Haptics.selectionAsync();
    try {
      await stopBackgroundUpdates();
    } catch {
      // ignore
    }
  }, [pauseTrip]);

  const resume = useCallback(async () => {
    resumeTrip();
    await Haptics.selectionAsync();
    try {
      await startBackgroundUpdates();
    } catch (e) {
      console.warn('Background updates failed to resume', e);
    }
  }, [resumeTrip]);

  const stop = useCallback(async () => {
    stopTrip();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await stopBackgroundUpdates();
    } catch {
      // ignore
    }
  }, [stopTrip]);

  const reset = useCallback(async () => {
    resetTrip();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await stopBackgroundUpdates();
    } catch {
      // ignore
    }
  }, [resetTrip]);

  // Resume background tracking only when hydrated + app is foregrounded.
  // Starting an Android FGS from the background crashes the process.
  useEffect(() => {
    if (!hydrated || status !== 'active') return;
    if (AppState.currentState !== 'active') return;

    startBackgroundUpdates().catch(() => undefined);
  }, [status, hydrated]);

  const snapshot = {
    status,
    distanceMeters,
    maxSpeedMps,
    startedAt,
    pausedAt,
    totalPausedMs,
    lastPoint,
  };

  return {
    ...snapshot,
    elapsedMs: getTripElapsedMs(snapshot),
    avgSpeedMps: getAverageSpeedMps(snapshot),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
