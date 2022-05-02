import { validateObject } from "figurl"
import { isSha1Hash, Sha1Hash } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo, optional } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

type MLViewData = {
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

export type MountainLayoutViewData = {
    type: 'MountainLayout'
    views: MLViewData[]
    sortingCurationUri?: string
}

export const isMountainLayoutViewData = (x: any): x is MountainLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('MountainLayout'),
        views: isArrayOf(isMLViewData),
        sortingCurationUri: optional(isString)
    }, {allowAdditionalFields: true})
}