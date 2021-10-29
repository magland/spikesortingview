import MountainWorkspace from 'MountainWorkspace/MountainWorkspace';
import React, { FunctionComponent, useMemo } from 'react';
import { MountainLayoutViewData } from './MountainLayoutViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: MountainLayoutViewData
    width: number
    height: number
}

const MountainLayoutView: FunctionComponent<Props> = ({data, width, height}) => {
    const viewPlugins = useMemo(() => (
        data.views.map((view, ii) => ({
            name: `view-${ii}`,
            label: view.label,
            component: ViewWrapper,
            singleton: true,
            additionalProps: {figureDataSha1: view.figureDataSha1}
        }))
    ), [data.views])
    const viewProps = useMemo(() => ({}), [])
    return (
        <MountainWorkspace
            viewPlugins={viewPlugins}
            viewProps={viewProps}
            width={width}
            height={height}
        />
    )
}

export default MountainLayoutView