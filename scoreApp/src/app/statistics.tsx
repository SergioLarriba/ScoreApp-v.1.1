import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import PieChart from '@/components/charts/pieChart';
import Button from '../components/ui/Button';
import { convertToPieChartData } from '../utils/statistics';
import { useTranslation } from 'react-i18next';

export default function StatisticsScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const { currentMatch, history } = useStore();
	const matches = [
		...(currentMatch ? [currentMatch] : []),
		...history.filter((match) => match.id !== currentMatch?.id),
	];

	if (matches.length === 0) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>{t('statistics.noMatchData')}</Text>
					<Button title={t('match.goHome')} onPress={() => router.push('/')} />
				</View>
			</SafeAreaView>
		);
	}

	const config = currentMatch?.config ?? matches[0].config;
	const statistics = currentMatch?.statistics ?? matches[0].statistics;
	const chartData = currentMatch
		? convertToPieChartData(
			statistics.team1,
			statistics.team2,
			config.team1.name,
			config.team2.name
		)
		: [];

	const teamTotals = new Map<string, { winners: number; unforcedErrors: number }>();
	let totalWinners = 0;
	let totalForcedErrors = 0;
	let totalUnforcedErrors = 0;

	matches.forEach((match) => {
		const teams = [
			{ name: match.config.team1.name, stats: match.statistics.team1 },
			{ name: match.config.team2.name, stats: match.statistics.team2 },
		];

		teams.forEach(({ name, stats }) => {
			totalWinners += stats.winners;
			totalForcedErrors += stats.forcedErrors;
			totalUnforcedErrors += stats.unforcedErrors;
			const current = teamTotals.get(name) ?? { winners: 0, unforcedErrors: 0 };
			teamTotals.set(name, {
				winners: current.winners + stats.winners,
				unforcedErrors: current.unforcedErrors + stats.unforcedErrors,
			});
		});
	});

	const rankedTeams = Array.from(teamTotals.entries());
	const mostWinners = rankedTeams.reduce(
		(best, [name, totals]) => totals.winners > best.value ? { name, value: totals.winners } : best,
		{ name: t('common.notAvailable'), value: 0 }
	);
	const mostUnforcedErrors = rankedTeams.reduce(
		(best, [name, totals]) => totals.unforcedErrors > best.value ? { name, value: totals.unforcedErrors } : best,
		{ name: t('common.notAvailable'), value: 0 }
	);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>{t('statistics.title')}</Text>
					<Text style={styles.subtitle}>
						{currentMatch ? `${config.team1.name} ${t('history.vs')} ${config.team2.name}` : t('statistics.globalSummary')}
					</Text>
				</View>

				{/* Charts */}
				{currentMatch && chartData.length > 0 ? (
					chartData.map((chart, index) => (
						<PieChart key={index} title={chart.title} data={chart.data} />
					))
				) : currentMatch ? (
					<View style={styles.noDataContainer}>
						<Text style={styles.noDataText}>
							{t('statistics.noStatsYet')}
						</Text>
					</View>
				) : null}

				{/* Detailed Statistics */}
				<View style={styles.detailsContainer}>
					<Text style={styles.detailsTitle}>{t('statistics.globalStatistics')}</Text>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.totalWinners')}</Text>
						<Text style={styles.statValue}>{totalWinners}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.totalForcedErrors')}</Text>
						<Text style={styles.statValue}>{totalForcedErrors}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.totalUnforcedErrors')}</Text>
						<Text style={styles.statValue}>{totalUnforcedErrors}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.avgUnforcedErrors')}</Text>
						<Text style={styles.statValue}>{(totalUnforcedErrors / matches.length).toFixed(1)}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.mostWinners')}</Text>
						<Text style={styles.statValue}>{mostWinners.name} ({mostWinners.value})</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={styles.statLabel}>{t('statistics.mostUnforcedErrors')}</Text>
						<Text style={styles.statValue}>{mostUnforcedErrors.name} ({mostUnforcedErrors.value})</Text>
					</View>
				</View>

				<View style={styles.detailsContainer}>
					<Text style={styles.detailsTitle}>{t('statistics.detailedStatistics')}</Text>

					{/* Team 1 */}
					<View style={styles.teamStats}>
						<Text style={styles.teamName}>{config.team1.name}</Text>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.breakPointsShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team1.breakPointsWon} /
								{statistics.team1.breakPointsWon + statistics.team1.breakPointsLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.goldenPointsShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team1.goldenPointsWon} /
								{statistics.team1.goldenPointsWon + statistics.team1.goldenPointsLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.serviceGamesShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team1.serviceGamesWon} /
								{statistics.team1.serviceGamesWon + statistics.team1.serviceGamesLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.winners')}</Text>
							<Text style={styles.statValue}>{statistics.team1.winners}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.forcedErrors')}</Text>
							<Text style={styles.statValue}>{statistics.team1.forcedErrors}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.unforcedErrors')}</Text>
							<Text style={styles.statValue}>{statistics.team1.unforcedErrors}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.wonByForcedError')}</Text>
							<Text style={styles.statValue}>{statistics.team1.pointsWonByForcedError}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.wonByUnforcedError')}</Text>
							<Text style={styles.statValue}>{statistics.team1.pointsWonByUnforcedError}</Text>
						</View>
					</View>

					{/* Team 2 */}
					<View style={styles.teamStats}>
						<Text style={styles.teamName}>{config.team2.name}</Text>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.breakPointsShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team2.breakPointsWon} /
								{statistics.team2.breakPointsWon + statistics.team2.breakPointsLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.goldenPointsShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team2.goldenPointsWon} /
								{statistics.team2.goldenPointsWon + statistics.team2.goldenPointsLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.serviceGamesShort')}</Text>
							<Text style={styles.statValue}>
								{statistics.team2.serviceGamesWon} /
								{statistics.team2.serviceGamesWon + statistics.team2.serviceGamesLost}
							</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.winners')}</Text>
							<Text style={styles.statValue}>{statistics.team2.winners}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.forcedErrors')}</Text>
							<Text style={styles.statValue}>{statistics.team2.forcedErrors}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.unforcedErrors')}</Text>
							<Text style={styles.statValue}>{statistics.team2.unforcedErrors}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.wonByForcedError')}</Text>
							<Text style={styles.statValue}>{statistics.team2.pointsWonByForcedError}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>{t('statistics.wonByUnforcedError')}</Text>
							<Text style={styles.statValue}>{statistics.team2.pointsWonByUnforcedError}</Text>
						</View>
					</View>
				</View>

				{/* Back Button */}
				<Button
					title={t('statistics.backToMatch')}
					variant="outline"
					size="lg"
					onPress={() => router.back()}
				/>
			</ScrollView>
		</SafeAreaView>
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
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1f2937',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#6b7280',
		fontWeight: '500',
	},
	noDataContainer: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 32,
		alignItems: 'center',
		marginBottom: 24,
	},
	noDataText: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 24,
	},
	detailsContainer: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
	},
	detailsTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 16,
	},
	teamStats: {
		marginBottom: 20,
	},
	teamName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0ea5e9',
		marginBottom: 12,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	statLabel: {
		fontSize: 14,
		color: '#6b7280',
	},
	statValue: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1f2937',
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	emptyText: {
		fontSize: 18,
		color: '#6b7280',
		marginBottom: 24,
	},
});
