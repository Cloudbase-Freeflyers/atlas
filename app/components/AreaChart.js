import { makeAreaPath, makePath, normalizeSeries, generateYAxisLabels, generateXAxisLabels } from "../lib/chartUtils";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.jsx";
import {Area, CartesianGrid, AreaChart as BaseAreaChart, XAxis, YAxis} from "recharts";

export default function AreaChart({ title,data, config={}, height = 300,xKey, xLabel = null}) {

  return (
    <div className="card">
      <div className="chart-frame">
        <div className="chart-title">
          <strong>{title}</strong>
        </div>
          <div style={{ width: '100%', height: height }}>
        <ChartContainer
            config={config}
            className="tw:aspect-auto tw:w-full"
            style={{ height: height }}
        >
          <BaseAreaChart data={data} accessibilityLayer margin={{
              left: 12,
              right: 12,
          }}>
            <defs>
                {Object.keys(config).map((key) => (
                    <linearGradient key={`fill${key}`} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={`var(--color-${key})`}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={`var(--color-${key})`}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                      year:'numeric'
                  })
                }}
            />
              <YAxis
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickCount={5}
              />
            <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                            year:'numeric'
                        })
                      }}
                      indicator="dot"

                  />
                }
            />
              {Object.keys(config).map((key) => (
                  <Area
                      type={config[key].type?config[key].type:'natural'}
                      key={key}
                      dataKey={config[key].key}
                      fill={`url(#fill${key})`}
                      stroke={`var(--color-${key})`}
                  />
              ))}
            <ChartLegend content={<ChartLegendContent />} />
          </BaseAreaChart>
        </ChartContainer>
          </div>
      </div>
    </div>
  );
}
