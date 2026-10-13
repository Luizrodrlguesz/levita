import { useSyncExternalStore } from 'react';
import { getState, subscribe, type StaffState } from '../data/staff';

/** Assina as contas da equipe e a sessão do HUB. */
export default function useStaff(): StaffState {
  return useSyncExternalStore(subscribe, getState, getState);
}
