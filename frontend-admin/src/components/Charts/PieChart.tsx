import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  width?: string;
  height?: string;
  colors?: string[];
  showLabelLine?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  width = '100%',
  height = '300px',
  colors,
  showLabelLine = false,
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
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map((item) => item.name),
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: showLabelLine,
            formatter: '{b}: {d}%',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: showLabelLine,
          },
          data: data,
          color: colors, // 使用传入的自定义颜色
        },
      ],
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
  }, [title, data, colors, showLabelLine]);

  return (
    <div
      ref={chartRef}
      style={{ width, height }}
    />
  );
};

export default PieChart;