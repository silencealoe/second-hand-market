import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/components/ThemeProvider';

interface BarChartProps {
    title?: string;
    data: Array<{
        name: string;
        value: number;
    }>;
    height?: string;
    color?: string;
}

const BarChart: React.FC<BarChartProps> = ({
    title,
    data,
    height = '400px',
    color = '#ff6b35',
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
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLine: {
                lineStyle: {
                    color: isDark ? '#3a3d4a' : '#e0e0e0',
                },
            },
            axisLabel: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
        },
        yAxis: {
            type: 'value',
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
        },
        series: [
            {
                type: 'bar',
                data: data.map(item => item.value),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: color,
                            },
                            {
                                offset: 1,
                                color: `${color}80`,
                            },
                        ],
                    },
                },
                barWidth: '60%',
            },
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{ height }}
            theme={theme}
        />
    );
};

export default BarChart;