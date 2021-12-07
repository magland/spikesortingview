import React, { FunctionComponent } from 'react';
import AutocorrelogramsView from 'views/Autocorrelograms/AutocorrelogramsView';
import AverageWaveformsView from 'views/AverageWaveforms/AverageWaveformsView';
import CompositeView from 'views/Composite/CompositeView';
import ElectrodeGeometryView from 'views/ElectrodeGeometry/ElectrodeGeometryView';
import LiveCrossCorrelogramsView from 'views/LiveCrossCorrelograms/LiveCrossCorrelogramsView';
import MountainLayoutView from 'views/MountainLayout/MountainLayoutView';
import PositionPlotView from 'views/PositionPlot/PositionPlotView';
import PositionPdfPlotView from 'views/PositionPdfPlot/PositionPdfPlotView';
import RasterPlotView from 'views/RasterPlot/RasterPlotView';
import SpikeAmplitudesView from 'views/SpikeAmplitudes/SpikeAmplitudesView';
import SummaryView from 'views/Summary/SummaryView';
import UnitsTableView from 'views/UnitsTable/UnitsTableView'
import { ViewData } from './ViewData';
import LivePositionPdfPlotView from 'views/LivePositionPdfPlot/LivePositionPdfPlotView';

type Props = {
    data: ViewData
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height}) => {
    if (data.type === 'Autocorrelograms') {
        return <AutocorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'RasterPlot') {
        return <RasterPlotView data={data} width={width} height={height} />
    }
    else if (data.type === 'Composite') {
        return <CompositeView data={data} width={width} height={height} />
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
        return <SpikeAmplitudesView data={data} width={width} height={height} />
    }
    else if (data.type === 'ElectrodeGeometry') {
        return <ElectrodeGeometryView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPlot') {
        return <PositionPlotView data={data} width={width} height={height} />
    }
    else if (data.type === 'LiveCrossCorrelograms') {
        return <LiveCrossCorrelogramsView data={data} width={width} height={height} />
    }
    else if (data.type === 'PositionPdfPlot') {
        return <PositionPdfPlotView data={data} width={width} height={height} />
    }
    else if (data.type === 'LivePositionPdfPlot') {
        return <LivePositionPdfPlotView data={data} width={width} height={height} />
    }
    else {
        return <div>Unexpected view data</div>
    }
}

export default View