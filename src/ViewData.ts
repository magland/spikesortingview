import { isOneOf } from "figurl/viewInterface/kacheryTypes"
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "views/Autocorrelograms/AutocorrelogramsViewData"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "views/AverageWaveforms/AverageWaveformsViewData"
import { CompositeViewData, isCompositeViewData } from "views/Composite/CompositeViewData"
import { ElectrodeGeometryViewData, isElectrodeGeometryViewData } from "views/ElectrodeGeometry/ElectrodeGeometryViewData"
import { isLiveCrossCorrelogramsViewData, LiveCrossCorrelogramsViewData } from "views/LiveCrossCorrelograms/LiveCrossCorrelogramsViewData"
import { isMountainLayoutViewData, MountainLayoutViewData } from "views/MountainLayout/MountainLayoutViewData"
import { isPositionPdfPlotViewData, PositionPdfPlotViewData } from "views/PositionPdfPlot/PositionPdfPlotViewData"
import { isPositionPlotViewData, PositionPlotViewData } from "views/PositionPlot/PositionPlotViewData"
import { isRasterPlotViewData, RasterPlotViewData } from "views/RasterPlot/RasterPlotViewData"
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "views/SpikeAmplitudes/SpikeAmplitudesViewData"
import { isSummaryViewData, SummaryViewData } from "views/Summary/SummaryViewData"
import { isUnitsTableViewData, UnitsTableViewData } from "views/UnitsTable/UnitsTableViewData"

export type ViewData =
    AutocorrelogramsViewData |
    RasterPlotViewData |
    CompositeViewData |
    AverageWaveformsViewData |
    UnitsTableViewData |
    SummaryViewData |
    MountainLayoutViewData |
    SpikeAmplitudesViewData |
    ElectrodeGeometryViewData |
    PositionPlotViewData |
    LiveCrossCorrelogramsViewData |
    PositionPdfPlotViewData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isAutocorrelogramsViewData,
        isRasterPlotViewData,
        isCompositeViewData,
        isAverageWaveformsViewData,
        isUnitsTableViewData,
        isSummaryViewData,
        isMountainLayoutViewData,
        isSpikeAmplitudesViewData,
        isElectrodeGeometryViewData,
        isPositionPlotViewData,
        isLiveCrossCorrelogramsViewData,
        isPositionPdfPlotViewData
    ])(x)
}