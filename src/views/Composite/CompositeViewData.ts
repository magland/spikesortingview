import { validateObject } from "figurl"
import { isOneOf, isSha1Hash, optional, Sha1Hash } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

type CVViewData = {
    label: string
    type: string
    figureDataSha1: Sha1Hash
    defaultHeight?: number
}

const isCVViewData = (x: any): x is CVViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: isSha1Hash,
        defaultHeight: optional(isNumber)
    })
}

export type CompositeViewData = {
    type: 'Composite'
    layout: 'default'
    views: CVViewData[]
}

export const isCompositeViewData = (x: any): x is CompositeViewData => {
    return validateObject(x, {
        type: isEqualTo('Composite'),
        layout: isOneOf([isEqualTo('default')]),
        views: isArrayOf(isCVViewData)
    })
}