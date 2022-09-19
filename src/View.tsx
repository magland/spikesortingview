import { TiledImageComponent } from 'libraries/component-tiled-image';
import { AnnotationsView } from 'libraries/view-annotations';
import { AutocorrelogramsView } from '@figurl/spike-sorting-views';
import { AverageWaveformsView } from 'libraries/view-average-waveforms';
import { CompositeView } from 'libraries/view-composite';
import { ConfusionMatrixView } from 'libraries/view-confusion-matrix';
import { ConsoleView } from 'libraries/view-console';
import { CrossCorrelogramsView } from '@figurl/spike-sorting-views';
import { ElectrodeGeometryView } from 'libraries/view-electrode-geometry';
import { EpochsView } from 'libraries/view-epochs';
import { ExperimentalSelector1View } from 'libraries/view-experimental-selector-1';
import { LiveCrossCorrelogramsView } from '@figurl/spike-sorting-views';
import { LiveEvaluateFunctionView } from 'libraries/view-live-evaluate-function';
import { LiveTracesView } from '@figurl/timeseries-views';
import { MainLayoutView } from '@figurl/core-views';
import { MarkdownView } from 'libraries/view-markdown';
import { MountainLayoutView } from 'libraries/view-mountain-layout';
import { MultiTimeseriesView } from 'libraries/view-multi-timeseries';
import { LivePositionPdfPlotView, PositionPdfPlotView } from 'libraries/view-position-pdf-plot';
import { PositionPlotView } from 'libraries/view-position-plot';
import { RasterPlotView } from 'libraries/view-raster-plot';
import { RawTracesView } from '@figurl/timeseries-views';
import { SortingCurationView } from 'libraries/view-sorting-curation';
import { SortingCuration2View } from 'libraries/view-sorting-curation-2';
import { SortingLayoutView } from 'libraries/view-sorting-layout';
import { SortingSelectionView } from 'libraries/view-sorting-selection';
import { SpikeAmplitudesView } from 'libraries/view-spike-amplitudes';
import { SpikeLocationsView } from 'libraries/view-spike-locations';
import { SummaryView } from 'libraries/view-summary';
import { Test1View } from 'libraries/view-test-1';
import { TimeseriesGraphView } from '@figurl/timeseries-views';
import { TrackPositionAnimationView } from 'libraries/view-track-position-animation';
import { UnitLocationsView } from 'libraries/view-unit-locations';
import { UnitMetricsGraphView } from 'libraries/view-unit-metrics-graph';
import { UnitSimilarityMatrixView } from 'libraries/view-unit-similarity-matrix';
import { UnitsTableView } from 'libraries/view-units-table';
import { FunctionComponent } from 'react';
import { ViewData } from './ViewData';

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
    else if (data.type === 'Annotations') {
        return <AnnotationsView data={data} width={width} height={height} />
    }
    else {
        console.warn('Unsupported view data', data)
        return <div>Unsupported view data: {data['type']}</div>
    }
}

export default View