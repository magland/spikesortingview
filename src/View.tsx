import React, { FunctionComponent } from 'react';
import AutocorrelogramsView from 'views/Autocorrelograms/AutocorrelogramsView';
import AverageWaveformsView from 'views/AverageWaveforms/AverageWaveformsView';
import CompositeView from 'views/Composite/CompositeView';
import RasterPlotView from 'views/RasterPlot/RasterPlotView';
import UnitsTableView from 'views/UnitsTable/UnitsTableView'
import { ViewData } from './ViewData';

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
    else {
        return <div>Unexpected view data</div>
    }
}

export default View