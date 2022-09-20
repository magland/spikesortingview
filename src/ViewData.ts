import { isTiledImageData, TiledImageData } from 'libraries/component-tiled-image'
import { isOneOf } from '@figurl/core-utils'
import { AnnotationsViewData, isAnnotationsViewData } from '@figurl/timeseries-views'
import { CompositeViewData, isCompositeViewData } from "libraries/view-composite"
import { ConsoleViewData, isConsoleViewData } from "libraries/view-console"
import { EpochsViewData, isEpochsViewData } from "libraries/view-epochs"
import { ExperimentalSelector1ViewData, isExperimentalSelector1ViewData } from 'libraries/view-experimental-selector-1'
import { isLiveEvaluateFunctionViewData, LiveEvaluateFunctionViewData } from 'libraries/view-live-evaluate-function'
import { isLiveTracesViewData, LiveTracesViewData } from '@figurl/timeseries-views'
import { isMountainLayoutViewData, MountainLayoutViewData } from "libraries/view-mountain-layout"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "libraries/view-multi-timeseries"
import { isLivePositionPdfPlotViewData, isPositionPdfPlotViewData, LivePositionPdfPlotViewData, PositionPdfPlotViewData } from "libraries/view-position-pdf-plot"
import { isPositionPlotViewData, PositionPlotViewData } from "libraries/view-position-plot"
import { isSortingCurationViewData, SortingCurationViewData } from 'libraries/view-sorting-curation'
import { isSortingLayoutViewData, SortingLayoutViewData } from 'libraries/view-sorting-layout'
import { isSortingSelectionViewData, SortingSelectionViewData } from 'libraries/view-sorting-selection'
import { isSummaryViewData, SummaryViewData } from "libraries/view-summary"
import { isTest1ViewData, Test1ViewData } from 'libraries/view-test-1'

export type ViewData =
    CompositeViewData |
    MultiTimeseriesViewData |
    SummaryViewData |
    MountainLayoutViewData |
    PositionPlotViewData |
    PositionPdfPlotViewData |
    LivePositionPdfPlotViewData |
    EpochsViewData |
    ConsoleViewData |
    SortingLayoutViewData |
    SortingCurationViewData |
    TiledImageData |
    SortingSelectionViewData |
    LiveEvaluateFunctionViewData |
    LiveTracesViewData |
    ExperimentalSelector1ViewData |
    Test1ViewData |
    AnnotationsViewData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isCompositeViewData,
        isMultiTimeseriesViewData,
        isSummaryViewData,
        isMountainLayoutViewData,
        isPositionPlotViewData,
        isPositionPdfPlotViewData,
        isLivePositionPdfPlotViewData,
        isEpochsViewData,
        isConsoleViewData,
        isSortingLayoutViewData,
        isSortingCurationViewData,
        isTiledImageData,
        isSortingSelectionViewData,
        isLiveEvaluateFunctionViewData,
        isLiveTracesViewData,
        isExperimentalSelector1ViewData,
        isTest1ViewData,
        isAnnotationsViewData
    ])(x)
}