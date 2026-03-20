"use client";

import { makePath, normalizeSeries, generateYAxisLabels, generateXAxisLabels } from "../lib/chartUtils";

import {CartesianGrid,LineChart as BaseLineChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "./ui/chart"
export default function LineChart({ title,data,config= {} , height = 250,xKey, xLabel = null }) {
  return (
    <div className="card">
      <div className="chart-frame">
        <div className="chart-title">
          <strong>{title}</strong>
        </div>
        <div style={{ width: '100%', height: height }}>
            <ChartContainer
                config={config}
                className="tw:w-full tw:aspect-auto"
                style={{ height: height }}
            >
                <BaseLineChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })
                        }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    {Object.keys(config).map((key) => (
                        <Line
                            type={config[key].type?config[key].type:'natural'}
                            dataKey={config[key].key}
                            stroke={`var(--color-${key})`}
                            strokeWidth={config[key].width?config[key].width:2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </BaseLineChart>
            </ChartContainer>
        </div>
      </div>
    </div>
  );
}
