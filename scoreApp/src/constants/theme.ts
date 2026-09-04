export type ThemeMode = 'light' | 'dark' | 'auto';
export type ActiveTheme = 'light' | 'dark';

export interface ThemeColors {
	// Backgrounds
	background: string;
	surface: string;
	surfaceVariant: string;

	// Text
	text: string;
	textSecondary: string;
	textTertiary: string;

	// Primary colors
	primary: string;
	primaryLight: string;
	primaryDark: string;

	// Secondary colors
	secondary: string;
	secondaryLight: string;
	secondaryDark: string;

	// Status colors
	success: string;
	warning: string;
	error: string;
	info: string;

	// UI elements
	border: string;
	divider: string;
	shadow: string;
	overlay: string;
}

export const lightTheme: ThemeColors = {
	// Backgrounds
	background: '#f9fafb',
	surface: '#ffffff',
	surfaceVariant: '#f3f4f6',

	// Text
	text: '#1f2937',
	textSecondary: '#6b7280',
	textTertiary: '#9ca3af',

	// Primary colors
	primary: '#0ea5e9',
	primaryLight: '#7dd3fc',
	primaryDark: '#0284c7',

	// Secondary colors
	secondary: '#d946ef',
	secondaryLight: '#f0abfc',
	secondaryDark: '#c026d3',

	// Status colors
	success: '#10b981',
	warning: '#f59e0b',
	error: '#ef4444',
	info: '#3b82f6',

	// UI elements
	border: '#e5e7eb',
	divider: '#f3f4f6',
	shadow: '#000000',
	overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme: ThemeColors = {
	// Backgrounds
	background: '#111827',
	surface: '#1f2937',
	surfaceVariant: '#374151',

	// Text
	text: '#f9fafb',
	textSecondary: '#d1d5db',
	textTertiary: '#9ca3af',

	// Primary colors
	primary: '#38bdf8',
	primaryLight: '#7dd3fc',
	primaryDark: '#0284c7',

	// Secondary colors
	secondary: '#e879f9',
	secondaryLight: '#f0abfc',
	secondaryDark: '#c026d3',

	// Status colors
	success: '#34d399',
	warning: '#fbbf24',
	error: '#f87171',
	info: '#60a5fa',

	// UI elements
	border: '#374151',
	divider: '#4b5563',
	shadow: '#000000',
	overlay: 'rgba(0, 0, 0, 0.7)',
};
