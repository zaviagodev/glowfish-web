import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validUntil: string;
  isApplicable: boolean;
}

interface CouponStore {
  selectedCoupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;
  getTotalDiscount: (subtotal: number) => number;
}

export const useCoupons = create<CouponStore>()(
  persist(
    (set, get) => ({
      selectedCoupons: [],
      
      addCoupon: (coupon) => {
        set((state) => ({
          selectedCoupons: [...state.selectedCoupons, coupon]
        }));
      },

      removeCoupon: (couponId) => {
        set((state) => ({
          selectedCoupons: state.selectedCoupons.filter(c => c.id !== couponId)
        }));
      },

      clearCoupons: () => set({ selectedCoupons: [] }),

      getTotalDiscount: (subtotal) => {
        const { selectedCoupons } = get();
        return selectedCoupons.reduce((total, coupon) => {
          let discount = 0;
          
          if (subtotal >= (coupon.minPurchase || 0)) {
            if (coupon.type === 'percentage') {
              discount = subtotal * (coupon.value / 100);
              if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
              }
            } else if (coupon.type === 'fixed') {
              discount = coupon.value;
            }
          }
          
          return total + discount;
        }, 0);
      }
    }),
    {
      name: 'coupon-storage',
      version: 1
    }
  )
);