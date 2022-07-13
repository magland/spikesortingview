import { useMemo } from 'react'

type YAxisProps = {
    datamin?: number
    datamax?: number
    userSpecifiedZoom?: number
    pixelHeight: number
}

export type Step = {
    label: string,
    dataValue: number,
    pixelValue?: number,
    isMajor: boolean
}

export type TickSet = {
    ticks: Step[],
    datamax: number,
    datamin: number
}

const minGridSpacingPx = 23
const maxGridSpacingPx = 60

const TRUNCATE_UNCHANGED_HIGHER_ORDER_DIGITS = true

const range = (min: number, max: number, step: number, base: number) => {
    return Array(Math.ceil((max - base)/step))
        .fill(0)
        .map((x, ii) => base + ii * step)
        .filter(x => x > min)
}

const fitGridLines = (minGridLines: number, maxGridLines: number, range: number): {step: number, scale: number} => {
    let scale = 0
    while (true) {
        const steps = [1, 2, 5]
        const realizedScale = Math.pow(10, scale)
        const results = steps.map((s) => {
            const fit = range/(s * realizedScale)
            if (fit > minGridLines && fit < maxGridLines) {
                return {step: s, scale: scale}
            }
            // this means the step size is too big. This shouldn't really happen without finding an acceptable step size first,
            // but we'll check for it later just in case.
            if (fit < minGridLines) { return {step: -1, scale: -1} }
            return {step: 0, scale: 0}
        })
        const a = results.find(r => r.step > 0)
        if (a) return a
        const b = results.find(r => r.step === -1)
        if (b) return b
        scale = scale + 1
        if (scale > 10) {
            return {step: 1, scale: 0}
        }
    }
}

const computeInvariant = (min: number, max: number) => {
    // Identify all the high-order digits that don't change between the range min and max, &
    // suppress them for tick labeling purposes, to keep labels from getting too wide or
    // obscuring the actual change between ticks.
    // (We'll continue to display one digit higher than the actual range.)
    // (This may be undesirable--it's not really that commonly done...)
    let invariant = 0
    const maxScale = Math.trunc(Math.log10(max))
    if (Math.trunc(Math.log10(min)) !== maxScale) return invariant
    const rangeScale = Math.trunc(Math.log10(max - min))
    if (maxScale <= rangeScale) return invariant // can happen with a negative minimum
    const oneOmGreaterThanRange = rangeScale + 1
    const realizedMultiplier = Math.pow(10, -oneOmGreaterThanRange)
    const maxStr = Math.trunc(max * realizedMultiplier).toString()
    const minStr = Math.trunc(min * realizedMultiplier).toString()
    for (const [index, digit] of [...maxStr].entries()) {
        if (digit !== minStr[index]) {
            invariant = invariant * Math.pow(10, (index - oneOmGreaterThanRange))
            break
        }
        invariant = invariant * 10 + parseInt(digit)
    }
    return invariant * Math.pow(10, oneOmGreaterThanRange)
}

const alignWithStepSize = (min: number, stepScale: number) => {
    // Return a number a) lower than the data minimum and b) with a 0 in the stepSize-place.
    // So convert min to 1 place bigger than step scale, then floor.
    const floor = Math.floor(min * Math.pow(10, -(stepScale + 1)))
    const rescaled = floor * Math.pow(10, stepScale + 1)
    return rescaled
}

const makeStep = (raw: number, base: number, scale: number): Step => {
    const trimmed = raw - (TRUNCATE_UNCHANGED_HIGHER_ORDER_DIGITS ? base : 0)
    const scaled = Math.trunc(trimmed * Math.pow(10, -scale))
    const isMajor = scaled % 10 === 0
    const label =  Math.abs(scale) > 3 ? `${(scaled/10).toFixed(1)}e${scale + 1}` : `${scaled * Math.pow(10, scale)}`
    return {label, isMajor, dataValue: raw}
}

const enumerateScaledSteps = (base: number, datamin: number, datamax: number, stepsize: number, scale: number): Step[] => {
    const stepValues = range(datamin, datamax, stepsize, base)
    const invariantAboveRange = computeInvariant(datamin, datamax)
    const steps = stepValues.map(v => makeStep(v, invariantAboveRange, scale))

    return steps
}

const emptyTickSet = {
    ticks: [] as any as Step[],
    datamin: 0,
    datamax: 0
}

const useYAxisTicks = (props: YAxisProps) => {
    const { datamin, datamax, userSpecifiedZoom, pixelHeight } = props
    const yZoom = userSpecifiedZoom ?? 1
    return useMemo(() => {
        if (datamin === undefined || datamax === undefined || datamin === datamax) return emptyTickSet
        const _dataMin = datamin / yZoom
        const _dataMax = datamax / yZoom
        const dataRange = _dataMax - _dataMin
    
        const rangeScale = Math.round(Math.log10(dataRange))
        const zoomedRangeScale = 3 - rangeScale // make sure we're counting through the range with whole numbers
        const zoomedRange = Math.round(dataRange * (Math.pow(10, zoomedRangeScale)))
        const minGridLines = pixelHeight / maxGridSpacingPx
        const maxGridLines = pixelHeight / minGridSpacingPx
        const gridInfo = fitGridLines(minGridLines, maxGridLines, zoomedRange)
        if (gridInfo.step === -1) {
            console.warn(`Error: Unable to compute valid y-axis step size. Suppressing display.`)
            return emptyTickSet
        }
    
        const scaledStep = gridInfo.step * Math.pow(10, gridInfo.scale - zoomedRangeScale)
        const startFrom = alignWithStepSize(_dataMin, gridInfo.scale)
        const steps = enumerateScaledSteps(startFrom, _dataMin, _dataMax, scaledStep, gridInfo.scale - zoomedRangeScale)

        return { ticks: steps, datamin: _dataMin, datamax: _dataMax }
    }, [datamax, datamin, yZoom, pixelHeight])
}

export default useYAxisTicks
