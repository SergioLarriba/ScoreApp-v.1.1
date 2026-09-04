import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Alert,
	BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import ScoreBoard from '../components/match/ScoreBoard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ComponentLayout from '@/layout/ComponentLayout';
import { PointType, TeamId } from '@/types';
import { useTranslation } from 'react-i18next';

export default function MatchScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const { currentMatch, addPoint, undoPoint, endMatch, resetMatch } = useStore();
	const [showEndMatchModal, setShowEndMatchModal] = useState(false);
	const [pendingPointWinner, setPendingPointWinner] = useState<TeamId | null>(null);

	useEffect(() => {
		if (!currentMatch || currentMatch.status !== 'in-progress') return;

		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			Alert.alert(
				t('match.leaveTitle'),
				t('match.leaveMessage'),
				[
					{ text: t('match.stay'), style: 'cancel' },
					{ text: t('match.leave'), style: 'destructive', onPress: () => router.back() },
				]
			);
			return true;
		});

		return () => subscription.remove();
	}, [currentMatch, router, t]);

	if (!currentMatch) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>{t('match.noActiveMatch')}</Text>
					<Button title={t('match.goHome')} onPress={() => router.push('/')} />
				</View>
			</SafeAreaView>
		);
	}

	const { config, score, status } = currentMatch;
	const isCompleted = status === 'completed';
	const canUndo = currentMatch.pointHistory.length > 0;

	const openPointTypeModal = (team: TeamId) => {
		if (isCompleted) return;
		setPendingPointWinner(team);
	};

	const handleAddPoint = (team: TeamId, pointType: PointType) => {
		if (isCompleted) return;
		setPendingPointWinner(null);
		void addPoint(team, pointType);
	};

	const handleUndo = () => {
		if (canUndo) {
			void undoPoint();
		}
	};

	const handleEndMatch = async () => {
		await endMatch();
		setShowEndMatchModal(false);
		Alert.alert(t('match.matchEnded'), t('match.matchSaved'));
	};

	const handleViewStatistics = () => {
		router.push('/statistics');
	};

	return (
		<ComponentLayout>
			<StatusBar barStyle="dark-content" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
				{/* Header 
				<View style={styles.header}>
							<Text style={styles.title}>{t('match.liveMatch')}</Text>
					{isCompleted && (
						<View style={styles.completedBadge}>
							<Text style={styles.completedText}>{t('match.completed')}</Text>
						</View>
					)}
				</View> */}

				{/* Scoreboard */}
				<ScoreBoard
					score={score}
					team1Name={config.team1.name}
					team2Name={config.team2.name}
					onUndo={handleUndo}
					canUndo={canUndo}
				/>

				{/* Match Info */}
				<View style={styles.infoCard}>
					<Text style={styles.infoText}>
						{t('match.mode')}: {config.scoringMode === 'golden-point' ? t('scoringMode.goldenPoint') : t('scoringMode.advantage')}
					</Text>
					<Text style={styles.infoText}>
						{t('match.started')}: {config.startTime.toLocaleTimeString()}
					</Text>
				</View>

				{/* Point Buttons */}
				{!isCompleted && (
					<View style={styles.pointButtonsContainer}>
						<TouchableOpacity
							style={[styles.pointButton, styles.team1Button]}
							onPress={() => openPointTypeModal('team1')}
							accessibilityLabel={t('match.addPointTo', { team: config.team1.name })}
							activeOpacity={0.7}
						>
							<Text style={styles.pointButtonText}>{t('match.point')}</Text>
							<Text style={styles.pointButtonTeam}>{config.team1.name}</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.pointButton, styles.team2Button]}
							onPress={() => openPointTypeModal('team2')}
							accessibilityLabel={t('match.addPointTo', { team: config.team2.name })}
							activeOpacity={0.7}
						>
							<Text style={styles.pointButtonText}>{t('match.point')}</Text>
							<Text style={styles.pointButtonTeam}>{config.team2.name}</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Winner Display */}
				{isCompleted && currentMatch.winner && (
					<View style={styles.winnerContainer}>
						<Text style={styles.winnerTitle}>{t('match.winner')}</Text>
						<Text style={styles.winnerName}>
							{currentMatch.winner === 'team1' ? config.team1.name : config.team2.name}
						</Text>
					</View>
				)}

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					<Button
						title={t('match.viewStatistics')}
						variant="outline"
						size="md"
						onPress={handleViewStatistics}
					/>

					{!isCompleted && (
						<Button
							title={t('match.endMatch')}
							variant="danger"
							size="md"
							onPress={() => setShowEndMatchModal(true)}
						/>
					)}

					{isCompleted && (
						<Button
							title={t('match.newMatch')}
							variant="primary"
							size="md"
							onPress={() => {
								void resetMatch();
								router.push('/match-setup');
							}}
						/>
					)}
				</View>
			</ScrollView>

			{/* End Match Confirmation Modal */}
			<Modal
				visible={showEndMatchModal}
				onClose={() => setShowEndMatchModal(false)}
				title={t('match.endMatch')}
			>
				<Text style={styles.modalText}>
					{t('match.endMatchConfirm')}
				</Text>
				<View style={styles.modalButtons}>
					<Button
						title={t('common.cancel')}
						variant="outline"
						onPress={() => setShowEndMatchModal(false)}
					/>
					<Button title={t('match.endMatch')} variant="danger" onPress={handleEndMatch} />
				</View>
			</Modal>

			<Modal
				visible={pendingPointWinner !== null}
				onClose={() => setPendingPointWinner(null)}
				title={t('match.pointTypeTitle')}
			>
				{pendingPointWinner && (
					<View style={styles.pointTypeOptions}>
						<Text style={styles.modalText}>
							{t('match.pointTypeQuestion', { team: pendingPointWinner === 'team1' ? config.team1.name : config.team2.name })}
						</Text>
						<TouchableOpacity
							style={[styles.pointTypeButton, styles.winnerOption]}
							onPress={() => handleAddPoint(pendingPointWinner, 'winner')}
							accessibilityLabel={t('match.registerWinnerFor', { team: pendingPointWinner === 'team1' ? config.team1.name : config.team2.name })}
							activeOpacity={0.75}
						>
							<Text style={styles.pointTypeTitle}>{t('match.winnerPoint')}</Text>
							<Text style={styles.pointTypeSubtitle}>
								{pendingPointWinner === 'team1' ? config.team1.name : config.team2.name}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.pointTypeButton, styles.forcedErrorOption]}
							onPress={() => handleAddPoint(pendingPointWinner, 'forced_error')}
							accessibilityLabel={t('match.registerForcedErrorFor', { team: pendingPointWinner === 'team1' ? config.team2.name : config.team1.name })}
							activeOpacity={0.75}
						>
							<Text style={styles.pointTypeTitle}>{t('match.forcedErrorRival')}</Text>
							<Text style={styles.pointTypeSubtitle}>
								{pendingPointWinner === 'team1' ? config.team2.name : config.team1.name}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.pointTypeButton, styles.unforcedErrorOption]}
							onPress={() => handleAddPoint(pendingPointWinner, 'unforced_error')}
							accessibilityLabel={t('match.registerUnforcedErrorFor', { team: pendingPointWinner === 'team1' ? config.team2.name : config.team1.name })}
							activeOpacity={0.75}
						>
							<Text style={styles.pointTypeTitle}>{t('match.unforcedErrorRival')}</Text>
							<Text style={styles.pointTypeSubtitle}>
								{pendingPointWinner === 'team1' ? config.team2.name : config.team1.name}
							</Text>
						</TouchableOpacity>
						<Button
							title={t('common.cancel')}
							variant="outline"
							onPress={() => setPendingPointWinner(null)}
						/>
					</View>
				)}
			</Modal>
		</ComponentLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 24,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1f2937',
	},
	completedBadge: {
		backgroundColor: '#10b981',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	completedText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '700',
	},
	infoCard: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
	},
	infoText: {
		fontSize: 14,
		color: '#6b7280',
		marginBottom: 4,
	},
	pointButtonsContainer: {
		gap: 16,
		marginBottom: 24,
	},
	pointButton: {
		paddingVertical: 24,
		borderRadius: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	team1Button: {
		backgroundColor: '#0ea5e9',
	},
	team2Button: {
		backgroundColor: '#d946ef',
	},
	pointButtonText: {
		fontSize: 24,
		fontWeight: '800',
		color: '#ffffff',
		marginBottom: 8,
	},
	pointButtonTeam: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
		opacity: 0.9,
	},
	winnerContainer: {
		backgroundColor: '#fef3c7',
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		marginBottom: 24,
		borderWidth: 2,
		borderColor: '#f59e0b',
	},
	winnerTitle: {
		fontSize: 24,
		fontWeight: '800',
		color: '#92400e',
		marginBottom: 8,
	},
	winnerName: {
		fontSize: 20,
		fontWeight: '700',
		color: '#78350f',
	},
	actionButtons: {
		gap: 12,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	emptyText: {
		fontSize: 18,
		color: '#6b7280',
		marginBottom: 24,
	},
	modalText: {
		fontSize: 16,
		color: '#374151',
		marginBottom: 24,
		lineHeight: 24,
	},
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	pointTypeOptions: {
		gap: 12,
	},
	pointTypeButton: {
		borderRadius: 14,
		paddingVertical: 18,
		paddingHorizontal: 16,
	},
	winnerOption: {
		backgroundColor: '#0ea5e9',
	},
	forcedErrorOption: {
		backgroundColor: '#7c3aed',
	},
	unforcedErrorOption: {
		backgroundColor: '#ef4444',
	},
	pointTypeTitle: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '800',
		marginBottom: 4,
	},
	pointTypeSubtitle: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '600',
		opacity: 0.9,
	},
});
