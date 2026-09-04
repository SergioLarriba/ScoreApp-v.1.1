import { GameScore, PointScore, ScoringMode } from '@/types';

export interface GamePointResult {
	gameScore: GameScore;
	gameWon: boolean;
	winner?: 'team1' | 'team2';
	wasGoldenPoint: boolean;
}

export function getNextPointScore(current: PointScore): PointScore {
	switch (current) {
		case 0:
			return 15;
		case 15:
			return 30;
		case 30:
			return 40;
		default:
			return current;
	}
}

export function scoreGamePoint(
	currentGame: GameScore,
	pointWinner: 'team1' | 'team2',
	scoringMode: ScoringMode
): GamePointResult {
	const team1Points = currentGame.team1Points;
	const team2Points = currentGame.team2Points;
	const wasGoldenPoint = scoringMode === 'golden-point' && team1Points === 40 && team2Points === 40;

	if (wasGoldenPoint) {
		return {
			gameScore: { team1Points: 0, team2Points: 0 },
			gameWon: true,
			winner: pointWinner,
			wasGoldenPoint,
		};
	}

	if (scoringMode === 'advantage') {
		if (team1Points === 'AD') {
			return pointWinner === 'team1'
				? {
					gameScore: { team1Points: 0, team2Points: 0 },
					gameWon: true,
					winner: 'team1',
					wasGoldenPoint,
				}
				: {
					gameScore: { team1Points: 40, team2Points: 40 },
					gameWon: false,
					wasGoldenPoint,
				};
		}

		if (team2Points === 'AD') {
			return pointWinner === 'team2'
				? {
					gameScore: { team1Points: 0, team2Points: 0 },
					gameWon: true,
					winner: 'team2',
					wasGoldenPoint,
				}
				: {
					gameScore: { team1Points: 40, team2Points: 40 },
					gameWon: false,
					wasGoldenPoint,
				};
		}

		if (team1Points === 40 && team2Points === 40) {
			return {
				gameScore: {
					team1Points: pointWinner === 'team1' ? 'AD' : 40,
					team2Points: pointWinner === 'team2' ? 'AD' : 40,
				},
				gameWon: false,
				wasGoldenPoint,
			};
		}
	}

	if (pointWinner === 'team1') {
		if (team1Points === 40 && team2Points !== 40 && team2Points !== 'AD') {
			return {
				gameScore: { team1Points: 0, team2Points: 0 },
				gameWon: true,
				winner: 'team1',
				wasGoldenPoint,
			};
		}

		return {
			gameScore: { team1Points: getNextPointScore(team1Points), team2Points },
			gameWon: false,
			wasGoldenPoint,
		};
	}

	if (team2Points === 40 && team1Points !== 40 && team1Points !== 'AD') {
		return {
			gameScore: { team1Points: 0, team2Points: 0 },
			gameWon: true,
			winner: 'team2',
			wasGoldenPoint,
		};
	}

	return {
		gameScore: { team1Points, team2Points: getNextPointScore(team2Points) },
		gameWon: false,
		wasGoldenPoint,
	};
}
