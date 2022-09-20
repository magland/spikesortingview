import { isTiledImageData, TiledImageData } from 'libraries/component-tiled-image'
import { isOneOf } from '@figurl/core-utils'
import { AnnotationsViewData, isAnnotationsViewData } from '@figurl/timeseries-views'
import { AutocorrelogramsViewData, isAutocorrelogramsViewData } from "@figurl/spike-sorting-views"
import { AverageWaveformsViewData, isAverageWaveformsViewData } from "@figurl/spike-sorting-views"
import { CompositeViewData, isCompositeViewData } from "libraries/view-composite"
import { ConfusionMatrixViewData, isConfusionMatrixViewData } from '@figurl/spike-sorting-views'
import { ConsoleViewData, isConsoleViewData } from "libraries/view-console"
import { CrossCorrelogramsViewData, isCrossCorrelogramsViewData } from '@figurl/spike-sorting-views'
import { ElectrodeGeometryViewData, isElectrodeGeometryViewData } from "@figurl/spike-sorting-views"
import { EpochsViewData, isEpochsViewData } from "libraries/view-epochs"
import { ExperimentalSelector1ViewData, isExperimentalSelector1ViewData } from 'libraries/view-experimental-selector-1'
import { isLiveCrossCorrelogramsViewData, LiveCrossCorrelogramsViewData } from "@figurl/spike-sorting-views"
import { isLiveEvaluateFunctionViewData, LiveEvaluateFunctionViewData } from 'libraries/view-live-evaluate-function'
import { isLiveTracesViewData, LiveTracesViewData } from '@figurl/timeseries-views'
import { isMainLayoutViewData, MainLayoutViewData } from '@figurl/core-views'
import { isMarkdownViewData, MarkdownViewData } from '@figurl/core-views'
import { isMountainLayoutViewData, MountainLayoutViewData } from "libraries/view-mountain-layout"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "libraries/view-multi-timeseries"
import { isLivePositionPdfPlotViewData, isPositionPdfPlotViewData, LivePositionPdfPlotViewData, PositionPdfPlotViewData } from "libraries/view-position-pdf-plot"
import { isPositionPlotViewData, PositionPlotViewData } from "libraries/view-position-plot"
import { isRasterPlotViewData, RasterPlotViewData } from "@figurl/spike-sorting-views"
import { isRawTracesViewData, RawTracesViewData } from "@figurl/timeseries-views"
import { isSortingCurationViewData, SortingCurationViewData } from 'libraries/view-sorting-curation'
import { isSortingCuration2ViewData, SortingCuration2ViewData } from '@figurl/spike-sorting-views'
import { isSortingLayoutViewData, SortingLayoutViewData } from 'libraries/view-sorting-layout'
import { isSortingSelectionViewData, SortingSelectionViewData } from 'libraries/view-sorting-selection'
import { isSpikeAmplitudesViewData, SpikeAmplitudesViewData } from "@figurl/spike-sorting-views"
import { isSpikeLocationsViewData, SpikeLocationsViewData } from '@figurl/spike-sorting-views'
import { isSummaryViewData, SummaryViewData } from "libraries/view-summary"
import { isTest1ViewData, Test1ViewData } from 'libraries/view-test-1'
import { isTimeseriesGraphViewData, TimeseriesGraphViewData } from '@figurl/timeseries-views'
import { isTrackAnimationStaticData, TrackAnimationStaticData } from "libraries/view-track-position-animation"
import { isUnitLocationsViewData, UnitLocationsViewData } from '@figurl/spike-sorting-views'
import { isUnitMetricsGraphViewData, UnitMetricsGraphViewData } from '@figurl/spike-sorting-views'
import { isUnitSimilarityMatrixViewData, UnitSimilarityMatrixViewData } from '@figurl/spike-sorting-views'
import { isUnitsTableViewData, UnitsTableViewData } from "@figurl/spike-sorting-views"

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