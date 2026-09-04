import { describe, expect, it } from 'vitest';
import { Match, MatchConfig } from '@/types';
import { scorePoint } from '@/domain/scoring/scorePoint';
import { applyMatchSnapshot } from '@/domain/match/snapshot';
import { initializeStatistics } from '@/utils/statistics';

function createMatch(scoringMode: MatchConfig['scoringMode'] = 'advantage'): Match {
	return {
		id: 'test-match',
		config: {
			team1: {
				id: 'team1',
				name: 'Team 1',
				player1: { id: 't1p1', name: 'A' },
				player2: { id: 't1p2', name: 'B' },
			},
			team2: {
				id: 'team2',
				name: 'Team 2',
				player1: { id: 't2p1', name: 'C' },
				player2: { id: 't2p2', name: 'D' },
			},
			startsServing: 'team1',
			scoringMode,
			startTime: new Date('2026-01-01T10:00:00.000Z'),
		},
		score: {
			sets: [],
			currentSet: { team1Games: 0, team2Games: 0 },
			currentGame: { team1Points: 0, team2Points: 0 },
			isTieBreak: false,
			tieBreakPoints: { team1Points: 0, team2Points: 0 },
			setsWon: { team1: 0, team2: 0 },
			currentServer: 'team1',
		},
		statistics: initializeStatistics(),
		status: 'in-progress',
		pointHistory: [],
	};
}

function point(match: Match, winner: 'team1' | 'team2'): Match {
	return scorePoint(match, winner).match;
}

function typedPoint(match: Match, winner: 'team1' | 'team2', pointType: 'winner' | 'forced_error' | 'unforced_error'): Match {
	return scorePoint(match, winner, pointType).match;
}

function points(match: Match, winners: Array<'team1' | 'team2'>): Match {
	return winners.reduce((nextMatch, winner) => point(nextMatch, winner), match);
}

function winGame(match: Match, winner: 'team1' | 'team2'): Match {
	return points(match, [winner, winner, winner, winner]);
}

function undo(match: Match): Match {
	const lastEvent = match.pointHistory[match.pointHistory.length - 1];
	if (!lastEvent) return match;

	return {
		...applyMatchSnapshot(match, lastEvent.stateBefore),
		pointHistory: match.pointHistory.slice(0, -1),
	};
}

describe('padel scoring', () => {
	it('progresses normal points without winning on 30 to 40', () => {
		const match = points(createMatch(), ['team1', 'team1', 'team1']);

		expect(match.score.currentGame.team1Points).toBe(40);
		expect(match.score.currentSet.team1Games).toBe(0);
		expect(match.status).toBe('in-progress');
	});

	it('wins a game from 40-0 with the next point', () => {
		const match = winGame(createMatch(), 'team1');

		expect(match.score.currentSet.team1Games).toBe(1);
		expect(match.score.currentGame).toEqual({ team1Points: 0, team2Points: 0 });
	});

	it('handles deuce and advantage', () => {
		let match = points(createMatch(), ['team1', 'team1', 'team1', 'team2', 'team2', 'team2']);
		expect(match.score.currentGame).toEqual({ team1Points: 40, team2Points: 40 });

		match = point(match, 'team1');
		expect(match.score.currentGame).toEqual({ team1Points: 'AD', team2Points: 40 });

		match = point(match, 'team1');
		expect(match.score.currentSet.team1Games).toBe(1);
	});

	it('returns to deuce when the player without advantage wins', () => {
		let match = points(createMatch(), ['team1', 'team1', 'team1', 'team2', 'team2', 'team2', 'team1']);
		expect(match.score.currentGame.team1Points).toBe('AD');

		match = point(match, 'team2');
		expect(match.score.currentGame).toEqual({ team1Points: 40, team2Points: 40 });
	});

	it('wins golden point directly at 40-40', () => {
		const match = points(createMatch('golden-point'), [
			'team1',
			'team1',
			'team1',
			'team2',
			'team2',
			'team2',
			'team2',
		]);

		expect(match.score.currentSet.team2Games).toBe(1);
		expect(match.statistics.team2.goldenPointsWon).toBe(1);
	});

	it('tracks service games and breaks without inverting teams', () => {
		const hold = winGame(createMatch(), 'team1');
		expect(hold.statistics.team1.serviceGamesWon).toBe(1);
		expect(hold.statistics.team2.serviceGamesWon).toBe(0);

		const breakGame = winGame(createMatch(), 'team2');
		expect(breakGame.statistics.team1.serviceGamesLost).toBe(1);
		expect(breakGame.statistics.team2.serviceGamesWon).toBe(0);
		expect(breakGame.statistics.team2.breakPointsWon).toBe(1);
		expect(breakGame.statistics.team1.breakPointsLost).toBe(1);
	});

	it('records winner, forced error, and unforced error point types', () => {
		let match = createMatch();
		match = typedPoint(match, 'team1', 'winner');
		match = typedPoint(match, 'team1', 'forced_error');
		match = typedPoint(match, 'team2', 'unforced_error');

		expect(match.statistics.team1.winners).toBe(1);
		expect(match.statistics.team2.forcedErrors).toBe(1);
		expect(match.statistics.team1.unforcedErrors).toBe(1);
		expect(match.statistics.team1.pointsWonByWinner).toBe(1);
		expect(match.statistics.team1.pointsWonByForcedError).toBe(1);
		expect(match.statistics.team2.pointsWonByUnforcedError).toBe(1);
		expect(match.pointHistory[1]).toMatchObject({
			pointType: 'forced_error',
			winningTeamId: 'team1',
			losingTeamId: 'team2',
			errorTeamId: 'team2',
			forcedError: true,
		});
	});

	it('wins a set 6-4', () => {
		let match = createMatch();
		for (let i = 0; i < 5; i += 1) match = winGame(match, 'team1');
		for (let i = 0; i < 4; i += 1) match = winGame(match, 'team2');
		match = winGame(match, 'team1');

		expect(match.score.sets[0]).toMatchObject({ team1Games: 6, team2Games: 4, winner: 'team1' });
		expect(match.score.setsWon.team1).toBe(1);
	});

	it('wins a set 7-5', () => {
		let match = createMatch();
		for (let i = 0; i < 5; i += 1) match = winGame(match, 'team1');
		for (let i = 0; i < 5; i += 1) match = winGame(match, 'team2');
		match = winGame(match, 'team1');
		match = winGame(match, 'team1');

		expect(match.score.sets[0]).toMatchObject({ team1Games: 7, team2Games: 5, winner: 'team1' });
	});

	it('activates tie-break at 6-6', () => {
		let match = createMatch();
		for (let i = 0; i < 5; i += 1) match = winGame(match, 'team1');
		for (let i = 0; i < 6; i += 1) match = winGame(match, 'team2');
		match = winGame(match, 'team1');

		expect(match.score.currentSet).toEqual({ team1Games: 6, team2Games: 6 });
		expect(match.score.isTieBreak).toBe(true);
		expect(match.score.tieBreakPoints).toEqual({ team1Points: 0, team2Points: 0 });
	});

	it('wins tie-break 7-5 and records the set 7-6', () => {
		let match = createTieBreakMatch();
		for (let i = 0; i < 5; i += 1) match = points(match, ['team1', 'team2']);
		match = points(match, ['team1', 'team1']);

		expect(match.score.sets[0]).toMatchObject({
			team1Games: 7,
			team2Games: 6,
			winner: 'team1',
			tieBreak: { team1Points: 7, team2Points: 5, winner: 'team1' },
		});
	});

	it('wins a long tie-break 10-8', () => {
		let match = createTieBreakMatch();
		for (let i = 0; i < 8; i += 1) match = points(match, ['team1', 'team2']);
		match = points(match, ['team1', 'team1']);

		expect(match.score.sets[0].tieBreak).toMatchObject({ team1Points: 10, team2Points: 8 });
	});

	it('wins a best-of-3 match after two sets', () => {
		let match = createMatch();
		for (let set = 0; set < 2; set += 1) {
			for (let game = 0; game < 6; game += 1) match = winGame(match, 'team1');
		}

		expect(match.status).toBe('completed');
		expect(match.winner).toBe('team1');
		expect(match.score.setsWon.team1).toBe(2);
	});

	it('undoes after a normal point', () => {
		const match = undo(point(createMatch(), 'team1'));

		expect(match.score.currentGame).toEqual({ team1Points: 0, team2Points: 0 });
		expect(match.pointHistory).toHaveLength(0);
	});

	it('undoes point type statistics', () => {
		const match = undo(typedPoint(createMatch(), 'team1', 'unforced_error'));

		expect(match.statistics.team2.unforcedErrors).toBe(0);
		expect(match.statistics.team1.pointsWonByUnforcedError).toBe(0);
		expect(match.pointHistory).toHaveLength(0);
	});

	it('undoes after a game', () => {
		const match = undo(winGame(createMatch(), 'team1'));

		expect(match.score.currentSet.team1Games).toBe(0);
		expect(match.score.currentGame.team1Points).toBe(40);
	});

	it('undoes after a tie-break point', () => {
		const match = undo(point(createTieBreakMatch(), 'team1'));

		expect(match.score.isTieBreak).toBe(true);
		expect(match.score.tieBreakPoints).toEqual({ team1Points: 0, team2Points: 0 });
	});

	it('undoes after a completed tie-break', () => {
		let match = createTieBreakMatch();
		for (let i = 0; i < 5; i += 1) match = points(match, ['team1', 'team2']);
		match = points(match, ['team1', 'team1']);
		match = undo(match);

		expect(match.score.isTieBreak).toBe(true);
		expect(match.score.tieBreakPoints).toMatchObject({ team1Points: 6, team2Points: 5 });
		expect(match.score.sets).toHaveLength(0);
	});
});

function createTieBreakMatch(): Match {
	const match = createMatch();
	return {
		...match,
		score: {
			...match.score,
			currentSet: { team1Games: 6, team2Games: 6 },
			isTieBreak: true,
			tieBreakPoints: { team1Points: 0, team2Points: 0 },
		},
	};
}
