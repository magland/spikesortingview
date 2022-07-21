import { isOneOf } from 'figurl/viewInterface/validateObject'
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "views/Autocorrelograms/AutocorrelogramsViewData"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "views/AverageWaveforms/AverageWaveformsViewData"
import { CompositeViewData, isCompositeViewData } from "views/Composite/CompositeViewData"
import { ConsoleViewData, isConsoleViewData } from "views/Console/ConsoleViewData"
import { CrossCorrelogramsViewData, isCrossCorrelogramsViewData } from 'views/CrossCorrelograms/CrossCorrelogramsViewData'
import { ElectrodeGeometryViewData, isElectrodeGeometryViewData } from "views/ElectrodeGeometry/ElectrodeGeometryViewData"
import { EpochsViewData, isEpochsViewData } from "views/Epochs/EpochsViewData"
import { isLiveCrossCorrelogramsViewData, LiveCrossCorrelogramsViewData } from "views/LiveCrossCorrelograms/LiveCrossCorrelogramsViewData"
import { isLivePositionPdfPlotViewData, LivePositionPdfPlotViewData } from "views/LivePositionPdfPlot/LivePositionPdfPlotViewData"
import { isMarkdownViewData, MarkdownViewData } from 'views/Markdown/MarkdownView'
import { isMountainLayoutViewData, MountainLayoutViewData } from "views/MountainLayout/MountainLayoutViewData"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "views/MultiTimeseries/MultiTimeseriesViewData"
import { isPositionPdfPlotViewData, PositionPdfPlotViewData } from "views/PositionPdfPlot/PositionPdfPlotViewData"
import { isPositionPlotViewData, PositionPlotViewData } from "views/PositionPlot/PositionPlotViewData"
import { isRasterPlotViewData, RasterPlotViewData } from "views/RasterPlot/RasterPlotViewData"
import { isRawTracesPlotViewData, RawTracesPlotViewData } from "views/RawTracesPlot/RawTracesPlotViewData"
import { isSortingCurationViewData, SortingCurationViewData } from 'views/SortingCuration/SortingCurationViewData'
import { isSortingLayoutViewData, SortingLayoutViewData } from 'views/SortingLayout/SortingLayoutViewData'
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "views/SpikeAmplitudes/SpikeAmplitudesViewData"
import { isSummaryViewData, SummaryViewData } from "views/Summary/SummaryViewData"
import { isTiledImageData, TiledImageData } from 'views/TiledImageComponent/TiledImageComponent'
import { isTrackAnimationStaticData, TrackAnimationStaticData } from "views/TrackPositionAnimation/TrackPositionAnimationTypes"
import { isUnitLocationsViewData, UnitLocationsViewData } from 'views/UnitLocations/UnitLocationsViewData'
import { isUnitMetricsGraphViewData, UnitMetricsGraphViewData } from 'views/UnitMetricsGraph/UnitMetricsGraphViewData'
import { isUnitSimilarityMatrixViewData, UnitSimilarityMatrixViewData } from 'views/UnitSimilarityMatrix/UnitSimilarityMatrixViewData'
import { isUnitsTableViewData, UnitsTableViewData } from "views/UnitsTable/UnitsTableViewData"

export type ViewData =
    AutocorrelogramsViewData |
    RasterPlotViewData |
    CompositeViewData |
    MultiTimeseriesViewData |
    AverageWaveformsViewData |
    UnitsTableViewData |
    SummaryViewData |
    MountainLayoutViewData |
    SpikeAmplitudesViewData |
    ElectrodeGeometryViewData |
    PositionPlotViewData |
    LiveCrossCorrelogramsViewData |
    PositionPdfPlotViewData |
    LivePositionPdfPlotViewData |
    EpochsViewData |
    ConsoleViewData |
    RawTracesPlotViewData |
    TrackAnimationStaticData |
    SortingLayoutViewData |
    CrossCorrelogramsViewData |
    UnitSimilarityMatrixViewData |
    SortingCurationViewData |
    UnitLocationsViewData |
    MarkdownViewData |
    UnitMetricsGraphViewData |
    TiledImageData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isAutocorrelogramsViewData,
        isRasterPlotViewData,
        isCompositeViewData,
        isMultiTimeseriesViewData,
        isAverageWaveformsViewData,
        isUnitsTableViewData,
        isSummaryViewData,
        isMountainLayoutViewData,
        isSpikeAmplitudesViewData,
        isElectrodeGeometryViewData,
        isPositionPlotViewData,
        isLiveCrossCorrelogramsViewData,
        isPositionPdfPlotViewData,
        isLivePositionPdfPlotViewData,
        isEpochsViewData,
        isConsoleViewData,
        isRawTracesPlotViewData,
        isTrackAnimationStaticData,
        isSortingLayoutViewData,
        isCrossCorrelogramsViewData,
        isUnitSimilarityMatrixViewData,
        isSortingCurationViewData,
        isUnitLocationsViewData,
        isMarkdownViewData,
        isUnitMetricsGraphViewData,
        isTiledImageData
    ])(x)
}