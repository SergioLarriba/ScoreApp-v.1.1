import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ActiveTheme, ThemeColors, lightTheme, darkTheme } from '../constants/theme';

const THEME_STORAGE_KEY = '@scoreapp_theme';

interface ThemeContextType {
	themeMode: ThemeMode;
	activeTheme: ActiveTheme;
	colors: ThemeColors;
	setThemeMode: (mode: ThemeMode) => void;
	isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const systemColorScheme = useColorScheme();
	const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
	const [isLoading, setIsLoading] = useState(true);

	// Determine active theme based on mode and system preference
	const activeTheme: ActiveTheme =
		themeMode === 'auto'
			? (systemColorScheme === 'dark' ? 'dark' : 'light')
			: themeMode;

	const isDark = activeTheme === 'dark';
	const colors = isDark ? darkTheme : lightTheme;

	// Load theme preference from storage
	useEffect(() => {
		loadThemePreference();
	}, []);

	const loadThemePreference = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
			if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
				setThemeModeState(savedTheme as ThemeMode);
			}
		} catch (error) {
			console.error('Error al cargar la preferencia de tema:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const setThemeMode = async (mode: ThemeMode) => {
		try {
			setThemeModeState(mode);
			await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch (error) {
			console.error('Error al guardar la preferencia de tema:', error);
		}
	};

	// Don't render children until theme is loaded
	if (isLoading) {
		return null;
	}

	return (
		<ThemeContext.Provider
			value={{
				themeMode,
				activeTheme,
				colors,
				setThemeMode,
				isDark,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
