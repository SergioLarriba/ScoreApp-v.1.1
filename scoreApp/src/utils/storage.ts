import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, MatchHistory, MatchSnapshot, PointEvent } from '@/types';
import { cloneStatistics } from '@/domain/match/snapshot';

export const ACTIVE_MATCH_KEY = '@padel_score_active_match';
export const MATCH_HISTORY_KEY = '@padel_score_match_history';

function reviveDate(value: unknown): Date | undefined {
	if (!value) return undefined;
	const date = new Date(value as string | number | Date);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function reviveSnapshot(snapshot: MatchSnapshot): MatchSnapshot {
	return {
		...snapshot,
		statistics: cloneStatistics(snapshot.statistics),
		endTime: reviveDate(snapshot.endTime),
	};
}

function revivePointEvent(event: PointEvent): PointEvent {
	const winningTeamId = event.winningTeamId ?? event.team;
	const losingTeamId = event.losingTeamId ?? (winningTeamId === 'team1' ? 'team2' : 'team1');
	const pointType = event.pointType ?? 'winner';

	return {
		...event,
		team: winningTeamId,
		pointType,
		winningTeamId,
		losingTeamId,
		errorTeamId: event.errorTeamId ?? (pointType === 'winner' ? undefined : losingTeamId),
		forcedError: event.forcedError ?? (pointType === 'forced_error' ? true : undefined),
		unforcedError: event.unforcedError ?? (pointType === 'unforced_error' ? true : undefined),
		timestamp: reviveDate(event.timestamp) ?? new Date(),
		stateBefore: reviveSnapshot(event.stateBefore),
		stateAfter: reviveSnapshot(event.stateAfter),
	};
}

function reviveMatch(match: Match): Match {
	return {
		...match,
		config: {
			...match.config,
			startTime: reviveDate(match.config.startTime) ?? new Date(),
		},
		statistics: cloneStatistics(match.statistics),
		endTime: reviveDate(match.endTime),
		pointHistory: Array.isArray(match.pointHistory)
			? match.pointHistory.map(revivePointEvent)
			: [],
	};
}

async function readHistory(): Promise<Match[]> {
	const jsonValue = await AsyncStorage.getItem(MATCH_HISTORY_KEY);
	if (!jsonValue) return [];

	const parsed = JSON.parse(jsonValue) as MatchHistory | Match[];
	const matches = Array.isArray(parsed) ? parsed : parsed.matches;
	return Array.isArray(matches) ? matches.map(reviveMatch) : [];
}

export async function getActiveMatch(): Promise<Match | null> {
	try {
		const jsonValue = await AsyncStorage.getItem(ACTIVE_MATCH_KEY);
		return jsonValue ? reviveMatch(JSON.parse(jsonValue) as Match) : null;
	} catch (error) {
		console.error('Error al cargar el partido activo:', error);
		return null;
	}
}

export async function saveActiveMatch(match: Match): Promise<void> {
	try {
		await AsyncStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
	} catch (error) {
		console.error('Error al guardar el partido activo:', error);
		throw error;
	}
}

export async function clearActiveMatch(): Promise<void> {
	try {
		await AsyncStorage.removeItem(ACTIVE_MATCH_KEY);
	} catch (error) {
		console.error('Error al limpiar el partido activo:', error);
		throw error;
	}
}

export async function getMatchHistory(): Promise<MatchHistory> {
	try {
		return { matches: await readHistory() };
	} catch (error) {
		console.error('Error al cargar el historial de partidos:', error);
		return { matches: [] };
	}
}

export async function saveMatchHistory(history: MatchHistory): Promise<void> {
	try {
		await AsyncStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
	} catch (error) {
		console.error('Error al guardar el historial de partidos:', error);
		throw error;
	}
}

export async function saveFinishedMatch(match: Match): Promise<void> {
	try {
		const matches = await readHistory();
		const withoutDuplicate = matches.filter((historyMatch) => historyMatch.id !== match.id);
		await saveMatchHistory({ matches: [match, ...withoutDuplicate] });
	} catch (error) {
		console.error('Error al guardar el partido finalizado:', error);
		throw error;
	}
}

export async function deleteMatch(id: string): Promise<void> {
	try {
		const matches = await readHistory();
		await saveMatchHistory({ matches: matches.filter((match) => match.id !== id) });
	} catch (error) {
		console.error('Error al eliminar el partido:', error);
		throw error;
	}
}

export async function clearHistory(): Promise<void> {
	try {
		await AsyncStorage.removeItem(MATCH_HISTORY_KEY);
	} catch (error) {
		console.error('Error al limpiar el historial de partidos:', error);
		throw error;
	}
}

// Backwards-compatible aliases used by older screens.
export const loadMatchHistory = getMatchHistory;
export const clearMatchHistory = clearHistory;
export const addMatchToStorage = saveFinishedMatch;
