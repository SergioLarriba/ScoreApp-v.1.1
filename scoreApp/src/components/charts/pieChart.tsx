import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { PieChartData } from '../../types';
import Card from '../ui/Card';
import { useTranslation } from 'react-i18next';

interface PieChartProps {
	title: string;
	data: PieChartData[];
}

export default function PieChart({ title, data }: PieChartProps) {
	const { t } = useTranslation();
	const screenWidth = Dimensions.get('window').width;
	const chartSize = Math.min(screenWidth - 80, 250);
	const radius = chartSize / 2 - 20;
	const centerX = chartSize / 2;
	const centerY = chartSize / 2;

	// Calculate total for percentages
	const total = data.reduce((sum, item) => sum + item.value, 0);

	// If no data, show empty state
	if (total === 0) {
		return (
			<Card style={{ marginBottom: 16, alignItems: 'center' }}>
				<Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
					{title}
				</Text>
				<Text style={{ fontSize: 14, color: '#6b7280' }}>{t('statistics.noDataYet')}</Text>
			</Card>
		);
	}

	// Calculate pie slices
	let currentAngle = -90; // Start from top
	const slices = data.map((item) => {
		const percentage = item.value / total;
		const angle = percentage * 360;
		const startAngle = currentAngle;
		const endAngle = currentAngle + angle;
		currentAngle = endAngle;

		// Calculate path
		const startRad = (startAngle * Math.PI) / 180;
		const endRad = (endAngle * Math.PI) / 180;

		const x1 = centerX + radius * Math.cos(startRad);
		const y1 = centerY + radius * Math.sin(startRad);
		const x2 = centerX + radius * Math.cos(endRad);
		const y2 = centerY + radius * Math.sin(endRad);

		const largeArc = angle > 180 ? 1 : 0;

		const pathData = [
			`M ${centerX} ${centerY}`,
			`L ${x1} ${y1}`,
			`A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
			'Z',
		].join(' ');

		// Calculate label position
		const labelAngle = (startAngle + endAngle) / 2;
		const labelRad = (labelAngle * Math.PI) / 180;
		const labelRadius = radius * 0.7;
		const labelX = centerX + labelRadius * Math.cos(labelRad);
		const labelY = centerY + labelRadius * Math.sin(labelRad);

		return {
			path: pathData,
			color: item.color,
			label: `${Math.round(percentage * 100)}%`,
			labelX,
			labelY,
			percentage: Math.round(percentage * 100),
		};
	});

	return (
		<Card style={{ marginBottom: 16, alignItems: 'center' }}>
			<Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
				{title}
			</Text>

			<Svg width={chartSize} height={chartSize}>
				<G>
					{slices.map((slice, index) => (
						<G key={index}>
							<Path d={slice.path} fill={slice.color} />
							<SvgText
								x={slice.labelX}
								y={slice.labelY}
								fill="#ffffff"
								fontSize="16"
								fontWeight="bold"
								textAnchor="middle"
								alignmentBaseline="middle"
							>
								{slice.label}
							</SvgText>
						</G>
					))}
				</G>
			</Svg>

			{/* Legend */}
			<View style={{ marginTop: 12, width: '100%' }}>
				{data.map((item, index) => (
					<View
						key={index}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 8,
						}}
					>
						<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
							<View
								style={{
									width: 16,
									height: 16,
									borderRadius: 4,
									backgroundColor: item.color,
									marginRight: 8,
								}}
							/>
							<Text style={{ fontSize: 14, color: '#374151' }}>{item.label}</Text>
						</View>
						<Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
							{item.value} ({Math.round((item.value / total) * 100)}%)
						</Text>
					</View>
				))}
			</View>
		</Card>
	);
}
