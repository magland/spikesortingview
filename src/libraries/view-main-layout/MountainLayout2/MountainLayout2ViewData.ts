import { validateObject } from "figurl"
import { isSha1Hash, Sha1Hash } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo, optional } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

export type MLViewData = {
    label: string
    type: string
    figureDataSha1?: Sha1Hash // old
    figureDataUri?: string // new
}

const isMLViewData = (x: any): x is MLViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isSha1Hash), // old
        figureDataUri: optional(isString) // new
    }, {allowAdditionalFields: true})
}

export type MountainLayout2ViewData = {
    type: 'MountainLayout'
    views: MLViewData[]
    controls?: MLViewData[]
    sortingCurationUri?: string
}

export const isMountainLayout2ViewData = (x: any): x is MountainLayout2ViewData => {
    return validateObject(x, {
        type: isEqualTo('MountainLayout'),
        views: isArrayOf(isMLViewData),
        controls: optional(isArrayOf(isMLViewData)),
        sortingCurationUri: optional(isString)
    }, {allowAdditionalFields: true})
}