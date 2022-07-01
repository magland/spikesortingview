import React, { FunctionComponent } from 'react';
import AutocorrelogramsView from 'views/Autocorrelograms/AutocorrelogramsView';
import AverageWaveformsView from 'views/AverageWaveforms/AverageWaveformsView';
import CompositeView from 'views/Composite/CompositeView';
import ConsoleView from 'views/Console/ConsoleView';
import CrossCorrelogramsView from 'views/CrossCorrelograms/CrossCorrelogramsView';
import ElectrodeGeometryView from 'views/ElectrodeGeometry/ElectrodeGeometryView';
import EpochsView from 'views/Epochs/EpochsView';
import LiveCrossCorrelogramsView from 'views/LiveCrossCorrelograms/LiveCrossCorrelogramsView';
import LivePositionPdfPlotView from 'views/LivePositionPdfPlot/LivePositionPdfPlotView';
import MountainLayoutView from 'views/MountainLayout/MountainLayoutView';
import MultiTimeseriesView from 'views/MultiTimeseries/MultiTimeseriesView';
import PositionPdfPlotView from 'views/PositionPdfPlot/PositionPdfPlotView';
import PositionPlotView from 'views/PositionPlot/PositionPlotView';
import RasterPlotView from 'views/RasterPlot/RasterPlotView';
import RawTracesPlotView from 'views/RawTracesPlot/RawTracesPlotView';
import SortingLayoutView from 'views/SortingLayout/SortingLayoutView';
import SpikeAmplitudesView from 'views/SpikeAmplitudes/SpikeAmplitudesView';
import SummaryView from 'views/Summary/SummaryView';
import TrackPositionAnimationView from 'views/TrackPositionAnimation/TrackPositionAnimationView';
import UnitSimilarityMatrixView from 'views/UnitSimilarityMatrix/UnitSimilarityMatrixView';
import UnitsTableView from 'views/UnitsTable/UnitsTableView';
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
    else if (data.type === 'RawTracesPlot') {
        return <RawTracesPlotView data={data} timeseriesLayoutOpts={timeseriesLayoutOpts} width={width} height={height} />
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
    else {
        console.warn('Unsupported view data', data)
        return <div>Unsupported view data: {data['type']}</div>
    }
}

export default View