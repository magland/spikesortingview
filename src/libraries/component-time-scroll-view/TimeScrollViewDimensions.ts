import { useTimeFocus } from 'libraries/context-recording-selection';
import { Matrix } from 'mathjs';
import { useMemo } from 'react';
import { convert1dDataSeries } from 'libraries/util-point-projection';
import { TimeseriesLayoutOpts } from 'View';

type PartialMargins = {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
}

export type Margins = {
    left: number,
    right: number,
    top: number,
    bottom: number
}


const defaultMargins: Margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}


export const useDefinedMargins = (margins: Margins | undefined): Margins => {
    return useMemo(() => margins || defaultMargins, [margins])
}


export const useTimeseriesMargins = (timeseriesLayoutOpts: TimeseriesLayoutOpts | undefined, manualMargins?: PartialMargins | undefined): Margins => {
    return useMemo(() => {
        // const {hideTimeAxis, hideToolbar, useYAxis } = timeseriesLayoutOpts || {}
        const {hideTimeAxis } = timeseriesLayoutOpts || {}
        // Let's not have this depend on useYAxis for now
        // because we want all time plots to line up
        // const yAxisLeftMargin = useYAxis ? 20 : 0

        // Not sure why this should depend on hide Toolbar
        // const defaultMargins = hideToolbar ? {
        //             left: 30 + yAxisLeftMargin,
        //             right: 20,
        //             top: 20,
        //             bottom: hideTimeAxis ? 20 : 50
        //         } : {
        //             left: 20 + yAxisLeftMargin,
        //             right: 20,
        //             top: 10,
        //             bottom: hideTimeAxis ? 0 : 40
        //         }

        const defaultMargins = {
            left: 40, // this is probably too much space - but we'll err on the side of too large until we figure out a better solution
            right: 20,
            top: 20,
            bottom: hideTimeAxis ? 20 : 20
        }
        return { ...defaultMargins, ...manualMargins}
    }, [timeseriesLayoutOpts, manualMargins])
}


export const usePanelDimensions = (width: number, height: number, panelCount: number, panelSpacing: number, margins?: Margins) => {
    return useMemo(() => {
        const definedMargins = margins ?? defaultMargins
        const panelWidth = width - definedMargins.left - definedMargins.right
        const panelHeight = (height - definedMargins.top - definedMargins.bottom - panelSpacing * (panelCount - 1)) / panelCount
        return {panelWidth, panelHeight}
    }, [width, height, panelCount, panelSpacing, margins])
}

export const useFocusTimeInPixels = (timeToPixelMatrix: Matrix) => {
    const {focusTime} = useTimeFocus()
    const pixelTime = useMemo(() => {
        if (focusTime === undefined) return undefined
        return convert1dDataSeries([focusTime], timeToPixelMatrix)[0]
    }, [timeToPixelMatrix, focusTime])
    return pixelTime
}
