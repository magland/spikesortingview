import SortingCurationAction from 'contexts/SortingCurationAction';
import SortingCurationContext, { sortingCurationReducer } from 'contexts/SortingCurationContext';
import { initiateTask, useFeedReducer, useSignedIn } from 'figurl';
import getMutable from 'figurl/getMutable';
import MountainWorkspace from 'MountainWorkspace/MountainWorkspace';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { MountainLayoutViewData } from './MountainLayoutViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: MountainLayoutViewData
    hideCurationControl?: boolean
    width: number
    height: number
}

const MountainLayoutView: FunctionComponent<Props> = ({data, hideCurationControl, width, height}) => {
    const viewPlugins = useMemo(() => (
        data.views.map((view, ii) => ({
            name: `view-${ii}`,
            label: view.label,
            component: ViewWrapper,
            singleton: true,
            additionalProps: {figureDataSha1: view.figureDataSha1, figureDataUri: view.figureDataUri}
        }))
    ), [data.views])
    const controlViewPlugins = useMemo(() => (
        (data.controls || []).map((view, ii) => ({
            name: `control-${ii}`,
            label: view.label,
            component: ViewWrapper,
            singleton: true,
            additionalProps: {figureDataSha1: view.figureDataSha1, figureDataUri: view.figureDataUri}
        }))
    ), [data.controls])
    const viewProps = useMemo(() => ({}), [])
    const content = (
        <MountainWorkspace
            viewPlugins={viewPlugins}
            viewProps={viewProps}
            hideCurationControl={hideCurationControl}
            controlViewPlugins={controlViewPlugins}
            width={width}
            height={height}
        />
    )
    // const [sortingCuration, sortingCurationDispatch] = useReducer(sortingCurationReducer, {})
    const {state: sortingCuration} = useFeedReducer({feedUri: data.sortingCurationUri}, sortingCurationReducer, {}, {actionField: false})
    const {userId, googleIdToken} = useSignedIn()
    const sortingCurationDispatch = useCallback((a: SortingCurationAction) => {
        if (!data.sortingCurationUri) return
        initiateTask({
          taskName: 'spikesortingview.sorting_curation_action.1',
          taskInput: {
            sorting_curation_uri: data.sortingCurationUri,
            action: a,
            user_id: userId,
            google_id_token: googleIdToken
          },
          taskType: 'action',
          onStatusChanged: () => {}
        })
        // this might be how we can do offline-first curation (get curationSubfeed from useSubfeedReducerS)
        // curationSubfeed.appendOfflineMessages([a]) // this would need to be implemented
    }, [data.sortingCurationUri, userId, googleIdToken])
    const [canCurate, setCanCurate] = useState<boolean>(false)
    useEffect(() => {
        setCanCurate(false)
        if (!data.sortingCurationUri) {
            return
        }
        if ((!userId) || (!googleIdToken)) {
            return
        }
        ;(async () => {
            const a = await getMutable(`@sortingview/@sortingCurationAuthorizedUsers/${feedIdForUri(data.sortingCurationUri || '')}`)
            if (!a) return
            const authorizedUsers = JSON.parse(a)
            if (authorizedUsers.includes(userId)) {
                setCanCurate(true)
            }
        })()
    }, [userId, googleIdToken, data.sortingCurationUri])
    if (data.sortingCurationUri) {
        return (
            <SortingCurationContext.Provider value={{sortingCuration, sortingCurationDispatch: canCurate ? sortingCurationDispatch : undefined}}>
                {content}
            </SortingCurationContext.Provider>
        )
    }
    else return content
}

export const feedIdForUri = (uri: string) => {
    return uri.split('/')[2] || 'invalid-feed-uri'
}

export default MountainLayoutView