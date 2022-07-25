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

export const matchFocusToFrame = (animationState: AnimationState<PositionFrame>, focusTime: number | undefined, setTimeFocus: (time: number) => void) => {
    const epsilon = 0.05
    const currentTime = animationState.frameData[animationState.currentFrameIndex].timestamp
    if (!currentTime || !focusTime) return
    if (Math.abs(focusTime - currentTime) < epsilon) return
    setTimeFocus(currentTime)
}

export const matchFrameToFocus = (focusTime: number | undefined, findNearestTime: TimeLookupFn, animationState: AnimationState<PositionFrame>, animationStateDispatch: React.Dispatch<AnimationStateAction<PositionFrame>>) => {
    const focusIndex = focusTime
        ? findNearestTime(focusTime)?.baseListIndex ?? animationState.currentFrameIndex
        : animationState.currentFrameIndex
    if (focusIndex !== animationState.currentFrameIndex) {
        animationStateDispatch({
            type: 'SET_CURRENT_FRAME',
            newIndex: focusIndex
        })
    }
}

const useTimeLookupFn = (animationState: AnimationState<PositionFrame>) => {
    const realizedTimestamps = useMemo(() => animationState.frameData.map(d => d.timestamp || -1), [animationState.frameData])
    const timeSearchFn = useBinarySearchTree<number>(realizedTimestamps, timeComparison) // do not use an anonymous fn here--results in constant refreshes
    const findNearestTime = useCallback((time: number) => {
        return snapTimeToGrid(time, timeSearchFn)
    }, [timeSearchFn])

    return findNearestTime
}

export default useTimeLookupFn
