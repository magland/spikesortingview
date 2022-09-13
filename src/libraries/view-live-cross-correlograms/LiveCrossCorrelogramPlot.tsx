import { TaskStatusView, useCalculationTask } from 'libraries/figurl';
import { CorrelogramPlot } from 'libraries/view-autocorrelograms';
import { FunctionComponent } from 'react';

type Props = {
    width: number
    height: number
    dataUri: string
    unitId1: number
    unitId2: number
}

const LiveCrossCorrelogramPlot: FunctionComponent<Props> = ({width, height, dataUri, unitId1, unitId2}) => {
    const {returnValue, task} = useCalculationTask<{
        binEdgesSec: number[],
        binCounts: number[]
    }>(
        `spikesortingview.fetch_cross_correlogram.2`,
        {
            data_uri: dataUri,
            unit_id1: unitId1,
            unit_id2: unitId2
        }
    )
    if (!returnValue) {
        return (
            <div style={{width, height, position: 'relative'}}>
                <TaskStatusView task={task} label="" />
            </div>
        )
    }
    return (
        <CorrelogramPlot
            binEdgesSec={returnValue.binEdgesSec}
            binCounts={returnValue.binCounts}
            color="grey"
            width={width}
            height={height}
        />
    )
}

export default LiveCrossCorrelogramPlot