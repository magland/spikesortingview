import React, { useCallback, useMemo, useRef } from 'react'
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from 'util/useDebouncer'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type WheelStateProperties = {
    wheelCount: number
    useFineWheel: boolean
}

type WheelStateRefs = {
    wheelCount: React.MutableRefObject<number>
    useFineWheel: React.MutableRefObject<boolean>
}

type WheelResolverProps = {
    dispatch: AnimationStateDispatcher<any>
}

const wheelUpdate: DebounceThrottleUpdater<WheelStateProperties, WheelStateRefs> = (refs, state) => {
    const unchanged = (state.wheelCount === 0 &&
                       refs.useFineWheel.current === state.useFineWheel)
    if (!unchanged) {
        refs.wheelCount.current += state.wheelCount
        refs.useFineWheel.current = state.useFineWheel
    }
    return !unchanged
}

const wheelResolver: DebounceThrottleResolver<WheelStateRefs, WheelResolverProps> = (refs, props) => {
    const { dispatch } = props
    if (refs.wheelCount.current !== 0) {
        dispatch({
            type: 'SKIP',
            backward: refs.wheelCount.current < 0,
            fineSteps: Math.abs(refs.wheelCount.current),
            frameByFrame: refs.useFineWheel.current
        })
    }
    refs.useFineWheel.current = false
    refs.wheelCount.current = 0
}

export const useThrottledWheel = (dispatch: AnimationStateDispatcher<any>) => {
    const wheelCount = useRef<number>(0)
    const useFineWheel = useRef<boolean>(false)
    const refs = useMemo(() => {return { wheelCount, useFineWheel }}, [wheelCount, useFineWheel])
    const resolverProps = useMemo(() => { return { dispatch }}, [dispatch])
    const wheelHandler = useThrottler(wheelUpdate, wheelResolver, refs, resolverProps)
    return wheelHandler
}

const useWheelHandler = (dispatch: AnimationStateDispatcher<any>) => {
    const throttledUpdater = useThrottledWheel(dispatch)
    const wheelHandler = useCallback((e: React.WheelEvent) => {
        if (e.deltaY === 0) return
        const useFineWheel = e.shiftKey
        const wheelCount = e.deltaY > 0 ? 1 : -1
        throttledUpdater({useFineWheel, wheelCount})
    }, [throttledUpdater])

    return wheelHandler
}

export default useWheelHandler