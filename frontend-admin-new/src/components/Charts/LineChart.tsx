import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/components/ThemeProvider';

interface LineChartProps {
    title?: string;
    xAxisData: string[];
    series: Array<{
        name: string;
        data: number[];
        color?: string;
        yAxisIndex?: number;
    }>;
    yAxis?: Array<{
        name: string;
    }>;
    height?: string;
}

const LineChart: React.FC<LineChartProps> = ({
    title,
    xAxisData,
    series,
    yAxis = [{ name: '' }],
    height = '400px',
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const option = {
        title: title ? {
            text: title,
            textStyle: {
                color: isDark ? '#ffffff' : '#333333',
                fontSize: 16,
                fontWeight: 'normal',
            },
        } : undefined,
        tooltip: {
            trigger: 'axis',
            backgroundColor: isDark ? '#2d3142' : '#ffffff',
            borderColor: isDark ? '#3a3d4a' : '#e0e0e0',
            textStyle: {
                color: isDark ? '#ffffff' : '#333333',
            },
        },
        legend: {
            data: series.map(s => s.name),
            textStyle: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: isDark ? '#3a3d4a' : '#e0e0e0',
                },
            },
            axisLabel: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
        },
        yAxis: yAxis.map((axis, index) => ({
            type: 'value',
            name: axis.name,
            nameTextStyle: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
            axisLine: {
                lineStyle: {
                    color: isDark ? '#3a3d4a' : '#e0e0e0',
                },
            },
            axisLabel: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
            splitLine: {
                lineStyle: {
                    color: isDark ? '#3a3d4a' : '#f0f0f0',
                },
            },
        })),
        series: series.map((s, index) => ({
            name: s.name,
            type: 'line',
            yAxisIndex: s.yAxisIndex || 0,
            data: s.data,
            smooth: true,
            lineStyle: {
                color: s.color || '#ff6b35',
                width: 2,
            },
            itemStyle: {
                color: s.color || '#ff6b35',
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: s.color ? `${s.color}40` : '#ff6b3540',
                        },
                        {
                            offset: 1,
                            color: s.color ? `${s.color}10` : '#ff6b3510',
                        },
                    ],
                },
            },
        })),
    };

    return (
        <ReactECharts
            option={option}
            style={{ height }}
            theme={theme}
        />
    );
};

export default LineChart;