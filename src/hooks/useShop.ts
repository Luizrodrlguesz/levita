import { useSyncExternalStore } from 'react';
import { getState, subscribe, type ShopState } from '../data/shop';

/** Assina o store da loja (carrinho e último pedido). */
export default function useShop(): ShopState {
  return useSyncExternalStore(subscribe, getState, getState);
}
