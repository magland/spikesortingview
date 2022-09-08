import { Matrix } from 'mathjs';
import { useMemo } from 'react';
import { convert1dDataSeries, getScaleFrom1dScalingMatrix } from 'libraries/util-point-projection';

export type TimeTick = {
    value: number
    label: string
    major: boolean
    pixelXposition: number
}

type TickUnit = {
    name: string,
    secondsPerTick: number,
    countPerLargerUnit: number,
    scale_appropriate_label: (a: number) => string
}

const tickUnits: TickUnit[] = [
    {
        name: '1ms',
        secondsPerTick: 0.001,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 1000} ms`)
    },
    {
        name: '10ms',
        secondsPerTick: 0.01,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 1000} ms`)
    },
    {
        name: '100ms',
        secondsPerTick: 0.1,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${(a * 100) % 1000} ms`)
    },
    {
        name: '1s',
        secondsPerTick: 1,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 60} s`)
    },
    {
        name: '10s',
        secondsPerTick: 10,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 60} s`)
    },
    {
        name: '1min',
        secondsPerTick: 60,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 60} min`)
    },
    {
        name: '10min',
        secondsPerTick: 60 * 10,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 60} min`)
    },
    {
        name: '1hr',
        secondsPerTick: 60 * 60,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${a % 24} hr`)
    },
    {
        name: '6hr',
        secondsPerTick: 60 * 60 * 6,
        countPerLargerUnit: 4,
        scale_appropriate_label: (a: number) => (`${(a * 6) % 24} hr`)
    },
    {
        name: '1day',
        secondsPerTick: 60 * 60 * 24,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a} day`)
    },
    {
        name: '10day',
        secondsPerTick: 60 * 60 * 24 * 10,
        countPerLargerUnit: 10000,
        scale_appropriate_label: (a: number) => (`${10 * a} day`)
    }
]

export const useTimeTicks = (startTimeSec: number | undefined, endTimeSec: number | undefined, timeToPixelMatrix: Matrix) => {
    return useMemo(() => {
        if (startTimeSec === undefined || endTimeSec === undefined) return []
        const ret: any[] = []
        const pixelsPerSecond = getScaleFrom1dScalingMatrix(timeToPixelMatrix)
        // iterate over the defined tick scales and populate individual ticks of the appropriate scale.
        for (let u of tickUnits) {
            // pixels/second * seconds/tick = pixels/tick
            const pixelsPerTick = pixelsPerSecond * u.secondsPerTick
            if (pixelsPerTick <= 50) continue // ignore scales which would have too many ticks

            const firstTickInRange = Math.ceil(startTimeSec / u.secondsPerTick)
            const lastTickInRange = Math.floor(endTimeSec / u.secondsPerTick)
            // A tick scale is major if it passes a minimum width or if there's fewer than 5 ticks at that scale.
            const major = (pixelsPerTick > 200) || ((lastTickInRange - firstTickInRange) < 5)

            for (let tickNumber = firstTickInRange; tickNumber <= lastTickInRange; tickNumber++) {
                // skip ticks which would be represented by the next-larger scale
                if ((tickNumber % u.countPerLargerUnit) === 0) continue

                ret.push({
                    value: tickNumber * u.secondsPerTick,
                    label: u.scale_appropriate_label(tickNumber),
                    major,
                })
            }
        }
        const tickPositions = convert1dDataSeries(ret.map(tick => tick.value), timeToPixelMatrix)
        tickPositions.forEach((t, i) => ret[i].pixelXposition = t)
        return ret as TimeTick[]
    }, [startTimeSec, endTimeSec, timeToPixelMatrix])
}
