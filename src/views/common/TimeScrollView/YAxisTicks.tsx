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

/**
 * Find a set of appropriately-scaled grid lines for the Y axis of a plot.
 * We assume that we have data over some range, and want to break the Y axis into ticks
 * that will generate enough grid lines to be useful, but not so many that they will make
 * it hard to read the plot or otherwise obscure the data.
 * 
 * Grid lines are considered valid if each line represents a step of 1, 2, or 5 base units,
 * where the base unit is some power of 10 of the data displayed in the chart. Conceptually,
 * if we have measurements from (e.g.) 123 ml to 187 ml, we will first see if 1-ml grid lines work;
 * this is probably too many, so we'll then try having each grid line/y-axis tick indicate 2 ml;
 * then 5 ml; then 10 ml, 20 ml, etc. until we eventually find an acceptable size.
 * 
 * @param minGridLines Minimum number of grid lines that should be present on the plot.
 * @param maxGridLines Maximum number of grid lines before the plot appears too busy.
 * @param range The range of the values displayed in the plot, normalized to ensure it's got 3 digits
 * before the decimal point.
 * @returns {step: number, scale: number} a dictionary indicating the scale (power of 10) of the chosen
 * grid lines and the size of each step (1, 2, or 5) at that order of magnitude. The distance between
 * any two grid line ticks would then be step * 10 ** scale.
 */
const fitGridLines = (minGridLines: number, maxGridLines: number, range: number): {step: number, scale: number} => {
    let scale = 0
    while (true) {
        const steps = [1, 2, 5]  // candidate step sizes are 1, 2, 5, (10, 20, 50, 100, 200, ...)
        const realizedScale = Math.pow(10, scale)   // realizedScale = the base order of magnitude represented by `scale`.
        const results: {step: number, scale: number}[] = []
        for (let s of steps) {  // for each of the 3 candidate step sizes at this order of magnitude
            // determine how many steps of [1 | 2 | 5] * 10^scale would be needed to exhaust the range.
            // (technically on the plot this will be the number of spaces between the grid lines, thus the hard </>).
            const fit = range/(s * realizedScale)
            if (fit > minGridLines && fit < maxGridLines) {
                // if this split produces an acceptable number of counts, record the step and scale sizes that work.
                results.push({step: s, scale: scale})
            }
            if (fit < minGridLines) {
                // step size was too big--it resulted in too few divisions of the range.
                results.push({step: -1, scale: -1})
                break
            }
        }
        // Completing this loop means we finished evaluating one order of magnitude. If we found
        // a step-scale combination that gave a number of divisions in the acceptable range,
        // it should show up as a result record with a positive step size (...viz, 1, 2, or 5).
        // We never have to worry about it actually being from a different scale, because we run
        // this operation every time we complete an order of magnitude.
        const a = results.find(r => r.step > 0)
        if (a) return a
        // On the other hand, if the result set includes an entry with a step size of -1, then
        // the last loop's step size got too big. This is bad--if we see this, it means it
        // is not productive to try larger step sizes, but if we had found something that did
        // work, we would've returned that first. So realistically this probably means the
        // range of allowed grid lines is too small. (Those are set programmatically from
        // a range of allowable inter-tick pixel counts, minGridSpacingPx and maxGridSpacingPx,
        // which might need to be adjusted.)
        const b = results.find(r => r.step === -1)
        if (b) return b
        scale = scale + 1 // Try the next larger order of magnitude.
        // If a step size of 50_000_000_000 base units still produces too many lines, give up.
        // (This should never happen, since we normalized the input range to 100-1000.)
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
