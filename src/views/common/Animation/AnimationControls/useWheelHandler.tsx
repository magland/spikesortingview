import React, { useCallback, useMemo, useRef } from 'react'
import { DebounceResolver, DebounceUpdater, useDebouncer } from 'util/useDebouncer'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type WheelDebounceProperties = {
    wheelCount: number
    useFineWheel: boolean
    isPlaying: boolean
}

type WheelDebouncePropertiesRefs = {
    wheelCount: React.MutableRefObject<number>
    useFineWheel: React.MutableRefObject<boolean>
    isPlaying: React.MutableRefObject<boolean>
}

type WheelResolverProps = {
    dispatch: AnimationStateDispatcher<any>
}

const wheelUpdate: DebounceUpdater<WheelDebounceProperties, WheelDebouncePropertiesRefs> = (refs, state) => {
    const unchanged = (state.wheelCount === 0 &&
                       refs.useFineWheel.current === state.useFineWheel &&
                       refs.isPlaying.current === state.isPlaying)
    if (!unchanged) {
        refs.wheelCount.current += state.wheelCount
        refs.useFineWheel.current = state.useFineWheel
        refs.isPlaying.current = state.isPlaying
    }
    return !unchanged
}

const wheelResolver: DebounceResolver<WheelDebouncePropertiesRefs, WheelResolverProps> = (refs, props) => {
    const { dispatch } = props
    if (refs.wheelCount.current !== 0 && !refs.isPlaying.current) {
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

export const useWheelDebouncer = (dispatch: AnimationStateDispatcher<any>, playingRef: React.MutableRefObject<boolean>) => {
    const wheelCount = useRef<number>(0)
    const useFineWheel = useRef<boolean>(false)
    const refs = useMemo(() => {return { wheelCount, useFineWheel, isPlaying: playingRef }}, [wheelCount, useFineWheel, playingRef])
    const resolverProps = useMemo(() => { return { dispatch }}, [dispatch])
    const debouncedWheelHandler = useDebouncer(wheelUpdate, wheelResolver, refs, resolverProps)
    return debouncedWheelHandler
}

const useWheelHandler = (debouncer: (state: WheelDebounceProperties) => void, playingRef: React.MutableRefObject<boolean>) => {
    return useCallback((e: React.WheelEvent) => {
        if (e.deltaY === 0) return
        const useFineWheel = e.shiftKey
        const wheelCount = e.deltaY > 0 ? 1 : -1
        debouncer({useFineWheel, wheelCount, isPlaying: playingRef.current})
    }, [debouncer, playingRef])
}

export default useWheelHandler