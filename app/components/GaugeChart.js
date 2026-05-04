"use client";

import {ChartContainer} from "@/components/ui/chart.jsx";
import {formatValue} from "@/lib/formatters.js";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

const CHART_KEY = "spend";

export default function GaugeChart({
  title,
  value,
  label,
  fill = "#ac6cf0",
  max = 100,
  empty,
  valueFormatter = "currency",
}) {
  const numericValue =
    typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const safeMax = max > 0 ? max : 1;
  const barPercent = empty
    ? 0
    : Math.min(100, Math.max(0, (numericValue / safeMax) * 100));

  const data = [
    {
      name: CHART_KEY,
      value: barPercent,
      fill: `var(--color-${CHART_KEY})`,
    },
  ];
  const chartConfig = {
    [CHART_KEY]: {
      label: label ?? "",
      color: fill,
    },
  };

  const centerText = empty ? "—" : formatValue(numericValue, valueFormatter);

  return (
    <div className="card">
      <div className="chart-frame" style={{ paddingBottom: 8 }}>
        <div className="chart-title">
          <strong>{title}</strong>
        </div>
        <ChartContainer
            config={chartConfig}
            className="tw:mx-auto tw:aspect-square tw:max-h-[250px]"
        >
          <RadialBarChart
              data={data}
              startAngle={0}
              endAngle={180}
              innerRadius={90}
              outerRadius={120}
          >
            <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                tickLine={false}
                axisLine={false}
            >
              <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                          <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                          >
                            <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="tw:fill-foreground tw:text-4xl tw:font-bold"
                            >
                              {centerText}
                            </tspan>
                            {label ? (
                              <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="tw:fill-muted-foreground tw:text-sm"
                              >
                                {label}
                              </tspan>
                            ) : null}
                          </text>
                      )
                    }
                  }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
