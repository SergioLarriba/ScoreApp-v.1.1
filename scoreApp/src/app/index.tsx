import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import ComponentLayout from '@/layout/ComponentLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Match } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { currentMatch, history, loadHistory } = useStore();

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // Get last 5 matches
  const recentMatches = history.slice(0, 5);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric' });
  };

  const getMatchResult = (match: Match) => {
    const team1Sets = match.score.setsWon.team1;
    const team2Sets = match.score.setsWon.team2;
    return `${team1Sets} - ${team2Sets}`;
  };

  return (
    <ComponentLayout>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Settings Button */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {t('home.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('home.subtitle')}
          </Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.primaryLight + '40',
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={styles.logoEmoji}>🥎</Text>
          </View>
        </View>

        {/* Recent Matches Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.recentMatches')}
          </Text>

          {recentMatches.length === 0 ? (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="tennisball-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('home.noRecentMatches')}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                  {t('home.startPlayingMessage')}
                </Text>
              </View>
            </Card>
          ) : (
            recentMatches.map((match) => (
              <Card key={match.id} style={styles.matchCard}>
                <TouchableOpacity
                  onPress={() => {
                    // Navigate to match details or statistics
                    router.push('/history');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.matchHeader}>
                    <Text style={[styles.matchDate, { color: colors.textSecondary }]}>
                      {formatDate(match.config.startTime)}
                    </Text>
                    {match.status === 'completed' && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.completedText, { color: colors.success }]}>
                          {t('match.completed')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.matchContent}>
                    <View style={styles.teamsContainer}>
                      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                        {match.config.team1.name}
                      </Text>
                      <Text style={[styles.vsText, { color: colors.textTertiary }]}>
                        {t('home.vs')}
                      </Text>
                      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                        {match.config.team2.name}
                      </Text>
                    </View>

                    <View style={styles.resultContainer}>
                      <Text style={[styles.resultText, { color: colors.primary }]}>
                        {getMatchResult(match)}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {currentMatch?.status === 'in-progress' && (
            <Button
              title={t('home.continueActiveMatch')}
              variant="secondary"
              size="lg"
              onPress={() => router.push('/match')}
            />
          )}
          <Button
            title={t('home.newMatch')}
            size="lg"
            onPress={() => router.push('/match-setup')}
          />
          <Button
            title={t('home.allMatches')}
            variant="outline"
            size="lg"
            onPress={() => router.push('/history')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            {t('home.footer')}
          </Text>
        </View>
      </ScrollView>
    </ComponentLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsButton: {
    padding: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  matchCard: {
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamsContainer: {
    flex: 1,
    marginRight: 16,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  vsText: {
    fontSize: 12,
    marginVertical: 2,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
