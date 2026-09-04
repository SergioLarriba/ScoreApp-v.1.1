import React from 'react';
import {
	Modal as RNModal,
	View,
	Text,
	TouchableOpacity,
	ViewStyle,
	TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children }: ModalProps) {
	const { colors } = useTheme();

	const overlayStyle: ViewStyle = {
		flex: 1,
		backgroundColor: colors.overlay,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	};

	const containerStyle: ViewStyle = {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: 24,
		width: '100%',
		maxWidth: 400,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 5,
	};

	const headerStyle: ViewStyle = {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	};

	const titleStyle: TextStyle = {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text,
	};

	const closeButtonStyle: ViewStyle = {
		padding: 4,
	};

	const closeTextStyle: TextStyle = {
		fontSize: 24,
		color: colors.textSecondary,
		fontWeight: '600',
	};

	return (
		<RNModal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={overlayStyle}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={(e) => e.stopPropagation()}
					style={containerStyle}
				>
					{title && (
						<View style={headerStyle}>
							<Text style={titleStyle}>{title}</Text>
							<TouchableOpacity onPress={onClose} style={closeButtonStyle}>
								<Text style={closeTextStyle}>×</Text>
							</TouchableOpacity>
						</View>
					)}
					{children}
				</TouchableOpacity>
			</TouchableOpacity>
		</RNModal>
	);
}
