import React from 'react';
import { View, Text, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Score } from '@/types';
import Card from '../ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ScoreBoardProps {
	score: Score;
	team1Name: string;
	team2Name: string;
	onUndo?: () => void;
	canUndo?: boolean;
}

export default function ScoreBoard({ score, team1Name, team2Name, onUndo, canUndo = false }: ScoreBoardProps) {
	const { colors } = useTheme();
	const { t } = useTranslation();

	const containerStyle: ViewStyle = {
		marginBottom: 20,
	};

	const headerStyle: ViewStyle = {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
		alignItems: 'center',
	};

	const teamNameStyle: TextStyle = {
		fontSize: 18,
		fontWeight: '700',
		color: colors.text,
		flex: 1,
	};

	const scoreRowStyle: ViewStyle = {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	};

	const labelStyle: TextStyle = {
		fontSize: 14,
		fontWeight: '600',
		color: colors.textSecondary,
		width: 80,
	};

	const scoresContainerStyle: ViewStyle = {
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'space-around',
	};

	const scoreTextStyle: TextStyle = {
		fontSize: 24,
		fontWeight: '700',
		color: colors.text,
		minWidth: 40,
		textAlign: 'center',
	};

	const currentServerStyle = (isServer: boolean): ViewStyle => ({
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: isServer ? colors.success : 'transparent',
		marginRight: 8,
	});

	const formatPointScore = (points: number | 'AD'): string => {
		return points === 'AD' ? t('scoreboard.advantageAbbrev') : points.toString();
	};

	return (
		<Card style={containerStyle}>
			{/* Team Names with Undo Button */}
			<View style={headerStyle}>
				<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
					<View style={currentServerStyle(score.currentServer === 'team1')} />
					<Text style={teamNameStyle}>{team1Name}</Text>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
					<View style={currentServerStyle(score.currentServer === 'team2')} />
					<Text style={teamNameStyle}>{team2Name}</Text>
				</View>
				{onUndo && (
					<TouchableOpacity
						onPress={onUndo}
						disabled={!canUndo}
						accessibilityLabel={t('scoreboard.undoLastPoint')}
						style={{
							padding: 8,
							borderRadius: 8,
							backgroundColor: canUndo ? colors.primary : colors.surfaceVariant,
							opacity: canUndo ? 1 : 0.5,
						}}
						activeOpacity={0.7}
					>
						<Ionicons name="arrow-undo" size={20} color={canUndo ? '#ffffff' : colors.textTertiary} />
					</TouchableOpacity>
				)}
			</View>

			{/* Sets */}
			<View style={scoreRowStyle}>
				<Text style={labelStyle}>{t('scoreboard.sets')}</Text>
				<View style={scoresContainerStyle}>
					<Text style={scoreTextStyle}>{score.setsWon.team1}</Text>
					<Text style={scoreTextStyle}>{score.setsWon.team2}</Text>
				</View>
			</View>

			{/* Games */}
			<View style={scoreRowStyle}>
				<Text style={labelStyle}>{t('scoreboard.games')}</Text>
				<View style={scoresContainerStyle}>
					<Text style={scoreTextStyle}>{score.currentSet.team1Games}</Text>
					<Text style={scoreTextStyle}>{score.currentSet.team2Games}</Text>
				</View>
			</View>

			{/* Points */}
			<View style={scoreRowStyle}>
				<Text style={labelStyle}>{score.isTieBreak ? t('scoreboard.tieBreak') : t('scoreboard.points')}</Text>
				<View style={scoresContainerStyle}>
					<Text style={scoreTextStyle}>
						{score.isTieBreak ? score.tieBreakPoints.team1Points : formatPointScore(score.currentGame.team1Points)}
					</Text>
					<Text style={scoreTextStyle}>
						{score.isTieBreak ? score.tieBreakPoints.team2Points : formatPointScore(score.currentGame.team2Points)}
					</Text>
				</View>
			</View>

			{/* Previous Sets */}
			{score.sets.length > 0 && (
				<View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
					<Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
						{t('scoreboard.previousSets')}
					</Text>
					{score.sets.map((set, index) => (
						<View key={index} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 }}>
							<Text style={{ fontSize: 14, color: colors.text }}>
									{t('scoreboard.setNumber', { number: index + 1, team1Games: set.team1Games, team2Games: set.team2Games })}
							</Text>
						</View>
					))}
				</View>
			)}
		</Card>
	);
}
