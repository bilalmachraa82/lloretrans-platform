export function Sparkline({
  data,
  width = 80,
  height = 22,
  strokeClassName = "stroke-primary",
  fillClassName = "fill-primary/15",
}: {
  data: number[];
  width?: number;
  height?: number;
  strokeClassName?: string;
  fillClassName?: string;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `M ${points[0]} L ${points.slice(1).join(" L ")} L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={area} className={fillClassName} />
      <path d={path} className={strokeClassName} fill="none" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
