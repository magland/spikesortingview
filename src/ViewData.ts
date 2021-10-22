import { isOneOf } from "figurl/viewInterface/kacheryTypes"
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "views/Autocorrelograms/AutocorrelogramsViewData"
import { isRasterPlotViewData, RasterPlotViewData } from "views/RasterPlot/RasterPlotViewData"

export type ViewData =
    AutocorrelogramsViewData |
    RasterPlotViewData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isAutocorrelogramsViewData,
        isRasterPlotViewData
    ])(x)
}