import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText style={styles.emoji}>🏓</ThemedText>

          <ThemedText type="title" style={styles.title}>
            TT Trainer 2
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Organize seus alunos e aulas de tênis de mesa em um só lugar.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Bem-vindo!
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Este é o ponto de partida do app. Em breve você poderá gerenciar alunos, agendar aulas
              e acompanhar o progresso de cada treino.
            </ThemedText>
          </ThemedView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  emoji: {
    fontSize: 72,
    lineHeight: 84,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
});
