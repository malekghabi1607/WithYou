"use client";

import * as React from "react";
import * as Recharts from "recharts"; // ✅ CORRECTION IMPORT
import { cn } from "./utils";

// Thèmes
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within <ChartContainer />");
  return context;
}

/* ------------------------------------------------------
   CONTAINER
------------------------------------------------------ */

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />

        {/* ✅ Correction RechartsPrimitive → Recharts */}
        <Recharts.ResponsiveContainer>
          {children}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* ------------------------------------------------------
   STYLE DYNAMIQUE
------------------------------------------------------ */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme || item.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([themeName, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, val]) => {
    const color =
      val.theme?.[themeName as keyof typeof val.theme] || val.color;
    return color ? `  --color-${key}: ${color};` : "";
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/* ------------------------------------------------------
   TOOLTIP
------------------------------------------------------ */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  formatter,
  color,
  nameKey,
  labelKey,
}: {
  active?: boolean;
  payload?: any[];
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatter?: (
    value: any,
    name: string,
    item: any,
    index: number,
    raw: any
  ) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "border rounded-lg p-2 text-xs shadow-xl bg-background",
        className
      )}
    >
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = config[key];
          const indicatorColor = color || item.color;

          return (
            <div
              key={index}
              className="flex w-full items-center justify-between gap-2"
            >
              {!hideIndicator && (
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: indicatorColor }}
                />
              )}

              <span className="text-muted-foreground">
                {itemConfig?.label || item.name}
              </span>

              <span className="font-mono text-foreground">
                {item.value?.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
/* ------------------------------------------------------
   LÉGENDE
------------------------------------------------------ */

const ChartLegend = Recharts.Legend; // ✅ CORRECTION

function ChartLegendContent({
  payload,
  className,
  nameKey,
  hideIcon = false,
}: {
  payload?: Recharts.LegendPayload[];
  className?: string;
  nameKey?: string;
  hideIcon?: boolean;
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex gap-4 justify-center", className)}>
      {payload.map((item, idx) => {
        const key = `${nameKey || item.dataKey}`;
        const conf = config[key];

        return (
          <div key={idx} className="flex items-center gap-2">
            {!hideIcon && (
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span>{conf?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------
   EXPORTS
------------------------------------------------------ */

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};