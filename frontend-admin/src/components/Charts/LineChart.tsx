import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SeriesItem {
  name: string;
  data: number[];
  color: string;
  yAxisIndex?: number;
}

interface LineChartProps {
  title: string;
  xAxisData: string[];
  series: SeriesItem[];
  yAxis?: { name: string }[];
  width?: string;
  height?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  xAxisData,
  series,
  yAxis = [{ name: '' }],
  width = '100%',
  height = '300px',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表实例
    chartInstance.current = echarts.init(chartRef.current);

    // 配置图表
    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: yAxis.map((axis, index) => ({
        type: 'value',
        name: axis.name,
        position: index === 1 ? 'right' : 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: series.find((s) => s.yAxisIndex === index)?.color || '#5470c6',
          },
        },
        axisLabel: {
          formatter: index === 1 ? '{value} 元' : '{value}',
        },
      })),
      series: series.map((item) => ({
        name: item.name,
        type: 'line',
        smooth: true,
        data: item.data,
        yAxisIndex: item.yAxisIndex,
        lineStyle: {
          color: item.color,
        },
        itemStyle: {
          color: item.color,
        },
      })),
    };

    // 设置图表配置
    chartInstance.current.setOption(option);

    // 响应式调整图表大小
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [title, xAxisData, series, yAxis]);

  return (
    <div
      ref={chartRef}
      style={{ width, height }}
    />
  );
};

export default LineChart;