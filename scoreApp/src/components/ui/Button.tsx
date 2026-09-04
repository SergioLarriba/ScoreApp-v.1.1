import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
	onPress: () => void;
	title: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	loading?: boolean;
	accessibilityLabel?: string;
}

export default function Button({
	onPress,
	title,
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	accessibilityLabel,
}: ButtonProps) {
	const { colors } = useTheme();

	const getButtonStyles = (): ViewStyle => {
		const baseStyles: ViewStyle = {
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
		};

		// Size styles
		const sizeStyles: Record<string, ViewStyle> = {
			sm: { paddingVertical: 8, paddingHorizontal: 16 },
			md: { paddingVertical: 12, paddingHorizontal: 24 },
			lg: { paddingVertical: 16, paddingHorizontal: 32 },
		};

		// Variant styles using theme colors
		const variantStyles: Record<string, ViewStyle> = {
			primary: { backgroundColor: colors.primary },
			secondary: { backgroundColor: colors.secondary },
			outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
			danger: { backgroundColor: colors.error },
		};

		const disabledStyles: ViewStyle = disabled
			? { backgroundColor: colors.textTertiary, opacity: 0.6 }
			: {};

		return {
			...baseStyles,
			...sizeStyles[size],
			...variantStyles[variant],
			...disabledStyles,
		};
	};

	const getTextStyles = (): TextStyle => {
		const baseStyles: TextStyle = {
			fontWeight: '600',
			color: variant === 'outline' ? colors.primary : '#ffffff',
		};

		const sizeStyles: Record<string, TextStyle> = {
			sm: { fontSize: 14 },
			md: { fontSize: 16 },
			lg: { fontSize: 18 },
		};

		return {
			...baseStyles,
			...sizeStyles[size],
		};
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || loading}
			accessibilityLabel={accessibilityLabel ?? title}
			style={getButtonStyles()}
			activeOpacity={0.7}
		>
			{loading ? (
				<ActivityIndicator color={variant === 'outline' ? colors.primary : '#ffffff'} />
			) : (
				<Text style={getTextStyles()}>{title}</Text>
			)}
		</TouchableOpacity>
	);
}
