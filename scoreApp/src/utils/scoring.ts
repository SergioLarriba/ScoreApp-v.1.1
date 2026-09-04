import { GameScore, PointScore, SetScore, ScoringMode } from '../types';
import { scoreGamePoint } from '@/domain/scoring/scoreGame';
import { scoreSetGame } from '@/domain/scoring/scoreSet';
import { checkMatchWon as checkMatchWonDomain, getNextServer as getNextServerDomain } from '@/domain/scoring/scoreMatch';

/**
 * Get the next point score based on current score
 */
export function getNextPointScore(current: PointScore): PointScore {
	switch (current) {
		case 0:
			return 15;
		case 15:
			return 30;
		case 30:
			return 40;
		case 40:
			return 40; // Stays at 40 until game is won
		case 'AD':
			return 'AD';
		default:
			return 0;
	}
}

/**
 * Calculate the next game score after a point is won
 * Returns updated game score and whether the game is won
 */
export function calculateNextPoint(
	currentGame: GameScore,
	pointWinner: 'team1' | 'team2',
	scoringMode: ScoringMode
): { gameScore: GameScore; gameWon: boolean; winner?: 'team1' | 'team2' } {
	return scoreGamePoint(currentGame, pointWinner, scoringMode);
}

/**
 * Check if a set is won
 * A set is won when:
 * - A team reaches 6 games with at least 2-game margin
 * - A team wins a tiebreak at 6-6 (simplified: first to 7 wins)
 */
export function checkSetWon(
	setScore: SetScore,
	gameWinner: 'team1' | 'team2'
): { setWon: boolean; winner?: 'team1' | 'team2'; needsTiebreak: boolean } {
	const result = scoreSetGame(setScore, gameWinner);
	return {
		setWon: result.setWon,
		winner: result.winner,
		needsTiebreak: result.startsTieBreak,
	};
}

/**
 * Check if the match is won (best of 3 sets)
 */
export function checkMatchWon(
	setsWon: { team1: number; team2: number }
): { matchWon: boolean; winner?: 'team1' | 'team2' } {
	return checkMatchWonDomain(setsWon);
}

/**
 * Get the next server after a game is completed
 */
export function getNextServer(currentServer: 'team1' | 'team2'): 'team1' | 'team2' {
	return getNextServerDomain(currentServer);
}

/**
 * Check if current situation is a break point
 * (receiving team is one point away from winning the game)
 */
export function isBreakPoint(
	gameScore: GameScore,
	server: 'team1' | 'team2',
	scoringMode: ScoringMode
): boolean {
	const receivingTeam = server === 'team1' ? 'team2' : 'team1';
	const serverPoints = server === 'team1' ? gameScore.team1Points : gameScore.team2Points;
	const receiverPoints = receivingTeam === 'team1' ? gameScore.team1Points : gameScore.team2Points;

	// In advantage mode, receiver has advantage
	if (scoringMode === 'advantage' && receiverPoints === 'AD') {
		return true;
	}

	// Receiver at 40, server not at 40 or AD
	if (receiverPoints === 40 && serverPoints !== 40 && serverPoints !== 'AD') {
		return true;
	}

	// Golden point scenario
	if (scoringMode === 'golden-point' && serverPoints === 40 && receiverPoints === 40) {
		return true;
	}

	return false;
}

/**
 * Check if current situation is a golden point
 */
export function isGoldenPoint(
	gameScore: GameScore,
	scoringMode: ScoringMode
): boolean {
	return (
		scoringMode === 'golden-point' &&
		gameScore.team1Points === 40 &&
		gameScore.team2Points === 40
	);
}
