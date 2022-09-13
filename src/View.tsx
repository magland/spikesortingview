import { AutocorrelogramsView } from 'libraries/view-autocorrelograms';
import { AverageWaveformsView } from 'libraries/view-average-waveforms';
import { ConfusionMatrixView } from 'libraries/view-confusion-matrix';
import { CrossCorrelogramsView } from 'libraries/view-cross-correlograms';
import { ElectrodeGeometryView } from 'libraries/view-electrode-geometry';
import { MainLayoutView } from 'libraries/view-main-layout';
import { MarkdownView } from 'libraries/view-markdown';
import { RasterPlotView } from 'libraries/view-raster-plot';
import { SortingCurationView } from 'libraries/view-sorting-curation';
import { SortingCuration2View } from 'libraries/view-sorting-curation-2';
import { SortingSelectionView } from 'libraries/view-sorting-selection';
import { SpikeLocationsView } from 'libraries/view-spike-locations';
import { SummaryView } from 'libraries/view-summary';
import { UnitLocationsView } from 'libraries/view-unit-locations';
import { UnitMetricsGraphView } from 'libraries/view-unit-metrics-graph';
import { UnitSimilarityMatrixView } from 'libraries/view-unit-similarity-matrix';
import { UnitsTableView } from 'libraries/view-units-table';
import { FunctionComponent } from 'react';
import { CompositeView } from 'libraries/view-composite';
import { ConsoleView } from 'libraries/view-console';
import { EpochsView } from 'libraries/view-epochs';
import { LiveCrossCorrelogramsView } from 'libraries/view-live-cross-correlograms';
import { LiveEvaluateFunctionView } from 'libraries/view-live-evaluate-function';
import { LivePositionPdfPlotView } from 'libraries/view-position-pdf-plot';
import { LiveTracesView } from 'libraries/view-live-traces';
import { MountainLayoutView } from 'libraries/view-mountain-layout';
import { MultiTimeseriesView } from 'libraries/view-multi-timeseries';
import { PositionPdfPlotView } from 'libraries/view-position-pdf-plot';
import { PositionPlotView } from 'libraries/view-position-plot';
import { RawTracesView } from 'libraries/view-raw-traces';
import { SortingLayoutView } from 'libraries/view-sorting-layout';
import { SpikeAmplitudesView } from 'libraries/view-spike-amplitudes';
import { TiledImageComponent } from 'libraries/component-tiled-image';
import { TrackPositionAnimationView } from 'libraries/view-track-position-animation';
import { ViewData } from './ViewData';
import { ExperimentalSelector1View } from 'libraries/view-experimental-selector-1';
import { TimeseriesGraphView } from 'libraries/view-timeseries-graph';
import { Test1View } from 'libraries/view-test-1';

export type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

type Props = {
    data: ViewData
    opts: any
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height, opts}) => {
    if (data.type === 'Autocorrelograms') {
        return <AutocorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'RasterPlot') {
        return <RasterPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'Composite') {
        return <CompositeView data={data} ViewComponent={View} width={width} height={height} />
    }
    else if (data.type === 'MultiTimeseries') {
        return <MultiTimeseriesView data={data} ViewComponent={View} width={width} height={height} />
    }
    else if (data.type === 'AverageWaveforms') {
        return <AverageWaveformsView data={data} width={width} height={height} />
    }
    else if (data.type === 'UnitsTable') {
        return <UnitsTableView data={data} width={width} height={height} />
    }
    else if (data.type === 'Summary') {
        return <SummaryView data={data} width={width} height={height} />
    }
    else if (data.type === 'MountainLayout') {
        return <MountainLayoutView data={data} ViewComponent={View} width={width} height={height} />
    }
    else if (data.type === 'SpikeAmplitudes') {
        return <SpikeAmplitudesView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'ElectrodeGeometry') {
        return <ElectrodeGeometryView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPlot') {
        return <PositionPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'LiveCrossCorrelograms') {
        return <LiveCrossCorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPdfPlot') {
        return <PositionPdfPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'LivePositionPdfPlot') {
        return <LivePositionPdfPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'Epochs') {
        return <EpochsView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'Console') {
        return <ConsoleView data={data} width={width} height={height} />
    }
    else if (data.type === 'RawTraces') {
        return <RawTracesView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
    }
    else if (data.type === 'TrackAnimation') {
        return <TrackPositionAnimationView data={data} width={width} height={height} />
    }
    else if (data.type === 'SortingLayout') {
        return <SortingLayoutView data={data} ViewComponent={View} width={width} height={height} />
    }
    else if (data.type === 'CrossCorrelograms') {
        return <CrossCorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'UnitSimilarityMatrix') {
        return <UnitSimilarityMatrixView data={data} width={width} height={height} />
    }
    else if (data.type === 'SortingCuration') {
        return <SortingCurationView data={data} width={width} height={height} />
    }
    else if (data.type === 'UnitLocations') {
        return <UnitLocationsView data={data} width={width} height={height} />
    }
    else if (data.type === 'Markdown') {
        return <MarkdownView data={data} width={width} height={height} />
    }
    else if (data.type === 'UnitMetricsGraph') {
        return <UnitMetricsGraphView data={data} width={width} height={height} />
    }
    else if (data.type === 'TiledImage') {
        return <TiledImageComponent data={data} width={width} height={height} />
    }
    else if (data.type === 'SortingCuration2') {
        return <SortingCuration2View data={data} width={width} height={height} />
    }
    else if (data.type === 'SortingSelection') {
        return <SortingSelectionView data={data} width={width} height={height} />
    }
    else if (data.type === 'SpikeLocations') {
        return <SpikeLocationsView data={data} width={width} height={height} />
    }
    else if (data.type === 'ConfusionMatrix') {
        return <ConfusionMatrixView data={data} width={width} height={height} />
    }
    else if (data.type === 'LiveEvaluateFunction') {
        return <LiveEvaluateFunctionView data={data} width={width} height={height} />
    }
    else if (data.type === 'LiveTraces') {
        return <LiveTracesView data={data} width={width} height={height} />
    }
    else if (data.type === 'MainLayout') {
        return <MainLayoutView data={data} ViewComponent={View} width={width} height={height} />
    }
    else if (data.type === 'ExperimentalSelector1') {
        return <ExperimentalSelector1View data={data} width={width} height={height} />
    }
    else if (data.type === 'TimeseriesGraph') {
        return <TimeseriesGraphView data={data} width={width} height={height} />
    }
    else if (data.type === 'Test1') {
        return <Test1View data={data} width={width} height={height} />
    }
    else {
        console.warn('Unsupported view data', data)
        return <div>Unsupported view data: {data['type']}</div>
    }
}

export default View