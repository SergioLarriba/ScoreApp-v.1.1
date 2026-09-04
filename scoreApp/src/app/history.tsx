import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	FlatList,
	TouchableOpacity,
	Alert,
} from 'react-native';
import { useStore } from '../store';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Match } from '../types';
import ComponentLayout from '@/layout/ComponentLayout';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen() {
	const { history, clearHistory } = useStore();
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const { t, i18n } = useTranslation(); 

	const handleClearHistory = () => {
		Alert.alert(
			t('history.clearHistoryTitle'),
			t('history.clearConfirmDetailed'),
			[
				{ text: t('common.cancel'), style: 'cancel' },
				{
					text: t('history.clear'),
					style: 'destructive',
						onPress: async () => {
							await clearHistory();
						},
					},
			]
		);
	};

	const handleMatchPress = (match: Match) => {
		setSelectedMatch(match);
		setShowDetailsModal(true);
	};

	const formatDate = (date: Date): string => {
		return new Date(date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getMatchResult = (match: Match): string => {
		const sets = match.score.sets;
		if (sets.length === 0) return t('history.noSetsCompleted');

		return sets
			.map((set) => `${set.team1Games}-${set.team2Games}`)
			.join(', ');
	};

	return (
		<ComponentLayout>
			<FlatList
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				data={history}
				keyExtractor={(match) => match.id}
				ListHeaderComponent={(
					<View style={styles.header}>
						<Text style={styles.title}>{t('home.matchHistory')}</Text>
						{history.length > 0 && (
							<TouchableOpacity onPress={handleClearHistory}>
								<Text style={styles.clearButton}>{t('history.clearHistory')}</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
				ListEmptyComponent={(
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>📋</Text>
						<Text style={styles.emptyText}>{t('history.noMatches')}</Text>
						<Text style={styles.emptySubtext}>
							{t('history.startPlaying')}
						</Text>
					</View>
				)}
				renderItem={({ item: match }) => (
					<TouchableOpacity
						onPress={() => handleMatchPress(match)}
						accessibilityLabel={t('history.openMatch', { team1: match.config.team1.name, team2: match.config.team2.name })}
						activeOpacity={0.7}
					>
						<Card style={styles.matchCard}>
							<View style={styles.matchHeader}>
								<Text style={styles.matchTeams}>{match.config.team1.name}</Text>
								<Text style={styles.vsText}>{t('history.vs')}</Text>
								<Text style={styles.matchTeams}>{match.config.team2.name}</Text>
							</View>

							<View style={styles.matchDetails}>
								<Text style={styles.matchResult}>{getMatchResult(match)}</Text>
								<Text style={styles.matchDate}>{formatDate(match.config.startTime)}</Text>
							</View>

							{match.winner && (
								<View style={styles.winnerBadge}>
									<Text style={styles.winnerText}>
										🏆 {match.winner === 'team1' ? match.config.team1.name : match.config.team2.name}
									</Text>
								</View>
							)}

							<View style={styles.matchFooter}>
								<Text style={styles.matchMode}>
									{match.config.scoringMode === 'golden-point' ? t('scoringMode.goldenPoint') : t('scoringMode.advantage')}
								</Text>
								<Text style={styles.matchStatus}>
									{match.status === 'completed' ? `✓ ${t('history.completed')}` : t('history.inProgress')}
								</Text>
							</View>
						</Card>
					</TouchableOpacity>
				)}
			/>

			{/* Match Details Modal */}
			{selectedMatch && (
				<Modal
					visible={showDetailsModal}
					onClose={() => setShowDetailsModal(false)}
					title={t('history.matchDetails')}
				>
					<ScrollView style={styles.modalScroll}>
						<Text style={styles.modalTeams}>
							{selectedMatch.config.team1.name} {t('history.vs')} {selectedMatch.config.team2.name}
						</Text>

						<View style={styles.modalSection}>
							<Text style={styles.modalSectionTitle}>{t('history.finalScore')}</Text>
							<Text style={styles.modalScore}>
								{t('history.setsResult', { team1: selectedMatch.score.setsWon.team1, team2: selectedMatch.score.setsWon.team2 })}
							</Text>
							{selectedMatch.score.sets.map((set, index) => (
								<Text key={index} style={styles.modalSetScore}>
									{t('history.setScore', { number: index + 1, team1Games: set.team1Games, team2Games: set.team2Games })}
								</Text>
							))}
						</View>

						<View style={styles.modalSection}>
							<Text style={styles.modalSectionTitle}>{t('history.statistics')}</Text>
							<View style={styles.modalStatRow}>
								<Text style={styles.modalStatLabel}>{t('history.breakPointsWon')}</Text>
								<Text style={styles.modalStatValue}>
									{selectedMatch.statistics.team1.breakPointsWon} - {selectedMatch.statistics.team2.breakPointsWon}
								</Text>
							</View>
							<View style={styles.modalStatRow}>
								<Text style={styles.modalStatLabel}>{t('history.serviceGamesWon')}</Text>
								<Text style={styles.modalStatValue}>
									{selectedMatch.statistics.team1.serviceGamesWon} - {selectedMatch.statistics.team2.serviceGamesWon}
								</Text>
							</View>
							{selectedMatch.config.scoringMode === 'golden-point' && (
								<View style={styles.modalStatRow}>
									<Text style={styles.modalStatLabel}>{t('history.goldenPointsWon')}</Text>
									<Text style={styles.modalStatValue}>
										{selectedMatch.statistics.team1.goldenPointsWon} - {selectedMatch.statistics.team2.goldenPointsWon}
									</Text>
								</View>
							)}
							<View style={styles.modalStatRow}>
								<Text style={styles.modalStatLabel}>{t('history.winners')}</Text>
								<Text style={styles.modalStatValue}>
									{selectedMatch.statistics.team1.winners} - {selectedMatch.statistics.team2.winners}
								</Text>
							</View>
							<View style={styles.modalStatRow}>
								<Text style={styles.modalStatLabel}>{t('history.forcedErrors')}</Text>
								<Text style={styles.modalStatValue}>
									{selectedMatch.statistics.team1.forcedErrors} - {selectedMatch.statistics.team2.forcedErrors}
								</Text>
							</View>
							<View style={styles.modalStatRow}>
								<Text style={styles.modalStatLabel}>{t('history.unforcedErrors')}</Text>
								<Text style={styles.modalStatValue}>
									{selectedMatch.statistics.team1.unforcedErrors} - {selectedMatch.statistics.team2.unforcedErrors}
								</Text>
							</View>
						</View>

						<View style={styles.modalSection}>
							<Text style={styles.modalSectionTitle}>{t('history.matchInfo')}</Text>
							<Text style={styles.modalInfo}>
								{t('history.started')} {formatDate(selectedMatch.config.startTime)}
							</Text>
							{selectedMatch.endTime && (
								<Text style={styles.modalInfo}>
									{t('history.ended')} {formatDate(selectedMatch.endTime)}
								</Text>
							)}
							<Text style={styles.modalInfo}>
								{t('history.mode')} {selectedMatch.config.scoringMode === 'golden-point' ? t('scoringMode.goldenPoint') : t('scoringMode.advantage')}
							</Text>
						</View>
					</ScrollView>
				</Modal>
			)}
		</ComponentLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 24,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1f2937',
	},
	clearButton: {
		fontSize: 14,
		fontWeight: '600',
		color: '#ef4444',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 14,
		color: '#6b7280',
	},
	matchCard: {
		marginBottom: 16,
	},
	matchHeader: {
		alignItems: 'center',
		marginBottom: 12,
	},
	matchTeams: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
	},
	vsText: {
		fontSize: 12,
		color: '#9ca3af',
		marginVertical: 4,
	},
	matchDetails: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	matchResult: {
		fontSize: 14,
		fontWeight: '600',
		color: '#0ea5e9',
	},
	matchDate: {
		fontSize: 12,
		color: '#6b7280',
	},
	winnerBadge: {
		backgroundColor: '#fef3c7',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 8,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	winnerText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#92400e',
	},
	matchFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
	},
	matchMode: {
		fontSize: 12,
		color: '#6b7280',
	},
	matchStatus: {
		fontSize: 12,
		fontWeight: '600',
		color: '#10b981',
	},
	modalScroll: {
		maxHeight: 400,
	},
	modalTeams: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 20,
	},
	modalSection: {
		marginBottom: 20,
	},
	modalSectionTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	modalScore: {
		fontSize: 16,
		fontWeight: '600',
		color: '#0ea5e9',
		marginBottom: 8,
	},
	modalSetScore: {
		fontSize: 14,
		color: '#374151',
		marginBottom: 4,
	},
	modalStatRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	modalStatLabel: {
		fontSize: 14,
		color: '#6b7280',
	},
	modalStatValue: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1f2937',
	},
	modalInfo: {
		fontSize: 14,
		color: '#374151',
		marginBottom: 4,
	},
});
