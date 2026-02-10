export function makePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function normalizeSeries(series, width, height, padding = { top: 20, right: 20, bottom: 40, left: 60 }) {
  const flat = series.flatMap((item) => item.data);
  const max = Math.max(...flat, 1);
  const min = Math.min(...flat, 0);
  const span = max - min || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  return series.map((item) => {
    const step = chartWidth / (item.data.length - 1 || 1);
    const points = item.data.map((value, index) => {
      const x = padding.left + step * index;
      const y = padding.top + chartHeight - ((value - min) / span) * chartHeight;
      return { x, y, value };
    });
    return { ...item, points, min, max, span };
  });
}

export function makeAreaPath(points, height, padding = { top: 20, right: 20, bottom: 40, left: 60 }) {
  if (!points.length) return "";
  const line = makePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const bottom = height - padding.bottom;
  return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

export function generateYAxisLabels(min, max, count = 5) {
  const span = max - min;
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const value = max - step * i;
    return {
      value,
      label: formatAxisValue(value)
    };
  });
}

export function generateXAxisLabels(dataLength, labels = null) {
  if (labels && labels.length === dataLength) {
    return labels;
  }
  // Generate simple numeric labels
  return Array.from({ length: dataLength }, (_, i) => i + 1);
}

function formatAxisValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1 && value > 0) return value.toFixed(2);
  return Math.round(value).toString();
}
