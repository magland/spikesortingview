import { useTimeFocus } from 'contexts/RecordingSelectionContext';
import { Matrix } from 'mathjs';
import { useMemo } from 'react';
import { convert1dDataSeries } from 'util/pointProjection';
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


export const defaultMargins = {
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
        const {hideTimeAxis, hideToolbar, useYAxis } = timeseriesLayoutOpts || {}
        const yAxisLeftMargin = useYAxis ? 20 : 0
        const defaultMargins = hideToolbar ? {
                    left: 30 + yAxisLeftMargin,
                    right: 20,
                    top: 20,
                    bottom: hideTimeAxis ? 20 : 50
                } : {
                    left: 20 + yAxisLeftMargin,
                    right: 20,
                    top: 10,
                    bottom: hideTimeAxis ? 0 : 40
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

export const useFocusTimeInPixels = (timeToPixelMatrix: Matrix, visibleTimeStartSeconds: number) => {
    const {focusTime} = useTimeFocus()
    return useMemo(() => {
        if (focusTime === undefined || visibleTimeStartSeconds === undefined) return undefined
        return convert1dDataSeries([focusTime], timeToPixelMatrix)[0]
    }, [timeToPixelMatrix, focusTime, visibleTimeStartSeconds])
}
