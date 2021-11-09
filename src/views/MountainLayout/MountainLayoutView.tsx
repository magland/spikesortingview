import SortingCurationAction from 'contexts/SortingCurationAction';
import SortingCurationContext, { sortingCurationReducer } from 'contexts/SortingCurationContext';
import { initiateTask, useSubfeedReducer } from 'figurl';
import MountainWorkspace from 'MountainWorkspace/MountainWorkspace';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
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
    const content = (
        <MountainWorkspace
            viewPlugins={viewPlugins}
            viewProps={viewProps}
            width={width}
            height={height}
        />
    )
    // const [sortingCuration, sortingCurationDispatch] = useReducer(sortingCurationReducer, {})
    const {state: sortingCuration} = useSubfeedReducer({subfeedUri: data.sortingCurationUri}, sortingCurationReducer, {}, {actionField: false})
    const sortingCurationDispatch = useCallback((a: SortingCurationAction) => {
        if (!data.sortingCurationUri) return
        initiateTask({
          functionId: 'spikesortingview.sorting_curation_action.1',
          kwargs: {
            sorting_curation_uri: data.sortingCurationUri,
            action: a
          },
          functionType: 'action',
          onStatusChanged: () => {}
        })
        // this might be how we can do offline-first curation (get curationSubfeed from useSubfeedReducerS)
        // curationSubfeed.appendOfflineMessages([a]) // this would need to be implemented
      }, [data.sortingCurationUri])
    if (data.sortingCurationUri) {
        return (
            <SortingCurationContext.Provider value={{sortingCuration, sortingCurationDispatch}}>
                {content}
            </SortingCurationContext.Provider>
        )
    }
    else return content
}

export default MountainLayoutView