"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as BaseLineChart,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisTick } from "../lib/formatters.js";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart.jsx";

function normalizeFormatter(f) {
  if (!f || f === "default") return "default";
  return f;
}

function getAxisPlan(config) {
  const keys = Object.keys(config);
  if (keys.length === 0) return { mode: "none", formatter: "default" };
  if (keys.length >= 2) {
    const f0 = normalizeFormatter(config[keys[0]].formatter);
    const f1 = normalizeFormatter(config[keys[1]].formatter);
    if (f0 !== f1) {
      return {
        mode: "dual",
        leftFormatter: f0,
        rightFormatter: f1,
      };
    }
  }
  return {
    mode: "single",
    formatter: normalizeFormatter(config[keys[0]].formatter),
  };
}

export default function LineChart({
  title,
  data = [],
  config = {},
  height = 250,
  xKey,
  xLabel = null,
}) {
  const axisPlan = useMemo(() => getAxisPlan(config), [config]);
  const keys = Object.keys(config);

  /**
   * Margins reserve space for Y ticks, dot radius, and stroke width.
   * Y-axis padding (below) keeps series off the plot edges; line type defaults to monotone
   * so curves do not overshoot like natural splines.
   */
  const margin = useMemo(() => {
    if (axisPlan.mode === "dual") {
      return { top: 32, right: 62, left: 14, bottom: 32 };
    }
    return { top: 32, right: 20, left: 14, bottom: 32 };
  }, [axisPlan.mode]);

  const yAxisPadding = useMemo(() => ({ top: 14, bottom: 10 }), []);

  const yAxisWidth = axisPlan.mode === "dual" ? 56 : 58;
  const yAxisRightWidth = 56;

  const axisTickProps = useMemo(
    () => ({
      fontSize: 11,
      fill: "#a3a3a3",
    }),
    []
  );

  const formatXTick = (value) => {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return String(value ?? "");
  };

  return (
    <div className="card tw:min-w-0">
      <div className="chart-frame chart-frame--recharts tw:min-w-0 tw:overflow-hidden">
        <div className="chart-title">
          <strong>{title}</strong>
        </div>
        <div
          className="tw:min-w-0 tw:max-w-full tw:overflow-hidden"
          style={{ width: "100%", height }}
        >
          <ChartContainer
            config={config}
            className="tw:aspect-auto tw:h-full tw:min-h-0 tw:min-w-0 tw:max-w-full tw:overflow-hidden tw:w-full"
            style={{ height }}
          >
            <BaseLineChart
              accessibilityLayer
              data={data}
              margin={margin}
            >
              <CartesianGrid vertical={false} />
              {axisPlan.mode !== "none" && axisPlan.mode === "single" && (
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  width={yAxisWidth}
                  domain={["auto", "auto"]}
                  padding={yAxisPadding}
                  tick={axisTickProps}
                  tickFormatter={(v) => formatAxisTick(v, axisPlan.formatter)}
                />
              )}
              {axisPlan.mode === "dual" && (
                <>
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={yAxisWidth}
                    domain={["auto", "auto"]}
                    padding={yAxisPadding}
                    tick={axisTickProps}
                    tickFormatter={(v) =>
                      formatAxisTick(v, axisPlan.leftFormatter)
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={yAxisRightWidth}
                    domain={["auto", "auto"]}
                    padding={yAxisPadding}
                    tick={axisTickProps}
                    tickFormatter={(v) =>
                      formatAxisTick(v, axisPlan.rightFormatter)
                    }
                  />
                </>
              )}
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
                tick={axisTickProps}
                tickFormatter={formatXTick}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              {keys.map((key, idx) => {
                const item = config[key];
                const yAxisId =
                  axisPlan.mode === "dual"
                    ? idx === 0
                      ? "left"
                      : "right"
                    : undefined;
                return (
                  <Line
                    key={key}
                    type={item.type ? item.type : "monotone"}
                    dataKey={item.key}
                    name={item.name ?? item.label ?? key}
                    stroke={`var(--color-${key})`}
                    strokeWidth={item.width ? item.width : 2}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                    {...(yAxisId ? { yAxisId } : {})}
                  />
                );
              })}
            </BaseLineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
