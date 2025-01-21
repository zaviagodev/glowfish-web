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
}

type NewCartItem = Omit<CartItem, 'quantity'>;

interface CartStore {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item: NewCartItem) => {
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
            
            return { items: newItems };
          }

          // Add new item with quantity 1
          return {
            items: [...state.items, { ...item, quantity: 1 }]
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter(i => i.variantId !== variantId)
        }));
      },

      updateQuantity: (variantId, newQuantity) => {
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

          return { items: newItems };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          // Reset cart state for new version
          return { items: [] };
        }
        return persistedState;
      }
    }
  )
);