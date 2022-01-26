import { validateObject } from "figurl"
import { isArrayOf, isBoolean, isEqualTo, isString, optional } from "figurl/viewInterface/validateObject"

export type PositionPlotViewData = {
    type: 'PositionPlot'
    timestamps: number[]
    positions: number[][]
    dimensionLabels: string[]
    discontinuous?: boolean
}

export const isPositionPlotViewData = (x: any): x is PositionPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('PositionPlot'),
        timestamps: () => (true),
        positions: () => (true),
        dimensionLabels: isArrayOf(isString),
        discontinuous: optional(isBoolean)
    })
}