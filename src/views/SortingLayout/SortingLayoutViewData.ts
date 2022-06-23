import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber, isOneOf, optional } from "figurl/viewInterface/validateObject"
import { isString } from "vega"

export type LayoutItem = {
    type: 'Box'
    direction: 'horizontal' | 'vertical'
    items: LayoutItem[]
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number    
    }[]
} | {
    type: 'Splitter'
    direction: 'horizontal' | 'vertical'
    items: LayoutItem[] // must have length 2
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number    
    }[]
} | {
    type: 'View'
    viewId: string
}

const isLayoutItem = (x: any): x is LayoutItem => {
    return isOneOf([
        (y: any) => (validateObject(y, {
            type: isEqualTo('Box'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('Splitter'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('View'),
            viewId: isString
        }))
    ])(x)
}

export type SLView = {
    viewId: string
    type: string
    dataUri: string
}

export type SortingLayoutViewData = {
    type: 'SortingLayout'
    views: SLView[]
    layout: LayoutItem
}

export const isSortingLayoutViewData = (x: any): x is SortingLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingLayout'),
        views: isArrayOf(y =>(validateObject(y, {
            viewId: isString,
            type: isString,
            dataUri: isString
        }))),
        layout: isLayoutItem
    })
}