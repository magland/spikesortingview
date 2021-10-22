import React, { FunctionComponent } from 'react';
import AutocorrelogramsView from 'views/Autocorrelograms/AutocorrelogramsView';
import { isAutocorrelogramsViewData } from 'views/Autocorrelograms/AutocorrelogramsViewData';
import RasterPlotView from 'views/RasterPlot/RasterPlotView';
import { isRasterPlotViewData } from 'views/RasterPlot/RasterPlotViewData';
import { ViewData } from './ViewData';

type Props = {
    data: ViewData
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height}) => {
    if (isAutocorrelogramsViewData(data)) {
        return <AutocorrelogramsView data={data} width={width} height={height} />
    }
    else if (isRasterPlotViewData(data)) {
        return <RasterPlotView data={data} width={width} height={height} />
    }
    else {
        return <div>Unexpected view data</div>
    }
}

export default View