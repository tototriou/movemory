import {
  buildCards,
  buildDailySession,
  checkMove,
  DEPTH_BY_LEVEL,
  hintSquare,
  review,
  newReviewState,
  STARTER_REPERTOIRE,
  type Exercise,
  type ReviewState,
} from '@gambit/core';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Board } from '@/components/board';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';

type Feedback = { correct: boolean; played: string | null } | null;

export default function DailyQuizScreen() {
  // TODO: états de révision persistés (Supabase) au lieu de la mémoire.
  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const cards = useMemo(() => buildCards(STARTER_REPERTOIRE, DEPTH_BY_LEVEL.intermediaire), []);
  const [queue, setQueue] = useState<Exercise[]>(() => buildDailySession(cards, {}, { maxNew: 8 }));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState(false);
  const shownAt = useRef(Date.now());

  const exercise = queue[index];

  const answer = (input: string) => {
    if (!exercise || feedback) return;
    const { correct, san } = checkMove(exercise.card, input);
    const now = new Date();
    const prev = states[exercise.card.id] ?? newReviewState(now);
    setStates({ ...states, [exercise.card.id]: review(prev, { correct, timeMs: Date.now() - shownAt.current, usedHint: hint }, now) });
    setFeedback({ correct, played: san });
    if (correct) setScore(score + 1);
    // Comme Duolingo : une erreur est reposée en fin de session, cette fois de mémoire.
    else setQueue([...queue, { ...exercise, isNew: false }]);
  };

  const next = () => {
    setFeedback(null);
    setHint(false);
    setIndex(index + 1);
    shownAt.current = Date.now();
  };

  if (!exercise) {
    return (
      <Screen>
        <ThemedText type="subtitle">Révision du jour terminée 🎉</ThemedText>
        <ThemedText>
          {score} bonnes réponses sur {queue.length}. Les positions ratées reviendront plus souvent.
        </ThemedText>
      </Screen>
    );
  }

  const { card } = exercise;
  return (
    <Screen>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(index / queue.length) * 100}%` }]} />
      </View>
      <ThemedText type="smallBold">{card.lineNames[0]}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {card.history.length ? card.history.join(' ') : 'Position initiale'}
      </ThemedText>
      <ThemedText>
        {card.side === 'w' ? 'Blancs' : 'Noirs'} : quel est votre coup ?
      </ThemedText>

      <Board
        fen={card.fen}
        orientation={card.side}
        onMove={feedback ? undefined : answer}
        highlight={hint || exercise.isNew ? [hintSquare(card)] : []}
      />

      {!feedback && (
        <Pressable onPress={() => setHint(true)} style={styles.hintButton}>
          <ThemedText type="smallBold">💡 Indice</ThemedText>
        </Pressable>
      )}

      {feedback && (
        <ThemedView type="backgroundElement" style={styles.feedback}>
          <ThemedText type="smallBold">
            {feedback.correct ? 'Bravo !' : `Raté — la bonne réponse : ${card.expected.join(' ou ')}`}
          </ThemedText>
          <Pressable onPress={next} style={styles.nextButton}>
            <ThemedText type="smallBold" style={{ color: '#fff' }}>
              Continuer
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, paddingBottom: BottomTabInset },
  content: { padding: Spacing.four, paddingTop: TopTabInset + Spacing.four, gap: Spacing.three, alignItems: 'center' },
  progressTrack: { alignSelf: 'stretch', height: 12, borderRadius: 6, backgroundColor: '#e5e5e5' },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: '#58cc02' },
  hintButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#d0d0d0' },
  feedback: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  nextButton: { alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#58cc02' },
});
