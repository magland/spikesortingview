import { validateObject } from "figurl"
import { isSha1Hash, optional, Sha1Hash } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

type MTPanelData = {
    label: string
    type: string
    figureDataSha1?: Sha1Hash // old
    figureDataUri?: string // new
    relativeHeight?: number
}

const isMTPanelData = (x: any): x is MTPanelData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isSha1Hash),
        figureDataUri: optional(isString),
        relativeHeight: optional(isNumber)
    })
}

export type MultiTimeseriesViewData = {
    type: 'MultiTimeseries'
    panels: MTPanelData[]
}

export const isMultiTimeseriesViewData = (x: any): x is MultiTimeseriesViewData => {
    return validateObject(x, {
        type: isEqualTo('MultiTimeseries'),
        panels: isArrayOf(isMTPanelData)
    })
}