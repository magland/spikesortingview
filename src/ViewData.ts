import { isOneOf } from 'libraries/util-validate-object'
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
import { CompositeViewData, isCompositeViewData } from "libraries/view-composite"
import { ConsoleViewData, isConsoleViewData } from "libraries/view-console"
import { EpochsViewData, isEpochsViewData } from "libraries/view-epochs"
import { isLiveCrossCorrelogramsViewData, LiveCrossCorrelogramsViewData } from "libraries/view-live-cross-correlograms"
import { isLiveEvaluateFunctionViewData, LiveEvaluateFunctionViewData } from 'libraries/view-live-evaluate-function'
import { isLivePositionPdfPlotViewData, LivePositionPdfPlotViewData } from "libraries/view-position-pdf-plot"
import { isLiveTracesViewData, LiveTracesViewData } from 'libraries/view-live-traces'
import { isMountainLayoutViewData, MountainLayoutViewData } from "libraries/view-mountain-layout"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "libraries/view-multi-timeseries"
import { isPositionPdfPlotViewData, PositionPdfPlotViewData } from "libraries/view-position-pdf-plot"
import { isPositionPlotViewData, PositionPlotViewData } from "libraries/view-position-plot"
import { isRasterPlotViewData, RasterPlotViewData } from "libraries/view-raster-plot"
import { isRawTracesViewData, RawTracesViewData } from "libraries/view-raw-traces"
import { isSortingLayoutViewData, SortingLayoutViewData } from 'libraries/view-sorting-layout'
import { isSortingSelectionViewData, SortingSelectionViewData } from 'libraries/view-sorting-selection'
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "libraries/view-spike-amplitudes"
import { isTiledImageData, TiledImageData } from 'libraries/component-tiled-image'
import { isTrackAnimationStaticData, TrackAnimationStaticData } from "libraries/view-track-position-animation"
import { isMainLayoutViewData, MainLayoutViewData } from 'libraries/view-main-layout'
import { ExperimentalSelector1ViewData } from 'libraries/view-experimental-selector-1/ExperimentalSelector1ViewData'
import { isExperimentalSelector1ViewData } from 'libraries/view-experimental-selector-1'
import { isTimeseriesGraphViewData, TimeseriesGraphViewData } from 'libraries/view-timeseries-graph'
import { Test1ViewData } from 'libraries/view-test-1/Test1ViewData'
import { isTest1ViewData } from 'libraries/view-test-1'
import { AnnotationsViewData, isAnnotationsViewData } from 'libraries/view-annotations'

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
    MainLayoutViewData |
    ExperimentalSelector1ViewData |
    TimeseriesGraphViewData |
    Test1ViewData |
    AnnotationsViewData

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
        isMainLayoutViewData,
        isExperimentalSelector1ViewData,
        isTimeseriesGraphViewData,
        isTest1ViewData,
        isAnnotationsViewData
    ])(x)
}