import { create } from 'zustand';
import { Match, MatchConfig, PointType, TeamId } from '@/types';
import { scorePoint } from '@/domain/scoring/scorePoint';
import { applyMatchSnapshot } from '@/domain/match/snapshot';
import { initializeStatistics } from '@/utils/statistics';
import {
	clearActiveMatch,
	clearHistory as clearStoredHistory,
	deleteMatch,
	getActiveMatch,
	getMatchHistory,
	saveActiveMatch,
	saveFinishedMatch,
} from '@/utils/storage';

interface StoreState {
	currentMatch: Match | null;
	history: Match[];
	isHydrating: boolean;
	startMatch: (config: MatchConfig) => Promise<void>;
	addPoint: (team: TeamId, pointType: PointType) => Promise<void>;
	undoPoint: () => Promise<void>;
	endMatch: () => Promise<void>;
	resetMatch: () => Promise<void>;
	loadHistory: () => Promise<void>;
	loadActiveMatch: () => Promise<void>;
	hydrate: () => Promise<void>;
	clearHistory: () => Promise<void>;
}

function createInitialMatch(config: MatchConfig): Match {
	return {
		id: Date.now().toString(),
		config,
		status: 'in-progress',
		score: {
			sets: [],
			currentSet: { team1Games: 0, team2Games: 0 },
			currentGame: { team1Points: 0, team2Points: 0 },
			isTieBreak: false,
			tieBreakPoints: { team1Points: 0, team2Points: 0 },
			setsWon: { team1: 0, team2: 0 },
			currentServer: config.startsServing,
		},
		statistics: initializeStatistics(),
		pointHistory: [],
	};
}

export const useStore = create<StoreState>((set, get) => ({
	currentMatch: null,
	history: [],
	isHydrating: false,

	startMatch: async (config: MatchConfig) => {
		const currentMatch = get().currentMatch;
		if (currentMatch?.status === 'in-progress') {
			await clearActiveMatch();
		}

		const newMatch = createInitialMatch(config);
		await saveActiveMatch(newMatch);
		set({ currentMatch: newMatch });
	},

	addPoint: async (team: TeamId, pointType: PointType) => {
		const currentMatch = get().currentMatch;
		if (!currentMatch || currentMatch.status !== 'in-progress') return;

		try {
			const { match: nextMatch } = scorePoint(currentMatch, team, pointType);

			if (nextMatch.status === 'completed') {
				await saveFinishedMatch(nextMatch);
				await clearActiveMatch();
				set({
					currentMatch: nextMatch,
					history: [nextMatch, ...get().history.filter((match) => match.id !== nextMatch.id)],
				});
				return;
			}

			await saveActiveMatch(nextMatch);
			set({ currentMatch: nextMatch });
		} catch (error) {
			console.error('Error al sumar el punto:', error);
		}
	},

	undoPoint: async () => {
		const currentMatch = get().currentMatch;
		if (!currentMatch) return;

		const lastEvent = currentMatch.pointHistory[currentMatch.pointHistory.length - 1];
		if (!lastEvent) return;

		const previousMatch = {
			...applyMatchSnapshot(currentMatch, lastEvent.stateBefore),
			pointHistory: currentMatch.pointHistory.slice(0, -1),
		};

		try {
			if (currentMatch.status === 'completed') {
				await deleteMatch(currentMatch.id);
			}
			await saveActiveMatch(previousMatch);
			set({
				currentMatch: previousMatch,
				history: get().history.filter((match) => match.id !== currentMatch.id),
			});
		} catch (error) {
			console.error('Error al deshacer el punto:', error);
		}
	},

	endMatch: async () => {
		const currentMatch = get().currentMatch;
		if (!currentMatch || currentMatch.status === 'completed') return;

		const completedMatch: Match = {
			...currentMatch,
			status: 'completed',
			endTime: new Date(),
		};

		try {
			await saveFinishedMatch(completedMatch);
			await clearActiveMatch();
			set({
				currentMatch: completedMatch,
				history: [completedMatch, ...get().history.filter((match) => match.id !== completedMatch.id)],
			});
		} catch (error) {
			console.error('Error al finalizar el partido:', error);
		}
	},

	resetMatch: async () => {
		try {
			await clearActiveMatch();
		} catch (error) {
			console.error('Error al reiniciar el partido activo:', error);
		} finally {
			set({ currentMatch: null });
		}
	},

	loadHistory: async () => {
		const historyData = await getMatchHistory();
		set({ history: historyData.matches });
	},

	loadActiveMatch: async () => {
		const activeMatch = await getActiveMatch();
		if (activeMatch?.status === 'in-progress') {
			set({ currentMatch: activeMatch });
		}
	},

	hydrate: async () => {
		set({ isHydrating: true });
		try {
			const [historyData, activeMatch] = await Promise.all([
				getMatchHistory(),
				getActiveMatch(),
			]);
			set({
				history: historyData.matches,
				currentMatch: activeMatch?.status === 'in-progress' ? activeMatch : get().currentMatch,
			});
		} finally {
			set({ isHydrating: false });
		}
	},

	clearHistory: async () => {
		await clearStoredHistory();
		set({ history: [] });
	},
}));
