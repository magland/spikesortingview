import { isOneOf } from "figurl/viewInterface/kacheryTypes"
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "views/Autocorrelograms/AutocorrelogramsViewData"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "views/AverageWaveforms/AverageWaveformsViewData"
import { CompositeViewData, isCompositeViewData } from "views/Composite/CompositeViewData"
import { isRasterPlotViewData, RasterPlotViewData } from "views/RasterPlot/RasterPlotViewData"
import { isUnitsTableViewData, UnitsTableViewData } from "views/UnitsTable/UnitsTableViewData"

export type ViewData =
    AutocorrelogramsViewData |
    RasterPlotViewData |
    CompositeViewData |
    AverageWaveformsViewData |
    UnitsTableViewData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isAutocorrelogramsViewData,
        isRasterPlotViewData,
        isCompositeViewData,
        isAverageWaveformsViewData,
        isUnitsTableViewData
    ])(x)
}