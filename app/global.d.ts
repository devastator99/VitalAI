declare module 'react-native-charts-wrapper' {
    import { ComponentClass } from 'react';
    import { ViewProps } from 'react-native';
  
    export type AxisPosition = 'BOTTOM' | 'TOP' | 'LEFT' | 'RIGHT';
    export type ValueFormatter = string[] | ((value: number) => string);
  
    export interface Axis {
      enabled?: boolean;
      position?: AxisPosition;
      granularity?: number;
      valueFormatter?: ValueFormatter;
      textColor?: string;
      textSize?: number;
    }
  
    export interface Dataset {
      label: string;
      values: { x?: number; y: number }[];
      config: {
        color?: string;
        lineWidth?: number;
        drawValues?: boolean;
      };
    }
  
    export interface ChartData {
      dataSets: Dataset[];
    }
  
    export interface LineChartProps extends ViewProps {
      data: ChartData;
      xAxis?: Axis;
      yAxis?: {
        left?: Axis;
        right?: Axis;
      };
      chartDescription?: { text?: string };
      legend?: { enabled?: boolean };
      animation?: { durationX?: number; durationY?: number };
    }
  
    export const LineChart: ComponentClass<LineChartProps>;
    export const BarChart: ComponentClass<LineChartProps>;
    export const PieChart: ComponentClass<any>;
  }