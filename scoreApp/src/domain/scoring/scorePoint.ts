import { Match, PointEvent, PointType, Score, Statistics, TeamId } from '@/types';
import { getMatchSnapshot, cloneScore, cloneStatistics } from '@/domain/match/snapshot';
import { scoreGamePoint } from './scoreGame';
import { getNextServer, checkMatchWon } from './scoreMatch';
import { scoreSetGame, finishSetByTieBreak } from './scoreSet';
import { scoreTieBreakPoint } from './scoreTieBreak';
import { isBreakPoint } from '@/utils/scoring';

function createPointEventId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function updateServiceStatistics(
	statistics: Statistics,
	server: 'team1' | 'team2',
	gameWinner: 'team1' | 'team2',
	wasBreakPoint: boolean,
	wasGoldenPoint: boolean
): Statistics {
	const nextStatistics = cloneStatistics(statistics);
	const receiver = server === 'team1' ? 'team2' : 'team1';

	if (gameWinner === server) {
		nextStatistics[server].serviceGamesWon += 1;
	} else {
		nextStatistics[server].serviceGamesLost += 1;

		if (wasBreakPoint) {
			nextStatistics[receiver].breakPointsWon += 1;
			nextStatistics[server].breakPointsLost += 1;
		}
	}

	if (wasGoldenPoint) {
		const loser = gameWinner === 'team1' ? 'team2' : 'team1';
		nextStatistics[gameWinner].goldenPointsWon += 1;
		nextStatistics[loser].goldenPointsLost += 1;
	}

	return nextStatistics;
}

function updatePointTypeStatistics(
	statistics: Statistics,
	pointWinner: TeamId,
	pointType: PointType
): Statistics {
	const nextStatistics = cloneStatistics(statistics);
	const loser = pointWinner === 'team1' ? 'team2' : 'team1';

	if (pointType === 'winner') {
		nextStatistics[pointWinner].winners += 1;
		nextStatistics[pointWinner].pointsWonByWinner += 1;
		return nextStatistics;
	}

	if (pointType === 'forced_error') {
		nextStatistics[loser].forcedErrors += 1;
		nextStatistics[pointWinner].pointsWonByForcedError += 1;
		return nextStatistics;
	}

	nextStatistics[loser].unforcedErrors += 1;
	nextStatistics[pointWinner].pointsWonByUnforcedError += 1;
	return nextStatistics;
}

function completeSet(
	match: Match,
	score: Score,
	statistics: Statistics,
	setWinner: 'team1' | 'team2',
	completedSet: Score['currentSet']
): Match {
	const newSetsWon = {
		...score.setsWon,
		[setWinner]: score.setsWon[setWinner] + 1,
	};
	const matchResult = checkMatchWon(newSetsWon);
	const nextScore: Score = {
		...score,
		sets: [...score.sets, completedSet],
		currentSet: { team1Games: 0, team2Games: 0 },
		currentGame: { team1Points: 0, team2Points: 0 },
		isTieBreak: false,
		tieBreakPoints: { team1Points: 0, team2Points: 0 },
		setsWon: newSetsWon,
		currentServer: getNextServer(score.currentServer),
	};

	return {
		...match,
		score: nextScore,
		statistics,
		status: matchResult.matchWon ? 'completed' : match.status,
		endTime: matchResult.matchWon ? new Date() : match.endTime,
		winner: matchResult.winner ?? match.winner,
	};
}

export function scorePoint(
	match: Match,
	pointWinner: TeamId,
	pointType: PointType = 'winner'
): { match: Match; event: PointEvent } {
	if (match.status !== 'in-progress') {
		throw new Error('No se puede sumar un punto a un partido que no está en curso.');
	}

	const stateBefore = getMatchSnapshot(match);
	const score = cloneScore(match.score);
	let nextStatistics = updatePointTypeStatistics(match.statistics, pointWinner, pointType);
	let nextMatch: Match = {
		...match,
		score,
		statistics: nextStatistics,
		pointHistory: [...match.pointHistory],
	};

	if (score.isTieBreak) {
		const tieBreakResult = scoreTieBreakPoint(score.tieBreakPoints, pointWinner);

		if (!tieBreakResult.won || !tieBreakResult.winner) {
			nextMatch = {
				...nextMatch,
				score: {
					...score,
					tieBreakPoints: tieBreakResult.points,
				},
			};
		} else {
			const completedSet = finishSetByTieBreak(tieBreakResult.winner, tieBreakResult.points);
			nextMatch = completeSet(nextMatch, score, nextStatistics, tieBreakResult.winner, completedSet);
		}
	} else {
		const wasBreakPoint = isBreakPoint(score.currentGame, score.currentServer, match.config.scoringMode);
		const gameResult = scoreGamePoint(score.currentGame, pointWinner, match.config.scoringMode);

		if (!gameResult.gameWon || !gameResult.winner) {
			nextMatch = {
				...nextMatch,
				score: {
					...score,
					currentGame: gameResult.gameScore,
				},
			};
		} else {
			nextStatistics = updateServiceStatistics(
				nextStatistics,
				score.currentServer,
				gameResult.winner,
				wasBreakPoint,
				gameResult.wasGoldenPoint
			);

			const setResult = scoreSetGame(score.currentSet, gameResult.winner);

			if (setResult.setWon && setResult.winner) {
				nextMatch = completeSet(nextMatch, score, nextStatistics, setResult.winner, setResult.set);
			} else {
				nextMatch = {
					...nextMatch,
					score: {
						...score,
						currentSet: setResult.set,
						currentGame: { team1Points: 0, team2Points: 0 },
						isTieBreak: setResult.startsTieBreak,
						tieBreakPoints: { team1Points: 0, team2Points: 0 },
						currentServer: getNextServer(score.currentServer),
					},
					statistics: nextStatistics,
				};
			}
		}
	}

	const event: PointEvent = {
		id: createPointEventId(),
		team: pointWinner,
		pointType,
		winningTeamId: pointWinner,
		losingTeamId: pointWinner === 'team1' ? 'team2' : 'team1',
		errorTeamId: pointType === 'winner' ? undefined : pointWinner === 'team1' ? 'team2' : 'team1',
		forcedError: pointType === 'forced_error' ? true : undefined,
		unforcedError: pointType === 'unforced_error' ? true : undefined,
		timestamp: new Date(),
		stateBefore,
		stateAfter: getMatchSnapshot(nextMatch),
	};

	return {
		match: {
			...nextMatch,
			pointHistory: [...match.pointHistory, event],
		},
		event,
	};
}
