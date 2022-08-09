import React, { useCallback, useMemo } from "react"
import useBinarySearchTree, { BstSearchFn, BstSearchResult } from "util/bst"
import { AnimationState, AnimationStateAction } from "views/common/Animation/AnimationStateReducer"
import { PositionFrame } from "./TrackPositionAnimationTypes"



const snapTimeToGrid = (time: number, searchFn: BstSearchFn<number>) => {
    const nearestTime = searchFn(time)
    return nearestTime
}

const timeComparison = (a: number, b: number) => a - b

type TimeLookupFn = (time: number) => BstSearchResult<number> | undefined

export type liveMatchFocusToFrameProps = {
    focusTime: number | undefined
    checkFocusWithinEpsilon: (focusTime: number | undefined, replayRateMultiplier: number) => boolean
    multiplier: number
    cancelPendingRefocus: () => void
    findNearestTime: (time: number) => BstSearchResult<number> | undefined
    animationStateDispatch: React.Dispatch<AnimationStateAction<PositionFrame>>
}
export const liveMatchFocusToFrame = (props: liveMatchFocusToFrameProps) => {
    const { focusTime, checkFocusWithinEpsilon, multiplier, cancelPendingRefocus, findNearestTime, animationStateDispatch } = props
    if (checkFocusWithinEpsilon(focusTime, multiplier)) return
    cancelPendingRefocus()
    matchFrameToFocus(focusTime, findNearestTime, animationStateDispatch)
}

export const matchFocusToFrame = (animationCurrentTime: number | undefined, setTimeFocus: (time: number, o: {autoScrollVisibleTimeRange?: boolean}) => void) => {
    // const epsilon = 0.05
    const currentTime = animationCurrentTime
    if (currentTime === undefined) return
    // don't let this function depend on focusTime
    // if (Math.abs(focusTime - currentTime) < epsilon) return
    setTimeFocus(currentTime, {autoScrollVisibleTimeRange: true})
}

export const matchFrameToFocus = (focusTime: number | undefined, findNearestTime: TimeLookupFn, animationStateDispatch: React.Dispatch<AnimationStateAction<PositionFrame>>) => {
    if (focusTime === undefined) return
    const focusIndex = findNearestTime(focusTime)?.baseListIndex
    if (focusIndex === undefined) return
    animationStateDispatch({
        type: 'SET_CURRENT_FRAME',
        newIndex: focusIndex
    })
}

const useTimeLookupFn = (animationState: AnimationState<PositionFrame>) => {
    // TODO: Is this updating too often?
    const realizedTimestamps = useMemo(() => animationState.frameData.map(d => d ? d.timestamp || -1 : -1), [animationState.frameData])
    const timeSearchFn = useBinarySearchTree<number>(realizedTimestamps, timeComparison) // do not use an anonymous fn here--results in constant refreshes
    const findNearestTime = useCallback((time: number) => {
        return snapTimeToGrid(time, timeSearchFn)
    }, [timeSearchFn])

    return findNearestTime
}

export default useTimeLookupFn
