import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface HeaderProps {
	title: string, 
}

export default function Header({
	title
} : HeaderProps) {
	return (
		<View style={styles.header}>
			<Text style={styles.title}>{title}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1f2937',
	},
})