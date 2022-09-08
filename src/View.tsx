import { AutocorrelogramsView } from 'libraries/view-autocorrelograms';
import { AverageWaveformsView } from 'libraries/view-average-waveforms';
import { ConfusionMatrixView } from 'libraries/view-confusion-matrix';
import { CrossCorrelogramsView } from 'libraries/view-cross-correlograms';
import { ElectrodeGeometryView } from 'libraries/view-electrode-geometry';
import { MainLayoutView } from 'libraries/view-main-layout';
import { MarkdownView } from 'libraries/view-markdown';
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
import CompositeView from 'views/Composite/CompositeView';
import ConsoleView from 'views/Console/ConsoleView';
import EpochsView from 'views/Epochs/EpochsView';
import LiveCrossCorrelogramsView from 'views/LiveCrossCorrelograms/LiveCrossCorrelogramsView';
import LiveEvaluateFunctionView from 'views/LiveEvaluateFunction/LiveEvaluateFunctionView';
import LivePositionPdfPlotView from 'views/LivePositionPdfPlot/LivePositionPdfPlotView';
import LiveTracesView from 'views/LiveTraces/LiveTracesView';
import MountainLayoutView from 'views/MountainLayout/MountainLayoutView';
import MultiTimeseriesView from 'views/MultiTimeseries/MultiTimeseriesView';
import PositionPdfPlotView from 'views/PositionPdfPlot/PositionPdfPlotView';
import PositionPlotView from 'views/PositionPlot/PositionPlotView';
import RasterPlotView from 'views/RasterPlot/RasterPlotView';
import RawTracesView from 'views/RawTraces/RawTracesView';
import SortingLayoutView from 'views/SortingLayout/SortingLayoutView';
import SpikeAmplitudesView from 'views/SpikeAmplitudes/SpikeAmplitudesView';
import { TiledImageComponent } from 'views/TiledImageComponent/TiledImageComponent';
import TrackPositionAnimationView from 'views/TrackPositionAnimation/TrackPositionAnimationView';
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
        return <SortingLayoutView data={data} width={width} height={height} />
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
    else {
        console.warn('Unsupported view data', data)
        return <div>Unsupported view data: {data['type']}</div>
    }
}

export default View