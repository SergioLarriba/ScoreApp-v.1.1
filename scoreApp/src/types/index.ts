// Jugador
export interface Player {
	id: string,
	name: string, 
}
// Equipo
export interface Team {
	id: string, 
	name: string, 
	player1: Player, 
	player2: Player, 
}
// Configuración del partido
// Punto de oro / ventaja
export type ScoringMode = 'golden-point' | 'advantage'; 
export type TeamId = 'team1' | 'team2';
export type PointType = 'winner' | 'forced_error' | 'unforced_error';
// Partido
export interface MatchConfig {
	team1: Team, 
	team2: Team, 
	startsServing: TeamId,
	scoringMode: ScoringMode, 
	startTime: Date, 
}

// Score Types
export type PointScore = 0 | 15 | 30 | 40 | 'AD';

export interface GameScore {
	team1Points: PointScore;
	team2Points: PointScore;
}

export interface SetScore {
	team1Games: number;
	team2Games: number;
	tieBreak?: TieBreakScore;
	winner?: 'team1' | 'team2';
}

export interface Score {
	sets: SetScore[];
	currentSet: SetScore;
	currentGame: GameScore;
	isTieBreak: boolean;
	tieBreakPoints: TieBreakScore;
	setsWon: {
		team1: number;
		team2: number;
	};
	currentServer: 'team1' | 'team2';
}

export interface TieBreakScore {
	team1Points: number;
	team2Points: number;
	winner?: 'team1' | 'team2';
}

// Statistics Types
export interface TeamStatistics {
	breakPointsWon: number;
	breakPointsLost: number;
	goldenPointsWon: number;
	goldenPointsLost: number;
	serviceGamesWon: number;
	serviceGamesLost: number;
	winners: number;
	forcedErrors: number;
	unforcedErrors: number;
	pointsWonByWinner: number;
	pointsWonByForcedError: number;
	pointsWonByUnforcedError: number;
}

export interface Statistics {
	team1: TeamStatistics;
	team2: TeamStatistics;
}

// Match Status
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';

// Complete Match
export interface Match {
	id: string;
	config: MatchConfig;
	score: Score;
	statistics: Statistics;
	status: MatchStatus;
	endTime?: Date;
	winner?: 'team1' | 'team2';
	pointHistory: PointEvent[];
}

export interface MatchSnapshot {
	score: Score;
	statistics: Statistics;
	status: MatchStatus;
	endTime?: Date;
	winner?: 'team1' | 'team2';
}

export interface PointEvent {
	id: string;
	team: TeamId;
	pointType: PointType;
	winningTeamId: TeamId;
	losingTeamId: TeamId;
	errorTeamId?: TeamId;
	forcedError?: boolean;
	unforcedError?: boolean;
	timestamp: Date;
	stateBefore: MatchSnapshot;
	stateAfter: MatchSnapshot;
}

// Match History
export interface MatchHistory {
	matches: Match[];
}

// Store State Types
export interface MatchState {
	currentMatch: Match | null;
	startMatch: (config: MatchConfig) => Promise<void>;
	addPoint: (team: TeamId, pointType: PointType) => Promise<void>;
	endMatch: () => Promise<void>;
	resetMatch: () => Promise<void>;
}

export interface StatisticsState {
	updateStatistics: (
		team: TeamId,
		stat: keyof TeamStatistics,
		increment: number
	) => void;
	resetStatistics: () => void;
}

export interface HistoryState {
	history: MatchHistory;
	addMatchToHistory: (match: Match) => void;
	getMatchById: (id: string) => Match | undefined;
	clearHistory: () => void;
	loadHistory: () => Promise<void>;
}

// Chart Data Types
export interface PieChartData {
	label: string;
	value: number;
	color: string;
}

export interface StatisticChartData {
	title: string;
	data: PieChartData[];
}
