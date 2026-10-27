import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyProgress, type Progress } from '@gambit/core';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { CourseKey } from './content';

/* Progression sauvegardée sur l'appareil (fonctionne hors-ligne), un état par répertoire. */
const KEY = 'movemory-v1';
interface Saved {
  course: CourseKey;
  progress: Record<CourseKey, Progress>;
  /** Série de jours : nombre de jours d'affilée avec au moins une séance. */
  streak: { days: number; last: string };
  /** Mode test : tous les mondes, coffres et défis accessibles. */
  unlock: boolean;
}
interface Store extends Saved {
  ready: boolean;
  setCourse: (c: CourseKey) => void;
  setUnlock: (on: boolean) => void;
  /** Lecture synchrone de la progression du répertoire courant (toujours à jour, même entre deux rendus). */
  get: () => Progress;
  /** Remplace la progression du répertoire courant (copiée) et la sauvegarde. */
  save: (p: Progress) => void;
  update: (fn: (p: Progress) => void) => void;
  /** À appeler en fin de séance. */
  markPlayed: () => void;
  reset: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const initial = (): Saved => ({ course: 'w', progress: { w: emptyProgress(), b: emptyProgress() }, streak: { days: 0, last: '' }, unlock: false });
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Saved>(initial());
  const [state, setState] = useState<Saved>(ref.current);
  const [ready, setReady] = useState(false);

  const commit = useCallback((next: Saved) => {
    ref.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw) as Partial<Saved>;
        const base = initial();
        ref.current = { ...base, ...s, progress: { w: { ...base.progress.w, ...s.progress?.w }, b: { ...base.progress.b, ...s.progress?.b } } };
        setState(ref.current);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<Store>(() => {
    const save = (p: Progress) => { const s = ref.current; commit({ ...s, progress: { ...s.progress, [s.course]: structuredClone(p) } }); };
    return {
      ...state,
      ready,
      setCourse: (course) => commit({ ...ref.current, course }),
      setUnlock: (unlock) => commit({ ...ref.current, unlock }),
      get: () => structuredClone(ref.current.progress[ref.current.course]),
      save,
      update: (fn) => { const p = structuredClone(ref.current.progress[ref.current.course]); fn(p); save(p); },
      markPlayed: () => {
        const { streak } = ref.current; const t = today();
        if (streak.last === t) return;
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        commit({ ...ref.current, streak: { days: streak.last === yesterday ? streak.days + 1 : 1, last: t } });
      },
      reset: () => save(emptyProgress()),
    };
  }, [state, ready, commit]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore() hors de <StoreProvider>');
  return s;
}

/** Progression du répertoire affiché. */
export const useProgress = () => { const s = useStore(); return s.progress[s.course]; };
