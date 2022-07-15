import { FunctionComponent, useMemo } from "react";
import { determineTickLocationsMsec } from "views/Autocorrelograms/CorrelogramPlot";
import BarPlot, { BarPlotBar } from "views/common/BarPlot/BarPlot";
import { BarPlotTick } from "views/common/BarPlot/BarPlotMainLayer";
import { UMGMetric, UMGUnit } from "./UnitMetricsGraphViewData";

export type UnitMetricHistogramProps = {
    metric: UMGMetric
    units: UMGUnit[]
    selectedUnitIds: Set<number | string>
    width: number
    height: number
}

const UnitMetricHistogram: FunctionComponent<UnitMetricHistogramProps> = ({metric, units, selectedUnitIds, width, height}) => {
    const {bars, ticks} = useMemo(() => {
        const values = units.map(unit => (unit.values[metric.key] as number))
        const valuesSelected = units.filter(u => (selectedUnitIds.has(u.unitId))).map(unit => (unit.values[metric.key] as number))
        return createHistogramBars(values, valuesSelected, 10)
    }, [units, metric, selectedUnitIds])
    return (
        <BarPlot
            width={width}
            height={height}
            bars={bars}
            ticks={ticks}
        />
    )
}

const createHistogramBars = (values: number[], valuesSelected: number[], numBins: number): {bars: BarPlotBar[], ticks: BarPlotTick[]} => {
    if (values.length === 0) return {bars: [], ticks: []}
    let min = Math.min(...values)
    let max = Math.max(...values)
    if (max <= min) return {bars: [], ticks: []}
    min -= (max - min) / numBins / 2
    max += (max - min) / numBins / 2
    const counts: number[] = []
    for (let i = 0; i < numBins; i++) counts.push(0)
    for (let value of values) {
        const i = Math.min(Math.floor((value - min) / (max - min) * numBins), numBins - 1)
        counts[i] ++
    }
    const countsSelected: number[] = []
    for (let i = 0; i < numBins; i++) countsSelected.push(0)
    for (let value of valuesSelected) {
        const i = Math.min(Math.floor((value - min) / (max - min) * numBins), numBins - 1)
        countsSelected[i] ++
    }

    const tickLocations: number[] = determineTickLocations(min, max)
    const ticks: BarPlotTick[] = tickLocations.map(x => ({
        x,
        label: `${x}`
    }))
    
    return {
        bars: [
            ...counts.map((count, i) => {
                const bar: BarPlotBar = {
                    xStart: min + i * (max - min) / numBins,
                    xEnd: min + (i + 1) * (max - min) / numBins,
                    height: count,
                    tooltip: '',
                    color: 'gray'
                }
                return bar
            }),
            ...countsSelected.map((count, i) => {
                const bar: BarPlotBar = {
                    xStart: min + i * (max - min) / numBins,
                    xEnd: min + (i + 1) * (max - min) / numBins,
                    height: count,
                    tooltip: '',
                    color: 'green'
                }
                return bar
            })
        ],
        ticks
    }
}

const determineTickLocations = (min: number, max: number) => {
    const span = max - min
    if (span <= 0) return []
    let scale = 1
    while (span * scale < 100) {
        scale *= 10
    }
    while (span * scale >= 1000) {
        scale /= 10
    }
    return determineTickLocationsMsec(min * scale, max * scale).map(v => (v / scale))
}

export default UnitMetricHistogram