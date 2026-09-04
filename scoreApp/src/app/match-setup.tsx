import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ComponentLayout from '@/layout/ComponentLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import Button from '@/components/ui/Button'
import { MatchConfig, ScoringMode } from '@/types'
import { useStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import Header from '@/components/ui/Header'

export default function MatchSetup() {
	const router = useRouter();
	const { currentMatch, startMatch } = useStore();
	const { t } = useTranslation();
	const { colors } = useTheme();

	const [team1Player1, setTeam1Player1] = useState('');
	const [team1Player2, setTeam1Player2] = useState('');
	const [team2Player1, setTeam2Player1] = useState('');
	const [team2Player2, setTeam2Player2] = useState('');
	const [startsServing, setstartsServing] = useState<'team1' | 'team2'>('team1');
	const [scoringMode, setScoringMode] = useState<ScoringMode>('golden-point');

	const [errors, setErrors] = useState<Record<string, string>>({});
 
	// Función para validar la creación del partido
	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!team1Player1.trim()) newErrors.team1Player1 = t('common.required');
		if (!team1Player2.trim()) newErrors.team1Player2 = t('common.required');
		if (!team2Player1.trim()) newErrors.team2Player1 = t('common.required');
		if (!team2Player2.trim()) newErrors.team2Player2 = t('common.required');

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	const createMatch = async () => {
		if (!validate()) return;
 
		// Creo el partido
		const config: MatchConfig = {
			team1: {
				id: 'team1',
				player1: { id: 't1p1', name: team1Player1.trim() },
				player2: { id: 't1p2', name: team1Player2.trim() },
				name: `${team1Player1.trim()} / ${team1Player2.trim()}`,
			},
			team2: {
				id: 'team2',
				player1: { id: 't2p1', name: team2Player1.trim() },
				player2: { id: 't2p2', name: team2Player2.trim() },
				name: `${team2Player1.trim()} / ${team2Player2.trim()}`,
			},
			startsServing,
			scoringMode,
			startTime: new Date(),
		}
		// Inicio el partido -> Estado global en Zustand
		await startMatch(config);
		router.push('/match');
	}

	const handleStartMatch = () => {
		if (currentMatch?.status === 'in-progress') {
			Alert.alert(
				t('matchSetup.replaceActiveTitle'),
				t('matchSetup.replaceActiveMessage'),
				[
					{ text: t('common.cancel'), style: 'cancel' },
					{ text: t('matchSetup.startNewMatch'), style: 'destructive', onPress: () => void createMatch() },
				]
			);
			return;
		}

		void createMatch();
	}

	return (
		<ComponentLayout>
			<View style={styles.fixedHeader}>
				<Header title={t('matchSetup.title')} />
			</View>
			<ScrollView
				className='flex-1'
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Team 1 */}
				<CardInputPlayers
					title={t('matchSetup.team1')}
					value1={team1Player1}
					value2={team1Player2}
					setValue1={setTeam1Player1}
					setValue2={setTeam1Player2}
					error1={errors.team1Player1}
					error2={errors.team1Player2}
				/>
				{/* Team 2 */}
				<CardInputPlayers
					title={t('matchSetup.team2')}
					value1={team2Player1}
					value2={team2Player2}
					setValue1={setTeam2Player1}
					setValue2={setTeam2Player2}
					error1={errors.team2Player1}
					error2={errors.team2Player2}
				/>
				{/* Quien empieza sacando */}
				<Card style={{ marginBottom: 20 }}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>{t('matchSetup.startsServing')}</Text>
					<View style={styles.optionContainer}>
						<TouchableOpacity
							style={[
								styles.optionButton,
								startsServing === 'team1' && styles.optionButtonActive,
							]}
							onPress={() => setstartsServing('team1')}
						>
							<Text
								style={[
									styles.optionText,
									startsServing === 'team1' && styles.optionTextActive,
								]}
							>
								{t('matchSetup.team1')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.optionButton,
								startsServing === 'team2' && styles.optionButtonActive,
							]}
							onPress={() => setstartsServing('team2')}
						>
							<Text
								style={[
									styles.optionText,
									startsServing === 'team2' && styles.optionTextActive,
								]}
							>
								{t('matchSetup.team2')}
							</Text>
						</TouchableOpacity>
					</View>
				</Card>
				{/* Punto de Oro / Ventaja */}
				<Card style={{ marginBottom: 20 }}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>{t('matchSetup.scoringMode')}</Text>
					<View style={styles.optionContainer}>
						<TouchableOpacity
							style={[
								styles.optionButton,
								scoringMode === 'golden-point' && styles.optionButtonActive,
							]}
							onPress={() => setScoringMode('golden-point')}
						>
							<Text
								style={[
									styles.optionText,
									scoringMode === 'golden-point' && styles.optionTextActive,
								]}
							>
								{t('matchSetup.goldenPoint')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.optionButton,
								scoringMode === 'advantage' && styles.optionButtonActive,
							]}
							onPress={() => setScoringMode('advantage')}
						>
							<Text
								style={[
									styles.optionText,
									scoringMode === 'advantage' && styles.optionTextActive,
								]}
							>
								{t('matchSetup.advantage')}
							</Text>
						</TouchableOpacity>
					</View>
				</Card>
				{/* Empezar partido */}
				<Button
					title={t('matchSetup.startMatch')}
					size='lg'
					onPress={handleStartMatch}
				/>
			</ScrollView>
		</ComponentLayout>
	)
}


interface CardInputPlayersProps {
	title: string,
	value1: string,
	value2: string,
	setValue1: (player: string) => void,
	setValue2: (player: string) => void,
	error1: string,
	error2: string,
}

function CardInputPlayers({
	title, value1, value2, setValue1, setValue2, error1, error2
}: CardInputPlayersProps) {
	const { t } = useTranslation(); 

	return (
		<Card style={{ marginBottom: 20 }}>
			<Text className='text-lg font-bold color-[#1f2937] mb-4'>{title}</Text>
			<Input
				label={t('matchSetup.player1')}
				value={value1}
				onChangeText={setValue1}
				placeholder={t('matchSetup.enterPlayerNames')}
				error={error1}
			/>
			<Input
				label={t('matchSetup.player2')}
				value={value2}
				onChangeText={setValue2}
				placeholder={t('matchSetup.enterPlayerNames')}
				error={error2}
			/>
		</Card>
	)
}

const styles = StyleSheet.create({
	fixedHeader: {
		paddingHorizontal: 24,
		paddingTop: 8,
		backgroundColor: 'transparent',
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingBottom: 32,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 16,
	},
	optionContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	optionButton: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: '#d1d5db',
		backgroundColor: '#ffffff',
		alignItems: 'center',
	},
	optionButtonActive: {
		borderColor: '#0ea5e9',
		backgroundColor: '#e0f2fe',
	},
	optionText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6b7280',
	},
	optionTextActive: {
		color: '#0ea5e9',
	},
})
