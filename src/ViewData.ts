import { isOneOf } from 'figurl/viewInterface/validateObject'
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "libraries/Autocorrelograms"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "libraries/AverageWaveforms"
import { ConfusionMatrixViewData, isConfusionMatrixViewData } from 'libraries/ConfusionMatrix'
import { CrossCorrelogramsViewData, isCrossCorrelogramsViewData } from 'libraries/CrossCorrelograms'
import { ElectrodeGeometryViewData, isElectrodeGeometryViewData } from "libraries/ElectrodeGeometry"
import { isMarkdownViewData, MarkdownViewData } from 'libraries/Markdown'
import { isSortingCurationViewData, SortingCurationViewData } from 'libraries/SortingCuration'
import { isSortingCuration2ViewData, SortingCuration2ViewData } from 'libraries/SortingCuration2'
import { isSummaryViewData, SummaryViewData } from "libraries/Summary"
import { isUnitSimilarityMatrixViewData, UnitSimilarityMatrixViewData } from 'libraries/UnitSimilarityMatrix'
import { CompositeViewData, isCompositeViewData } from "views/Composite/CompositeViewData"
import { ConsoleViewData, isConsoleViewData } from "views/Console/ConsoleViewData"
import { EpochsViewData, isEpochsViewData } from "views/Epochs/EpochsViewData"
import { isLiveCrossCorrelogramsViewData, LiveCrossCorrelogramsViewData } from "views/LiveCrossCorrelograms/LiveCrossCorrelogramsViewData"
import { isLiveEvaluateFunctionViewData, LiveEvaluateFunctionViewData } from 'views/LiveEvaluateFunction/LiveEvaluateFunctionView'
import { isLivePositionPdfPlotViewData, LivePositionPdfPlotViewData } from "views/LivePositionPdfPlot/LivePositionPdfPlotViewData"
import { isLiveTracesViewData, LiveTracesViewData } from 'views/LiveTraces/LiveTracesViewData'
import { isMountainLayoutViewData, MountainLayoutViewData } from "views/MountainLayout/MountainLayoutViewData"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "views/MultiTimeseries/MultiTimeseriesViewData"
import { isPositionPdfPlotViewData, PositionPdfPlotViewData } from "views/PositionPdfPlot/PositionPdfPlotViewData"
import { isPositionPlotViewData, PositionPlotViewData } from "views/PositionPlot/PositionPlotViewData"
import { isRasterPlotViewData, RasterPlotViewData } from "views/RasterPlot/RasterPlotViewData"
import { isRawTracesViewData, RawTracesViewData } from "views/RawTraces/RawTracesViewData"
import { isSortingLayoutViewData, SortingLayoutViewData } from 'views/SortingLayout/SortingLayoutViewData'
import { isSortingSelectionViewData, SortingSelectionViewData } from 'views/SortingSelection/SortingSelectionViewData'
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "views/SpikeAmplitudes/SpikeAmplitudesViewData"
import { isSpikeLocationsViewData, SpikeLocationsViewData } from 'views/SpikeLocations/SpikeLocationsViewData'
import { isTiledImageData, TiledImageData } from 'views/TiledImageComponent/TiledImageComponent'
import { isTrackAnimationStaticData, TrackAnimationStaticData } from "views/TrackPositionAnimation/TrackPositionAnimationTypes"
import { isUnitLocationsViewData, UnitLocationsViewData } from 'libraries/UnitLocations'
import { isUnitMetricsGraphViewData, UnitMetricsGraphViewData } from 'libraries/UnitMetricsGraph'
import { isUnitsTableViewData, UnitsTableViewData } from "libraries/UnitsTable"

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
    RawTracesViewData |
    TrackAnimationStaticData |
    SortingLayoutViewData |
    CrossCorrelogramsViewData |
    UnitSimilarityMatrixViewData |
    SortingCurationViewData |
    UnitLocationsViewData |
    MarkdownViewData |
    UnitMetricsGraphViewData |
    TiledImageData |
    SortingCuration2ViewData |
    SortingSelectionViewData |
    SpikeLocationsViewData |
    ConfusionMatrixViewData |
    LiveEvaluateFunctionViewData |
    LiveTracesViewData

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
        isRawTracesViewData,
        isTrackAnimationStaticData,
        isSortingLayoutViewData,
        isCrossCorrelogramsViewData,
        isUnitSimilarityMatrixViewData,
        isSortingCurationViewData,
        isUnitLocationsViewData,
        isMarkdownViewData,
        isUnitMetricsGraphViewData,
        isTiledImageData,
        isSortingCuration2ViewData,
        isSortingSelectionViewData,
        isSpikeLocationsViewData,
        isConfusionMatrixViewData,
        isLiveEvaluateFunctionViewData,
        isLiveTracesViewData
    ])(x)
}