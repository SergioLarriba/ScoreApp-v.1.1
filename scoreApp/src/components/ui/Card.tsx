import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
	children: React.ReactNode;
	className?: string;
	style?: ViewStyle;
}

export default function Card({ children, className = '', style }: CardProps) {
	const { colors } = useTheme();

	const cardStyles: ViewStyle = {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: 16,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		...style,
	};

	return <View style={cardStyles}>{children}</View>;
}
