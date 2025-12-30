import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/components/ThemeProvider';

interface PieChartProps {
    title?: string;
    data: Array<{
        name: string;
        value: number;
    }>;
    height?: string;
    colors?: string[];
    showLabelLine?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
    title,
    data,
    height = '400px',
    colors = ['#ff6b35', '#52c41a', '#1890ff', '#faad14', '#722ed1', '#eb2f96'],
    showLabelLine = false,
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
            trigger: 'item',
            backgroundColor: isDark ? '#2d3142' : '#ffffff',
            borderColor: isDark ? '#3a3d4a' : '#e0e0e0',
            textStyle: {
                color: isDark ? '#ffffff' : '#333333',
            },
            formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: isDark ? '#a0a3bd' : '#666666',
            },
        },
        series: [
            {
                name: title || '数据',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                label: {
                    show: showLabelLine,
                    position: 'outside',
                    color: isDark ? '#a0a3bd' : '#666666',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: showLabelLine,
                },
                data: data.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: colors[index % colors.length],
                    },
                })),
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

export default PieChart;