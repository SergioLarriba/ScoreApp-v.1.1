import { Match, MatchSnapshot, Score, Statistics } from '@/types';

function cloneDate(date?: Date): Date | undefined {
	return date ? new Date(date) : undefined;
}

export function cloneScore(score: Score): Score {
	return {
		sets: score.sets.map((set) => ({
			team1Games: set.team1Games,
			team2Games: set.team2Games,
			winner: set.winner,
			tieBreak: set.tieBreak
				? {
					team1Points: set.tieBreak.team1Points,
					team2Points: set.tieBreak.team2Points,
					winner: set.tieBreak.winner,
				}
				: undefined,
		})),
		currentSet: {
			team1Games: score.currentSet.team1Games,
			team2Games: score.currentSet.team2Games,
			winner: score.currentSet.winner,
			tieBreak: score.currentSet.tieBreak
				? {
					team1Points: score.currentSet.tieBreak.team1Points,
					team2Points: score.currentSet.tieBreak.team2Points,
					winner: score.currentSet.tieBreak.winner,
				}
				: undefined,
		},
		currentGame: {
			team1Points: score.currentGame.team1Points,
			team2Points: score.currentGame.team2Points,
		},
		isTieBreak: score.isTieBreak,
		tieBreakPoints: {
			team1Points: score.tieBreakPoints.team1Points,
			team2Points: score.tieBreakPoints.team2Points,
			winner: score.tieBreakPoints.winner,
		},
		setsWon: {
			team1: score.setsWon.team1,
			team2: score.setsWon.team2,
		},
		currentServer: score.currentServer,
	};
}

export function cloneStatistics(statistics: Statistics): Statistics {
	return {
		team1: {
			breakPointsWon: statistics.team1.breakPointsWon ?? 0,
			breakPointsLost: statistics.team1.breakPointsLost ?? 0,
			goldenPointsWon: statistics.team1.goldenPointsWon ?? 0,
			goldenPointsLost: statistics.team1.goldenPointsLost ?? 0,
			serviceGamesWon: statistics.team1.serviceGamesWon ?? 0,
			serviceGamesLost: statistics.team1.serviceGamesLost ?? 0,
			winners: statistics.team1.winners ?? 0,
			forcedErrors: statistics.team1.forcedErrors ?? 0,
			unforcedErrors: statistics.team1.unforcedErrors ?? 0,
			pointsWonByWinner: statistics.team1.pointsWonByWinner ?? 0,
			pointsWonByForcedError: statistics.team1.pointsWonByForcedError ?? 0,
			pointsWonByUnforcedError: statistics.team1.pointsWonByUnforcedError ?? 0,
		},
		team2: {
			breakPointsWon: statistics.team2.breakPointsWon ?? 0,
			breakPointsLost: statistics.team2.breakPointsLost ?? 0,
			goldenPointsWon: statistics.team2.goldenPointsWon ?? 0,
			goldenPointsLost: statistics.team2.goldenPointsLost ?? 0,
			serviceGamesWon: statistics.team2.serviceGamesWon ?? 0,
			serviceGamesLost: statistics.team2.serviceGamesLost ?? 0,
			winners: statistics.team2.winners ?? 0,
			forcedErrors: statistics.team2.forcedErrors ?? 0,
			unforcedErrors: statistics.team2.unforcedErrors ?? 0,
			pointsWonByWinner: statistics.team2.pointsWonByWinner ?? 0,
			pointsWonByForcedError: statistics.team2.pointsWonByForcedError ?? 0,
			pointsWonByUnforcedError: statistics.team2.pointsWonByUnforcedError ?? 0,
		},
	};
}

export function getMatchSnapshot(match: Match): MatchSnapshot {
	return {
		score: cloneScore(match.score),
		statistics: cloneStatistics(match.statistics),
		status: match.status,
		endTime: cloneDate(match.endTime),
		winner: match.winner,
	};
}

export function applyMatchSnapshot(match: Match, snapshot: MatchSnapshot): Match {
	return {
		...match,
		score: cloneScore(snapshot.score),
		statistics: cloneStatistics(snapshot.statistics),
		status: snapshot.status,
		endTime: cloneDate(snapshot.endTime),
		winner: snapshot.winner,
	};
}
