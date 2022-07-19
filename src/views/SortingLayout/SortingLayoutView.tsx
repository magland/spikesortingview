import UnitMetricSelectionContext, { unitMetricSelectionReducer } from 'contexts/UnitMetricSelectionContext';
import SortingCurationAction from 'contexts/SortingCurationAction';
import SortingCurationContext, { sortingCurationReducer } from 'contexts/SortingCurationContext';
import { initiateTask, useFeedReducer, useSignedIn } from 'figurl';
import getMutable from 'figurl/getMutable';
import { FunctionComponent, useCallback, useEffect, useReducer, useState } from 'react';
import LayoutItemView from './LayoutItemView';
import { SortingLayoutViewData } from './SortingLayoutViewData';

type Props = {
    data: SortingLayoutViewData
    width: number
    height: number
}

const SortingLayoutView: FunctionComponent<Props> = ({data, width, height}) => {
    const {layout, views} = data

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
            const a = await getMutable(`sortingview/sortingCurationAuthorizedUsers/${data.sortingCurationUri}`)
            if (!a) return
            const authorizedUsers = JSON.parse(a)
            if (authorizedUsers.includes(userId)) {
                setCanCurate(true)
            }
        })()
    }, [userId, googleIdToken, data.sortingCurationUri])

    const [unitMetricSelection, unitMetricSelectionDispatch] = useReducer(unitMetricSelectionReducer, {})

    const content = (
        <UnitMetricSelectionContext.Provider value={{unitMetricSelection, unitMetricSelectionDispatch}}>
            <LayoutItemView
                layoutItem={layout}
                views={views}
                width={width}
                height={height}
            />
        </UnitMetricSelectionContext.Provider>
    )

    if (data.sortingCurationUri) {
        return (
            <SortingCurationContext.Provider value={{sortingCuration, sortingCurationDispatch: canCurate ? sortingCurationDispatch : undefined}}>
                {content}
            </SortingCurationContext.Provider>
        )
    }
    else return content
}

export default SortingLayoutView