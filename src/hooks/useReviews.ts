import { useSyncExternalStore } from 'react';
import { getState, subscribe, type ReviewsState } from '../data/reviews';

/** Assina o store de avaliações e re-renderiza a cada mutação. */
export default function useReviews(): ReviewsState {
  return useSyncExternalStore(subscribe, getState, getState);
}
