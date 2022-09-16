import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, optional } from "@figurl/spikesortingview.core-utils"
import { isString } from "vega"

export type LayoutItem = {
    type: 'Box'
    direction: 'horizontal' | 'vertical'
    scrollbar?: boolean
    items: LayoutItem[]
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number
        title?: string
    }[]
    showTitles?: boolean
} | {
    type: 'Splitter'
    direction: 'horizontal' | 'vertical'
    items: LayoutItem[] // must have length 2
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number
        title?: string
    }[]
    showTitles?: boolean
} | {
    type: 'Mountain'
    items: LayoutItem[]
    itemProperties: {
        label: string
        isControl?: boolean
    }[]
} | {
    type: 'TabLayout'
    items: LayoutItem[]
    itemProperties: {
        label: string
    }[]
} | {
    type: 'View'
    viewId: string
}

export const isLayoutItem = (x: any): x is LayoutItem => {
    return isOneOf([
        (y: any) => (validateObject(y, {
            type: isEqualTo('Box'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            showTitles: optional(isBoolean),
            scrollbar: optional(isBoolean),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber),
                title: optional(isString)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('Splitter'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            showTitles: optional(isBoolean),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber),
                title: optional(isString)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('Mountain'),
            items: isArrayOf(isLayoutItem),
            itemProperties: isArrayOf(z => (validateObject(z, {
                label: isString,
                isControl: optional(isBoolean)
            })))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('TabLayout'),
            items: isArrayOf(isLayoutItem),
            itemProperties: isArrayOf(z => (validateObject(z, {
                label: isString
            })))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('View'),
            viewId: isString
        }))
    ])(x)
}

export type MLView = {
    viewId: string
    type: string
    dataUri: string
}

export type MainLayoutViewData = {
    type: 'MainLayout'
    views: MLView[]
    layout: LayoutItem
}

export const isMainLayoutViewData = (x: any): x is MainLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('MainLayout'),
        views: isArrayOf(y =>(validateObject(y, {
            viewId: isString,
            type: isString,
            dataUri: isString
        }))),
        layout: isLayoutItem
    })
}