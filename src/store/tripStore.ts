import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GeoPoint, TripSnapshot, TripStatus } from '@/src/types';

interface TripStore extends TripSnapshot {
  applyLocation: (point: GeoPoint, addedMeters: number) => void;
  startTrip: () => void;
  pauseTrip: () => void;
  resumeTrip: () => void;
  stopTrip: () => void;
  resetTrip: () => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

const idleSnapshot: TripSnapshot = {
  status: 'idle',
  distanceMeters: 0,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  maxSpeedMps: 0,
  lastPoint: null,
};

export function getTripElapsedMs(trip: TripSnapshot, now = Date.now()): number {
  if (!trip.startedAt) return 0;
  const pauseExtra =
    trip.status === 'paused' && trip.pausedAt ? now - trip.pausedAt : 0;
  return Math.max(0, now - trip.startedAt - trip.totalPausedMs - pauseExtra);
}

export function getAverageSpeedMps(trip: TripSnapshot, now = Date.now()): number {
  const elapsedSec = getTripElapsedMs(trip, now) / 1000;
  if (elapsedSec <= 0) return 0;
  return trip.distanceMeters / elapsedSec;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      ...idleSnapshot,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),

      applyLocation: (point, addedMeters) => {
        const { status, maxSpeedMps } = get();
        if (status !== 'active') return;

        const speed = point.speed != null && point.speed > 0 ? point.speed : 0;
        set((state) => ({
          lastPoint: point,
          distanceMeters: state.distanceMeters + addedMeters,
          maxSpeedMps: Math.max(maxSpeedMps, speed),
        }));
      },

      startTrip: () => {
        set({
          status: 'active' as TripStatus,
          distanceMeters: 0,
          startedAt: Date.now(),
          pausedAt: null,
          totalPausedMs: 0,
          maxSpeedMps: 0,
          lastPoint: null,
        });
      },

      pauseTrip: () => {
        const { status } = get();
        if (status !== 'active') return;
        set({ status: 'paused', pausedAt: Date.now() });
      },

      resumeTrip: () => {
        const { status, pausedAt, totalPausedMs } = get();
        if (status !== 'paused' || !pausedAt) return;
        set({
          status: 'active',
          pausedAt: null,
          totalPausedMs: totalPausedMs + (Date.now() - pausedAt),
        });
      },

      stopTrip: () => {
        const { status, pausedAt, totalPausedMs } = get();
        if (status === 'idle') return;
        let paused = totalPausedMs;
        if (status === 'paused' && pausedAt) {
          paused += Date.now() - pausedAt;
        }
        set({
          status: 'completed',
          pausedAt: null,
          totalPausedMs: paused,
        });
      },

      resetTrip: () => set({ ...idleSnapshot }),
    }),
    {
      name: 'dashride-trip',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        status: state.status,
        distanceMeters: state.distanceMeters,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        totalPausedMs: state.totalPausedMs,
        maxSpeedMps: state.maxSpeedMps,
        lastPoint: state.lastPoint,
      }),
    },
  ),
);
