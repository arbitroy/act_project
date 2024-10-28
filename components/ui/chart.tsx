"use client"

import * as React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Grid } from "@visx/grid"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear } from "@visx/scale"
import { Bar } from "@visx/shape"
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip"

import { cn } from "@/lib/utils"

const tooltipStyles = {
    ...defaultStyles,
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    padding: 12,
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Array<{ name: string; value: number }>
}

export function Chart({ className, data, ...props }: ChartProps) {
    const width = 350
    const height = 200
    const margin = { top: 20, right: 20, bottom: 20, left: 40 }

    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom

    const x = (d: { name: string }) => d.name
    const y = (d: { value: number }) => d.value

    const xScale = scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: data.map(x),
        padding: 0.4,
    })
    const yScale = scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(y))],
    })

    const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
        useTooltip()

    const { TooltipInPortal } = useTooltipInPortal({
        scroll: true,
    })

    return (
        <div className={cn("w-full h-[200px]", className)} {...props}>
            <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                    <Grid
                        xScale={xScale}
                        yScale={yScale}
                        width={xMax}
                        height={yMax}
                        stroke="var(--border)"
                        strokeOpacity={0.1}
                    />
                    <AxisBottom
                        top={yMax}
                        scale={xScale}
                        tickFormat={(value) => value}
                        stroke="var(--border)"
                        tickStroke="var(--border)"
                        tickLabelProps={{
                            fill: "var(--muted-foreground)",
                            fontSize: 10,
                            textAnchor: "middle",
                        }}
                    />
                    <AxisLeft
                        scale={yScale}
                        stroke="var(--border)"
                        tickStroke="var(--border)"
                        tickLabelProps={{
                            fill: "var(--muted-foreground)",
                            fontSize: 10,
                            textAnchor: "end",
                            dy: "0.33em",
                            dx: -4,
                        }}
                    />
                    {data.map((d) => {
                        const barWidth = xScale.bandwidth()
                        const barHeight = yMax - (yScale(y(d)) ?? 0)
                        const barX = xScale(x(d))
                        const barY = yMax - barHeight
                        return (
                            <Bar
                                key={`bar-${x(d)}`}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill="var(--primary)"
                                onMouseLeave={() => hideTooltip()}
                                onMouseMove={() => {
                                    const top = barY + margin.top
                                    const left = (barX ?? 0) + barWidth / 2 + margin.left
                                    showTooltip({
                                        tooltipData: d,
                                        tooltipTop: top,
                                        tooltipLeft: left,
                                    })
                                }}
                            />
                        )
                    })}
                </Group>
            </svg>
            {tooltipOpen && tooltipData && (
                <TooltipInPortal
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={tooltipStyles}
                >
                    <div className="text-sm">
                        <strong>{x(tooltipData as any)}</strong>
                        <div>{y(tooltipData as any)}</div>
                    </div>
                </TooltipInPortal>
            )}
        </div>
    )
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    config?: Record<string, { label: string; color: string }>
}

export function ChartContainer({
    className,
    config,
    children,
    ...props
}: ChartContainerProps) {
    return (
        <div className={cn("space-y-4", className)} {...props}>
            {children}
            {config && (
                <div className="flex flex-wrap gap-4">
                    {Object.entries(config).map(([key, { label, color }]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

interface ChartTooltipProps {
    content: React.ReactNode
}

export function ChartTooltip({ content }: ChartTooltipProps) {
    return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
            {content}
        </div>
    )
}

interface ChartTooltipContentProps {
    active?: boolean
    payload?: Array<{ value: number; name: string }>
    label?: string
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
    if (!active || !payload) return null

    return (
        <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            {payload.map((item, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                </p>
            ))}
        </div>
    )
}