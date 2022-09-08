import { validateObject } from "libraries/util-validate-object"
import { isArrayOf, isBoolean, isEqualTo, isNumber, isString, optional } from "libraries/util-validate-object"

export type PositionPlotViewData = {
    type: 'PositionPlot'
    timeOffset?: number
    timestamps: number[]
    positions: number[][]
    dimensionLabels: string[]
    discontinuous?: boolean
}

export const isPositionPlotViewData = (x: any): x is PositionPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('PositionPlot'),
        timeOffset: optional(isNumber),
        timestamps: () => (true),
        positions: () => (true),
        dimensionLabels: isArrayOf(isString),
        discontinuous: optional(isBoolean)
    })
}