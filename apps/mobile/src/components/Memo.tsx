import { SvgXml } from 'react-native-svg';

export type Mood = 'content' | 'reflechit' | 'bravo' | 'oups';

/* Memo, la mascotte : un petit échiquier à lunettes, nœud papillon doré et baskets vertes. */
function memoXml(mood: Mood) {
  const poses: Record<Mood, [string, number[], string, number[]]> = {
    content: ['M21 58 Q10 64 9 76', [9, 78], 'M99 52 Q110 46 110 32', [110, 29]],
    reflechit: ['M21 60 Q10 72 22 80 L34 76', [36, 75], 'M99 58 Q110 64 111 76', [111, 78]],
    bravo: ['M21 50 Q8 40 10 24', [10, 21], 'M99 50 Q112 40 110 24', [110, 21]],
    oups: ['M21 52 Q8 36 20 14 L28 10', [30, 9], 'M99 58 Q110 64 111 76', [111, 78]],
  };
  const brows: Record<Mood, string> = {
    content: 'M37 29 q9 -5 18 0 M65 29 q9 -5 18 0',
    reflechit: 'M37 27 q9 -6 18 -1 M65 31 q9 -1 18 0',
    bravo: 'M37 26 q9 -7 18 0 M65 26 q9 -7 18 0',
    oups: 'M37 27 q9 3 18 6 M65 33 q9 -3 18 -6',
  };
  const mouths: Record<Mood, [string, string, string]> = {
    content: ['M47 64 Q60 76 73 64 Z', '#7A2E3E', 'M49 65 Q60 69 71 65 L70 67.5 Q60 71 50 67.5 Z'],
    reflechit: ['M52 68 Q58 66 68 69', 'none', ''],
    bravo: ['M44 62 Q60 82 76 62 Z', '#7A2E3E', 'M46 63 Q60 68 74 63 L73 66.5 Q60 71 47 66.5 Z'],
    oups: ['M48 70 q4 -4 8 0 q4 4 8 0 q4 -4 8 0', 'none', ''],
  };
  const [aL, hL, aR, hR] = poses[mood];
  const [mp, mf, teeth] = mouths[mood];
  const look = mood === 'reflechit' ? 3 : 1, py = mood === 'reflechit' ? 41 : 45;
  const checks = [[43, 16], [77, 16], [26, 33], [60, 33], [43, 50], [77, 50], [26, 67], [60, 67]]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="17" height="17" fill="#6D8FB3"/>`).join('');
  const eyes = mood === 'bravo'
    ? '<path d="M40 46 q6 -7 12 0 M68 46 q6 -7 12 0" fill="none" stroke="#1E1B2E" stroke-width="3" stroke-linecap="round"/>'
    : `<circle cx="${46 + look}" cy="${py}" r="4.6" fill="#1E1B2E"/><circle cx="${74 + look}" cy="${py}" r="4.6" fill="#1E1B2E"/><circle cx="${47.5 + look}" cy="${py - 1.5}" r="1.5" fill="#fff"/><circle cx="${75.5 + look}" cy="${py - 1.5}" r="1.5" fill="#fff"/>`;
  const extra = mood === 'oups' ? '<path d="M100 22 q5 8 0 11 q-5 -3 0 -11 z" fill="#8FD3FF"/>'
    : mood === 'bravo' ? '<path d="M106 8 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z M12 6 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="#FFC94A"/>' : '';
  return `<svg viewBox="0 0 120 120">
    <ellipse cx="60" cy="116" rx="30" ry="4" fill="#000" fill-opacity="0.25"/>
    <path d="M50 92 L48 108 M70 92 L72 108" fill="none" stroke="#3B2A20" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 106 q-1 -5 7 -5 q6 0 7 6 z M66 107 q1 -6 7 -6 q8 0 7 5 z" fill="#1A9E4B"/>
    <path d="M40 106 h14 M66 107 h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="${aL}" fill="none" stroke="#3B2A20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${aR}" fill="none" stroke="#3B2A20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="20" y="12" width="80" height="82" rx="9" fill="#6C4524"/><rect x="20" y="10" width="80" height="80" rx="9" fill="#9A6233"/>
    <rect x="26" y="16" width="68" height="68" rx="3" fill="#F2E8D5"/>${checks}
    <circle cx="${hL[0]}" cy="${hL[1]}" r="6" fill="#fff" stroke="#C9C3D6" stroke-width="1.5"/><circle cx="${hR[0]}" cy="${hR[1]}" r="6" fill="#fff" stroke="#C9C3D6" stroke-width="1.5"/>
    <path d="${brows[mood]}" fill="none" stroke="#3B2A20" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="46" cy="44" r="11.5" fill="#fff" fill-opacity="0.9"/><circle cx="74" cy="44" r="11.5" fill="#fff" fill-opacity="0.9"/>${eyes}
    <circle cx="46" cy="44" r="11.5" fill="none" stroke="#1E1B2E" stroke-width="3.4"/><circle cx="74" cy="44" r="11.5" fill="none" stroke="#1E1B2E" stroke-width="3.4"/>
    <path d="M57.5 43 q2.5 -3 5 0 M34.5 42 L27 39 M85.5 42 L93 39" fill="none" stroke="#1E1B2E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="35" cy="62" rx="5" ry="3.2" fill="#FF8FB1" fill-opacity="0.6"/><ellipse cx="85" cy="62" rx="5" ry="3.2" fill="#FF8FB1" fill-opacity="0.6"/>
    <path d="${mp}" fill="${mf}" stroke="#5A1E2A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${teeth ? `<path d="${teeth}" fill="#fff"/>` : ''}
    <path d="M52 92 l8 4 l8 -4 l0 8 l-8 -4 l-8 4 z" fill="#FFC94A" stroke="#C9951E" stroke-width="1.2" stroke-linejoin="round"/>${extra}
  </svg>`;
}

const cache = new Map<Mood, string>();

export function Memo({ mood = 'content', size = 70 }: { mood?: Mood; size?: number }) {
  if (!cache.has(mood)) cache.set(mood, memoXml(mood));
  return <SvgXml xml={cache.get(mood)!} width={size} height={size} accessibilityLabel="Memo, la mascotte" />;
}
