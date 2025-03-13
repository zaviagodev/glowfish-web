import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  variant?: Record<string, string>;
  isEvent?: boolean;
}

type NewCartItem = Omit<CartItem, 'quantity'>;

interface CartStore {
  items: CartItem[];
  lastUpdated: number | null;
  addItem: (item: NewCartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: null,
      
      addItem: (item: NewCartItem) => {
        const now = Date.now();
        const lastUpdated = get().lastUpdated;
        
        // Clear cart if it's expired
        if (lastUpdated && now - lastUpdated > EXPIRY_TIME) {
          set({ items: [], lastUpdated: now });
          return;
        }

        // Check if the new item is an event
        const isNewItemEvent = item.isEvent || false;
        
        // Check if there are any existing items
        const existingItems = get().items;
        
        // If there are existing items, check if they are of a different type
        if (existingItems.length > 0) {
          const existingItemIsEvent = existingItems[0].isEvent || false;
          
          // If the new item type is different from existing items, clear the cart
          if (isNewItemEvent !== existingItemIsEvent) {
            set({ items: [], lastUpdated: now });
          }
        }
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(i => i.variantId === item.variantId);
          
          if (existingItemIndex !== -1) {
            // Create a new array to ensure state update
            const newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            
            // Calculate new quantity
            const newQuantity = Math.min(existingItem.quantity + 1, item.maxQuantity);
            
            // Update item with new quantity
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity
            };
            
            return { items: newItems, lastUpdated: now };
          }

          // Add new item with quantity 1
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            lastUpdated: now
          };
        });
      },

      removeItem: (variantId) => {
        const now = Date.now();
        const lastUpdated = get().lastUpdated;
        
        // Clear cart if it's expired
        if (lastUpdated && now - lastUpdated > EXPIRY_TIME) {
          set({ items: [], lastUpdated: now });
          return;
        }
        
        set((state) => ({
          items: state.items.filter(i => i.variantId !== variantId),
          lastUpdated: now
        }));
      },

      updateQuantity: (variantId, newQuantity) => {
        const now = Date.now();
        const lastUpdated = get().lastUpdated;
        
        // Clear cart if it's expired
        if (lastUpdated && now - lastUpdated > EXPIRY_TIME) {
          set({ items: [], lastUpdated: now });
          return;
        }
        
        set((state) => {
          const itemIndex = state.items.findIndex(i => i.variantId === variantId);
          if (itemIndex === -1) return state;

          const item = state.items[itemIndex];
          const validQuantity = Math.max(1, Math.min(newQuantity, item.maxQuantity));

          const newItems = [...state.items];
          newItems[itemIndex] = {
            ...item,
            quantity: validQuantity
          };

          return { items: newItems, lastUpdated: now };
        });
      },

      clearCart: () => set({ items: [], lastUpdated: null }),

      getTotalItems: () => {
        const now = Date.now();
        const lastUpdated = get().lastUpdated;
        
        // Return 0 if cart is expired
        if (lastUpdated && now - lastUpdated > EXPIRY_TIME) {
          set({ items: [], lastUpdated: null });
          return 0;
        }
        
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const now = Date.now();
        const lastUpdated = get().lastUpdated;
        
        // Return 0 if cart is expired
        if (lastUpdated && now - lastUpdated > EXPIRY_TIME) {
          set({ items: [], lastUpdated: null });
          return 0;
        }
        
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState: any, version: number) => {
        if (version < 5) {
          // Reset cart state for new version with lastUpdated
          return { items: [], lastUpdated: null };
        }
        return persistedState;
      }
    }
  )
);