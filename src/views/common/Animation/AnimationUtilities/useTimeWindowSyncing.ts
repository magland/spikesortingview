import { useTimeRange } from 'libraries/context-recording-selection'
import React, { useEffect } from "react"
import { AnimationState, AnimationStateAction } from 'views/common/Animation/AnimationStateReducer'
import { useTimeLookupFn } from 'views/common/Animation/AnimationUtilities/useTimeSyncing'


const useTimeWindowSyncing = <T, >(state: AnimationState<T>, dispatch: React.Dispatch<AnimationStateAction<T>>, getTimeFromFrame: (frame: T) => number) => {
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()
    const findNearestTime = useTimeLookupFn(state, getTimeFromFrame)
    useEffect(() => {
        if (!state.windowSynced) return
        const windowBounds: [number, number] | undefined = (visibleTimeStartSeconds === undefined || visibleTimeEndSeconds === undefined)
            ? undefined
            : [(findNearestTime(visibleTimeStartSeconds)?.baseListIndex) as number, (findNearestTime(visibleTimeEndSeconds)?.baseListIndex) as number]
        if (windowBounds) { // Narrow the animation window if "closest frame" falls outside the range due to rounding. Avoids weird sync behavior.
            windowBounds[0] += getTimeFromFrame(state.frameData[windowBounds[0]]) < (visibleTimeStartSeconds ?? 0) ?  1 : 0
            windowBounds[1] += getTimeFromFrame(state.frameData[windowBounds[1]]) > ( visibleTimeEndSeconds  ?? 0) ? -1 : 0
        }
        dispatch({ type: 'SET_WINDOW', bounds: windowBounds })
    }, [visibleTimeStartSeconds, visibleTimeEndSeconds, dispatch, findNearestTime, state.windowSynced, state.frameData, getTimeFromFrame])
    useEffect(() => {
        // Reset to full recording when we turn off syncing
        if (state.windowSynced) return
        dispatch({ type: 'SET_WINDOW', bounds: undefined })
    }, [state.windowSynced, dispatch])
}


export default useTimeWindowSyncing