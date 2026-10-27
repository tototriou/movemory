const FR: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C' };

/** Notation française : C (cavalier), F (fou), T (tour), D (dame), R (roi). */
export const fr = (san: string) => san.replace(/^[KQRBN]/, (p) => FR[p]!).replace(/=([QRBN])/, (_, p: string) => '=' + FR[p]);
export const moveLabel = (ply: number, san: string) => `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? '.' : '…'}${fr(san)}`;
