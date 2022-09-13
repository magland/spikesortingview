import { useMemo, useRef } from 'react'
import useFeed, { parseFeedUri } from './useFeed'
import { JSONStringifyDeterministic } from './viewInterface/kacheryTypes'

const useFeedReducer = <State, Action>(
    a: {feedId?: string, feedUri?: string},
    reducer: (s: State, a: Action) => State,
    initialState: State,
    opts: {actionField: boolean}
) => {
    let {feedId, feedUri} = a
    if (feedUri) {
        // note: this is duplicated code with useFeed
        if (feedId) {
            throw Error('useFeed: Cannot specify both feedUri and feedId')
        }
        const {feedId: fid} = parseFeedUri(feedUri)
        feedId = fid
    }

    const {messages: feedMessages, feed} = useFeed({feedId})
    const actions: Action[] | undefined = useMemo(() => {
        if (!feedMessages) return undefined
        if (opts.actionField) {
            return feedMessages.map((m: any) => (m.action as any as Action)).filter((a: any) => (a !== undefined))
        }
        else return feedMessages as any as Action[]
    }, [feedMessages, opts.actionField])

    const lastComputedState = useRef<{
        numActions: number,
        state: State
    } | undefined>(undefined)

    const initialStateString = JSONStringifyDeterministic(initialState)

    const state = useMemo(() => {
        let s: State
        let ii = 0
        if (lastComputedState.current !== undefined) {
            ii = lastComputedState.current.numActions
            s = lastComputedState.current.state
        }
        else {
            s = JSON.parse(initialStateString)
        }
        while (ii < (actions || [])?.length) {
            s = reducer(s, (actions || [])[ii])
            ii++
        }
        lastComputedState.current = {
            numActions: (actions || []).length,
            state: s
        }
        return s
    }, [actions, initialStateString, reducer])

    return {state, feed}
}

export default useFeedReducer