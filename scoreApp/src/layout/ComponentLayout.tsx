import { StyleSheet, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../contexts/ThemeContext'

export default function ComponentLayout({
	children
}: {
	children: React.ReactNode
}) {
	const { colors } = useTheme();

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={{ flex: 1, justifyContent: 'space-between' }}>
				{children}
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({})