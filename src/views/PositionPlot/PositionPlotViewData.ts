import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isString } from "figurl/viewInterface/validateObject"

export type PositionPlotViewData = {
    type: 'PositionPlot' | 'PositionPlotScatter'
    timestamps: number[]
    positions: number[][]
    dimensionLabels: string[]
}

export const isPositionPlotViewData = (x: any): x is PositionPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('PositionPlot'),
        timestamps: () => (true),
        positions: () => (true),
        dimensionLabels: isArrayOf(isString)
    })
}