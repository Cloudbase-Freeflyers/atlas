"use client";

import {ChartContainer} from "@/components/ui/chart.jsx";

import {PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart} from "recharts";
import {Label} from "radix-ui";

export default function GaugeChart({ title, value,label,fill }) {


  const data = [
    { value: value, fill: "var(--color-safari)" },
  ]
  const chartConfig = {
    [label]: {
      label: label,
      color: fill,
    },
  }

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
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                              {value.toLocaleString()}
                            </tspan>
                            <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="tw:text-white"
                            >
                              {label}
                            </tspan>
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
