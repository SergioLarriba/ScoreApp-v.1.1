import { Statistics, TeamStatistics, PieChartData, StatisticChartData } from '../types';
import i18n from '@/i18n/i18n';

/**
 * Initialize empty statistics for a new match
 */
export function initializeStatistics(): Statistics {
	return {
		team1: {
			breakPointsWon: 0,
			breakPointsLost: 0,
			goldenPointsWon: 0,
			goldenPointsLost: 0,
			serviceGamesWon: 0,
			serviceGamesLost: 0,
			winners: 0,
			forcedErrors: 0,
			unforcedErrors: 0,
			pointsWonByWinner: 0,
			pointsWonByForcedError: 0,
			pointsWonByUnforcedError: 0,
		},
		team2: {
			breakPointsWon: 0,
			breakPointsLost: 0,
			goldenPointsWon: 0,
			goldenPointsLost: 0,
			serviceGamesWon: 0,
			serviceGamesLost: 0,
			winners: 0,
			forcedErrors: 0,
			unforcedErrors: 0,
			pointsWonByWinner: 0,
			pointsWonByForcedError: 0,
			pointsWonByUnforcedError: 0,
		},
	};
}

/**
 * Calculate percentage for a statistic
 */
export function calculatePercentage(won: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((won / total) * 100);
}

/**
 * Convert team statistics to pie chart data
 */
export function convertToPieChartData(
	team1Stats: TeamStatistics,
	team2Stats: TeamStatistics,
	team1Name: string,
	team2Name: string
): StatisticChartData[] {
	const charts: StatisticChartData[] = [];

	// Break Points
	const totalBreakPoints =
		team1Stats.breakPointsWon +
		team1Stats.breakPointsLost +
		team2Stats.breakPointsWon +
		team2Stats.breakPointsLost;

	if (totalBreakPoints > 0) {
		charts.push({
			title: i18n.t('statistics.breakPointsWonChart'),
			data: [
				{
					label: team1Name,
					value: team1Stats.breakPointsWon,
					color: '#0ea5e9',
				},
				{
					label: team2Name,
					value: team2Stats.breakPointsWon,
					color: '#d946ef',
				},
			],
		});
	}

	// Golden Points (if any)
	const totalGoldenPoints =
		team1Stats.goldenPointsWon +
		team1Stats.goldenPointsLost +
		team2Stats.goldenPointsWon +
		team2Stats.goldenPointsLost;

	if (totalGoldenPoints > 0) {
		charts.push({
			title: i18n.t('statistics.goldenPointsWonChart'),
			data: [
				{
					label: team1Name,
					value: team1Stats.goldenPointsWon,
					color: '#0ea5e9',
				},
				{
					label: team2Name,
					value: team2Stats.goldenPointsWon,
					color: '#d946ef',
				},
			],
		});
	}

	// Service Games
	const totalServiceGames =
		team1Stats.serviceGamesWon +
		team1Stats.serviceGamesLost +
		team2Stats.serviceGamesWon +
		team2Stats.serviceGamesLost;

	if (totalServiceGames > 0) {
		charts.push({
			title: i18n.t('statistics.serviceGamesWonChart'),
			data: [
				{
					label: team1Name,
					value: team1Stats.serviceGamesWon,
					color: '#0ea5e9',
				},
				{
					label: team2Name,
					value: team2Stats.serviceGamesWon,
					color: '#d946ef',
				},
			],
		});
	}

	return charts;
}

/**
 * Get formatted statistics summary
 */
export function getStatisticsSummary(
	stats: TeamStatistics,
	teamName: string
): {
	breakPointConversion: string;
	goldenPointConversion: string;
	serviceGameWinRate: string;
} {
	const totalBreakPoints = stats.breakPointsWon + stats.breakPointsLost;
	const breakPointPercentage = calculatePercentage(stats.breakPointsWon, totalBreakPoints);

	const totalGoldenPoints = stats.goldenPointsWon + stats.goldenPointsLost;
	const goldenPointPercentage = calculatePercentage(stats.goldenPointsWon, totalGoldenPoints);

	const totalServiceGames = stats.serviceGamesWon + stats.serviceGamesLost;
	const serviceGamePercentage = calculatePercentage(stats.serviceGamesWon, totalServiceGames);

	return {
		breakPointConversion: totalBreakPoints > 0
			? `${stats.breakPointsWon}/${totalBreakPoints} (${breakPointPercentage}%)`
			: i18n.t('common.notAvailable'),
		goldenPointConversion: totalGoldenPoints > 0
			? `${stats.goldenPointsWon}/${totalGoldenPoints} (${goldenPointPercentage}%)`
			: i18n.t('common.notAvailable'),
		serviceGameWinRate: totalServiceGames > 0
			? `${stats.serviceGamesWon}/${totalServiceGames} (${serviceGamePercentage}%)`
			: i18n.t('common.notAvailable'),
	};
}
