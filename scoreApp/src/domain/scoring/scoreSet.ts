import { SetScore, TieBreakScore } from '@/types';

export function shouldStartTieBreak(setScore: SetScore): boolean {
	return setScore.team1Games === 6 && setScore.team2Games === 6;
}

export function scoreSetGame(
	currentSet: SetScore,
	gameWinner: 'team1' | 'team2'
): { set: SetScore; setWon: boolean; winner?: 'team1' | 'team2'; startsTieBreak: boolean } {
	const set: SetScore = {
		team1Games: currentSet.team1Games + (gameWinner === 'team1' ? 1 : 0),
		team2Games: currentSet.team2Games + (gameWinner === 'team2' ? 1 : 0),
	};

	if (set.team1Games >= 6 && set.team1Games - set.team2Games >= 2) {
		return { set: { ...set, winner: 'team1' }, setWon: true, winner: 'team1', startsTieBreak: false };
	}

	if (set.team2Games >= 6 && set.team2Games - set.team1Games >= 2) {
		return { set: { ...set, winner: 'team2' }, setWon: true, winner: 'team2', startsTieBreak: false };
	}

	return {
		set,
		setWon: false,
		startsTieBreak: shouldStartTieBreak(set),
	};
}

export function finishSetByTieBreak(
	tieBreakWinner: 'team1' | 'team2',
	tieBreak: TieBreakScore
): SetScore {
	return {
		team1Games: tieBreakWinner === 'team1' ? 7 : 6,
		team2Games: tieBreakWinner === 'team2' ? 7 : 6,
		tieBreak,
		winner: tieBreakWinner,
	};
}
