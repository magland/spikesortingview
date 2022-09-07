import { AutocorrelogramsView } from 'libraries/Autocorrelograms';
import { AverageWaveformsView } from 'libraries/AverageWaveforms';
import { ConfusionMatrixView } from 'libraries/ConfusionMatrix';
import { CrossCorrelogramsView } from 'libraries/CrossCorrelograms';
import { ElectrodeGeometryView } from 'libraries/ElectrodeGeometry';
import { MarkdownView } from 'libraries/Markdown';
import { SortingCurationView } from 'libraries/SortingCuration';
import { SortingCuration2View } from 'libraries/SortingCuration2';
import { SummaryView } from 'libraries/Summary';
import { UnitLocationsView } from 'libraries/UnitLocations';
import { UnitMetricsGraphView } from 'libraries/UnitMetricsGraph';
import { UnitSimilarityMatrixView } from 'libraries/UnitSimilarityMatrix';
import { UnitsTableView } from 'libraries/UnitsTable';
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
import SortingSelectionView from 'views/SortingSelection/SortingSelectionView';
import SpikeAmplitudesView from 'views/SpikeAmplitudes/SpikeAmplitudesView';
import SpikeLocationsView from 'views/SpikeLocations/SpikeLocationsView';
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
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height, timeseriesLayoutOpts}) => {
    if (data.type === 'Autocorrelograms') {
        return <AutocorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'RasterPlot') {
        return <RasterPlotView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'Composite') {
        return <CompositeView data={data} width={width} height={height} />
    }
    else if (data.type === 'MultiTimeseries') {
        return <MultiTimeseriesView data={data} width={width} height={height} />
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
        return <MountainLayoutView data={data} width={width} height={height} />
    }
    else if (data.type === 'SpikeAmplitudes') {
        return <SpikeAmplitudesView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'ElectrodeGeometry') {
        return <ElectrodeGeometryView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPlot') {
        return <PositionPlotView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'LiveCrossCorrelograms') {
        return <LiveCrossCorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPdfPlot') {
        return <PositionPdfPlotView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'LivePositionPdfPlot') {
        return <LivePositionPdfPlotView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'Epochs') {
        return <EpochsView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
    }
    else if (data.type === 'Console') {
        return <ConsoleView data={data} width={width} height={height} />
    }
    else if (data.type === 'RawTraces') {
        return <RawTracesView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
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
    else {
        console.warn('Unsupported view data', data)
        return <div>Unsupported view data: {data['type']}</div>
    }
}

export default View