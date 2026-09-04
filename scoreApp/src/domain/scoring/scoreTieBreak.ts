import { TieBreakScore } from '@/types';

export function isTieBreakWon(points: TieBreakScore): boolean {
	const highScore = Math.max(points.team1Points, points.team2Points);
	const difference = Math.abs(points.team1Points - points.team2Points);

	return highScore >= 7 && difference >= 2;
}

export function scoreTieBreakPoint(
	currentPoints: TieBreakScore,
	pointWinner: 'team1' | 'team2'
): { points: TieBreakScore; won: boolean; winner?: 'team1' | 'team2' } {
	const points: TieBreakScore = {
		team1Points: currentPoints.team1Points + (pointWinner === 'team1' ? 1 : 0),
		team2Points: currentPoints.team2Points + (pointWinner === 'team2' ? 1 : 0),
	};

	if (!isTieBreakWon(points)) {
		return { points, won: false };
	}

	return {
		points: {
			...points,
			winner: pointWinner,
		},
		won: true,
		winner: pointWinner,
	};
}
