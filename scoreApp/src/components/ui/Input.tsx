import React from 'react';
import { View, Text, TextInput, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	multiline?: boolean;
}

export default function Input({
	label,
	value,
	onChangeText,
	placeholder,
	error,
	disabled = false,
	multiline = false,
}: InputProps) {
	const { colors } = useTheme();

	const containerStyle: ViewStyle = {
		marginBottom: 16,
	};

	const labelStyle: TextStyle = {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 8,
	};

	const inputStyle: TextStyle = {
		borderWidth: 1,
		borderColor: error ? colors.error : colors.border,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: colors.text,
		backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
	};

	const errorStyle: TextStyle = {
		fontSize: 12,
		color: colors.error,
		marginTop: 4,
	};

	return (
		<View style={containerStyle}>
			{label && <Text style={labelStyle}>{label}</Text>}
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.textTertiary}
				editable={!disabled}
				multiline={multiline}
				style={inputStyle}
			/>
			{error && <Text style={errorStyle}>{error}</Text>}
		</View>
	);
}
