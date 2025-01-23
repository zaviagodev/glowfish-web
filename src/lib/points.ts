import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PointsStore {
  availablePoints: number;
  selectedPoints: number;
  exchangeRate: number;
  minRedeem: number;
  maxRedeem: number | null;
  expiryDays: number | null;
  setSelectedPoints: (points: number) => void;
  getDiscountAmount: () => number;
  clearSelectedPoints: () => void;
  setExchangeRate: (rate: number) => void;
  setRedeemLimits: (min: number, max: number | null) => void;
  setExpiryDays: (days: number | null) => void;
}

export const usePoints = create<PointsStore>()(
  persist(
    (set, get) => ({
      availablePoints: 2500, // Mock value
      selectedPoints: 0,
      exchangeRate: 0.1,
      minRedeem: 100,
      maxRedeem: null,
      expiryDays: null,

      setSelectedPoints: (points) => {
        const { availablePoints } = get();
        const validPoints = Math.min(Math.max(0, points), availablePoints);
        set({ selectedPoints: validPoints });
      },

      getDiscountAmount: () => {
        const { selectedPoints, exchangeRate } = get();
        return selectedPoints * exchangeRate;
      },

      clearSelectedPoints: () => set({ selectedPoints: 0 }),

      setExchangeRate: (rate) => set({ exchangeRate: rate }),

      setRedeemLimits: (min, max) => set({ 
        minRedeem: min,
        maxRedeem: max 
      }),

      setExpiryDays: (days) => set({ expiryDays: days })
    }),
    {
      name: 'points-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          return {
            ...persistedState,
            exchangeRate: persistedState.pointsValue || 0.1,
            minRedeem: 100,
            maxRedeem: null,
            expiryDays: null
          };
        }
        return persistedState;
      }
    }
  )
);