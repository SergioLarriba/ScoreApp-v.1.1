export function checkMatchWon(
	setsWon: { team1: number; team2: number },
	bestOfSets = 3
): { matchWon: boolean; winner?: 'team1' | 'team2' } {
	const setsNeeded = Math.floor(bestOfSets / 2) + 1;

	if (setsWon.team1 >= setsNeeded) {
		return { matchWon: true, winner: 'team1' };
	}

	if (setsWon.team2 >= setsNeeded) {
		return { matchWon: true, winner: 'team2' };
	}

	return { matchWon: false };
}

export function getNextServer(currentServer: 'team1' | 'team2'): 'team1' | 'team2' {
	return currentServer === 'team1' ? 'team2' : 'team1';
}
