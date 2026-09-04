import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeMode } from '../constants/theme';
import ComponentLayout from '../layout/ComponentLayout';
import Card from '../components/ui/Card';

export default function SettingsScreen() {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const { themeMode, setThemeMode, colors, isDark } = useTheme();

	const handleThemeChange = (mode: ThemeMode) => {
		setThemeMode(mode);
	};

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	const ThemeOption = ({ mode, label, icon }: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }) => {
		const isSelected = themeMode === mode;
		return (
			<TouchableOpacity
				style={[
					styles.optionButton,
					{
						backgroundColor: isSelected ? colors.primary : colors.surface,
						borderColor: isSelected ? colors.primary : colors.border,
					},
				]}
				onPress={() => handleThemeChange(mode)}
				activeOpacity={0.7}
			>
				<Ionicons
					name={icon}
					size={24}
					color={isSelected ? '#ffffff' : colors.text}
				/>
				<Text
					style={[
						styles.optionText,
						{ color: isSelected ? '#ffffff' : colors.text },
					]}
				>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	const LanguageOption = ({ lang, label, flag }: { lang: string; label: string; flag: string }) => {
		const isSelected = i18n.language === lang;
		return (
			<TouchableOpacity
				style={[
					styles.optionButton,
					{
						backgroundColor: isSelected ? colors.primary : colors.surface,
						borderColor: isSelected ? colors.primary : colors.border,
					},
				]}
				onPress={() => handleLanguageChange(lang)}
				activeOpacity={0.7}
			>
				<Text style={styles.flagEmoji}>{flag}</Text>
				<Text
					style={[
						styles.optionText,
						{ color: isSelected ? '#ffffff' : colors.text },
					]}
				>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<ComponentLayout>
			<View style={styles.fixedHeader}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
						accessibilityLabel={t('common.back')}
					>
						<Ionicons name="arrow-back" size={24} color={colors.text} />
					</TouchableOpacity>
					<Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
					<View style={styles.placeholder} />
				</View>
			</View>

			<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
				{/* Appearance Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="color-palette-outline" size={20} color={colors.primary} />
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							{t('settings.appearance')}
						</Text>
					</View>

					<Card style={{ backgroundColor: colors.surface }}>
						<Text style={[styles.label, { color: colors.text }]}>{t('settings.theme')}</Text>
						<Text style={[styles.description, { color: colors.textSecondary }]}>
							{t('settings.themeDescription')}
						</Text>
						<View style={styles.optionsContainer}>
							<ThemeOption mode="light" label={t('settings.themeLight')} icon="sunny-outline" />
							<ThemeOption mode="dark" label={t('settings.themeDark')} icon="moon-outline" />
							<ThemeOption mode="auto" label={t('settings.themeAuto')} icon="phone-portrait-outline" />
						</View>
					</Card>
				</View>

				{/* Language Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="language-outline" size={20} color={colors.primary} />
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							{t('settings.language')}
						</Text>
					</View>

					<Card style={{ backgroundColor: colors.surface }}>
						<Text style={[styles.label, { color: colors.text }]}>{t('settings.language')}</Text>
						<Text style={[styles.description, { color: colors.textSecondary }]}>
							{t('settings.languageDescription')}
						</Text>
						<View style={styles.optionsContainer}>
							<LanguageOption lang="es" label={t('settings.languageSpanish')} flag="🇪🇸" />
							<LanguageOption lang="en" label={t('settings.languageEnglish')} flag="🇬🇧" />
						</View>
					</Card>
				</View>

				{/* About Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="information-circle-outline" size={20} color={colors.primary} />
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							{t('settings.about')}
						</Text>
					</View>

					<Card style={{ backgroundColor: colors.surface }}>
						<View style={styles.aboutRow}>
							<Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
								{t('settings.version')}
							</Text>
							<Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
						</View>
						<View style={[styles.divider, { backgroundColor: colors.divider }]} />
						<View style={styles.aboutRow}>
							<Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
							ScoreApp
						</Text>
							<Text style={[styles.aboutValue, { color: colors.text }]}>{t('settings.appDescription')}</Text>
						</View>
					</Card>
				</View>
			</ScrollView>
		</ComponentLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		padding: 20,
		paddingTop: 0,
		paddingBottom: 32,
	},
	fixedHeader: {
		paddingHorizontal: 20,
		paddingTop: 8,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
	},
	placeholder: {
		width: 40,
	},
	section: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		gap: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		marginBottom: 16,
	},
	optionsContainer: {
		gap: 12,
	},
	optionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		gap: 12,
	},
	optionText: {
		fontSize: 16,
		fontWeight: '600',
	},
	flagEmoji: {
		fontSize: 24,
	},
	aboutRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
	},
	aboutLabel: {
		fontSize: 14,
	},
	aboutValue: {
		fontSize: 14,
		fontWeight: '600',
	},
	divider: {
		height: 1,
		marginVertical: 8,
	},
});
