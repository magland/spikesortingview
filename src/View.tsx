import { TiledImageComponent } from 'libraries/component-tiled-image';
import { CompositeView } from 'libraries/view-composite';
import { ConsoleView } from 'libraries/view-console';
import { EpochsView } from 'libraries/view-epochs';
import { ExperimentalSelector1View } from 'libraries/view-experimental-selector-1';
import { MountainLayoutView } from 'libraries/view-mountain-layout';
import { MultiTimeseriesView } from 'libraries/view-multi-timeseries';
import { PositionPdfPlotView } from 'libraries/view-position-pdf-plot';
import { PositionPlotView } from 'libraries/view-position-plot';
import { SortingCurationView } from 'libraries/view-sorting-curation';
import { SortingLayoutView } from 'libraries/view-sorting-layout';
import { SortingSelectionView } from 'libraries/view-sorting-selection';
import { SummaryView } from 'libraries/view-summary';
import { Test1View } from 'libraries/view-test-1';
import { FunctionComponent, useMemo } from 'react';
import { isViewData } from 'ViewData';
import {loadView as loadCoreView} from '@figurl/core-views'
import {loadView as loadTimeseriesView} from '@figurl/timeseries-views'
import {loadView as loadSpikeSortingView} from '@figurl/spike-sorting-views'
import {loadView as loadFranklabView} from '@figurl/franklab-views'
import { EphysTracesView } from 'libraries/view-ephys-traces-dev';

export type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

type Props = {
    data: any
    opts: any
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height, opts}) => {
    // It's important to memoize this
    // because validation of data can be slow
    const v = useMemo(() => {
        if (isViewData(data)) {
            if (data.type === 'Composite') {
                return <CompositeView data={data} ViewComponent={View} width={width} height={height} />
            }
            else if (data.type === 'MultiTimeseries') {
                return <MultiTimeseriesView data={data} ViewComponent={View} width={width} height={height} />
            }
            else if (data.type === 'Summary') {
                return <SummaryView data={data} width={width} height={height} />
            }
            else if (data.type === 'MountainLayout') {
                return <MountainLayoutView data={data} ViewComponent={View} width={width} height={height} />
            }
            else if (data.type === 'PositionPlot') {
                return <PositionPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
            }
            else if (data.type === 'PositionPdfPlot') {
                return <PositionPdfPlotView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
            }
            else if (data.type === 'Epochs') {
                return <EpochsView data={data} timeseriesLayoutOpts={opts} width={width} height={height} />
            }
            else if (data.type === 'Console') {
                return <ConsoleView data={data} width={width} height={height} />
            }
            else if (data.type === 'SortingLayout') {
                return <SortingLayoutView data={data} ViewComponent={View} width={width} height={height} />
            }
            else if (data.type === 'SortingCuration') {
                return <SortingCurationView data={data} width={width} height={height} />
            }
            else if (data.type === 'TiledImage') {
                return <TiledImageComponent data={data} width={width} height={height} />
            }
            else if (data.type === 'SortingSelection') {
                return <SortingSelectionView data={data} width={width} height={height} />
            }
            else if (data.type === 'ExperimentalSelector1') {
                return <ExperimentalSelector1View data={data} width={width} height={height} />
            }
            else if (data.type === 'Test1') {
                return <Test1View data={data} width={width} height={height} />
            }
            else if (data.type === 'EphysTraces') {
                return <EphysTracesView data={data} width={width} height={height} />
            }
        }
        else {
            const viewLoaders = [loadCoreView, loadTimeseriesView, loadSpikeSortingView, loadFranklabView]
            for (let loadView of viewLoaders) {
                const v = loadView({data, width, height, opts, ViewComponent: View})
                if (v) return v
            }
            return undefined
        }
    }, [data, height, width, opts])
    
    if (v) return v

    console.warn('Unsupported view data', data)
    return <div>Unsupported view data: {data['type']}</div>
}

export default View