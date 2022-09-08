import { isOneOf } from 'figurl/viewInterface/validateObject'
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "libraries/view-autocorrelograms"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "libraries/view-average-waveforms"
import { ConfusionMatrixViewData, isConfusionMatrixViewData } from 'libraries/view-confusion-matrix'
import { CrossCorrelogramsViewData, isCrossCorrelogramsViewData } from 'libraries/view-cross-correlograms'
import { ElectrodeGeometryViewData, isElectrodeGeometryViewData } from "libraries/view-electrode-geometry"
import { isMarkdownViewData, MarkdownViewData } from 'libraries/view-markdown'
import { isSortingCurationViewData, SortingCurationViewData } from 'libraries/view-sorting-curation'
import { isSortingCuration2ViewData, SortingCuration2ViewData } from 'libraries/view-sorting-curation-2'
import { isSpikeLocationsViewData, SpikeLocationsViewData } from 'libraries/view-spike-locations'
import { isSummaryViewData, SummaryViewData } from "libraries/view-summary"
import { isUnitLocationsViewData, UnitLocationsViewData } from 'libraries/view-unit-locations'
import { isUnitMetricsGraphViewData, UnitMetricsGraphViewData } from 'libraries/view-unit-metrics-graph'
import { isUnitSimilarityMatrixViewData, UnitSimilarityMatrixViewData } from 'libraries/view-unit-similarity-matrix'
import { isUnitsTableViewData, UnitsTableViewData } from "libraries/view-units-table"
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
import { isSortingSelectionViewData, SortingSelectionViewData } from 'libraries/view-sorting-selection'
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "views/SpikeAmplitudes/SpikeAmplitudesViewData"
import { isTiledImageData, TiledImageData } from 'views/TiledImageComponent/TiledImageComponent'
import { isTrackAnimationStaticData, TrackAnimationStaticData } from "views/TrackPositionAnimation/TrackPositionAnimationTypes"
import { isMainLayoutViewData, MainLayoutViewData } from 'libraries/view-main-layout'

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
    LiveTracesViewData |
    MainLayoutViewData

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
        isLiveTracesViewData,
        isMainLayoutViewData
    ])(x)
}