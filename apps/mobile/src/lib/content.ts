import type { Course } from '@gambit/core';

import italienne from '../../../../content/fr/italienne.json';
import noirs from '../../../../content/fr/repertoire-noirs.json';

/** Les répertoires disponibles : un pour les Blancs, un pour les Noirs. */
export const COURSES: Record<'w' | 'b', Course> = {
  w: italienne as Course,
  b: noirs as Course,
};
export type CourseKey = keyof typeof COURSES;
export const COURSE_LABELS: Record<CourseKey, string> = { w: 'Blancs · Italienne', b: 'Noirs · Sicilienne' };
