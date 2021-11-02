import { validateObject } from "figurl"
import { isSha1Hash, Sha1Hash } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

type MLViewData = {
    label: string
    type: string
    figureDataSha1: Sha1Hash
}

const isMLViewData = (x: any): x is MLViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: isSha1Hash
    })
}

export type MountainLayoutViewData = {
    type: 'MountainLayout'
    views: MLViewData[]
}

export const isMountainLayoutViewData = (x: any): x is MountainLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('MountainLayout'),
        views: isArrayOf(isMLViewData)
    })
}