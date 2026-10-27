import { buildWorld, worldProgress } from '@gambit/core';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { COURSES } from './content';
import { useStore } from './store';

/** Prochaine étape du monde en cours : ce que lance le bouton ▶ du menu. */
export function usePlay() {
  const store = useStore();
  const router = useRouter();
  const course = COURSES[store.course];
  const P = store.progress[store.course];
  const wi = Math.min(P.world, course.mondes.length - 1);
  const wm = useMemo(() => buildWorld(course, wi), [course, wi]);
  const { steps, total } = worldProgress(P, wm);
  const chestOpen = !!P.chest[wi], bossDone = !!P.boss[wi];
  const nextWorld = course.mondes[wi + 1];
  const chestDue = steps >= total / 2 && !chestOpen;

  const label = bossDone ? (nextWorld ? `Monde ${wi + 2}` : 'Réviser') : chestDue ? 'Coffre' : steps >= total ? 'Défi final' : steps ? 'Continuer' : 'Commencer';
  const play = () => {
    if (bossDone && nextWorld) { store.update((p) => { p.world = wi + 1; }); return router.navigate('/'); }
    if (chestDue) return router.push('/coffre');
    if (steps >= total && !bossDone) return router.push('/session?boss=1');
    router.push('/session');
  };
  return { P, wi, wm, steps, total, chestOpen, bossDone, label, play, ring: steps / total };
}
