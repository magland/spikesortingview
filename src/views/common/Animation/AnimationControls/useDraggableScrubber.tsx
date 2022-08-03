import React, { useCallback, useMemo, useRef } from 'react'
import { DebounceResolver, DebounceUpdater, useDebouncer } from 'util/useDebouncer'
import { LogicalBarInterpreter } from '../AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type ScrubberDragDebounceProperties = {
    draggingPixelX: number
    lookupFrameFn: (x: number) => number | undefined
}

type ScrubberDragDebouncePropertiesRefs = {
    dragPointRef: React.MutableRefObject<number | undefined>
    currentFrameIndexRef: React.MutableRefObject<number>
    targetFrameIndexRef: React.MutableRefObject<number | undefined>
}

type ScrubberDragResolverProps = {
    dispatch: AnimationStateDispatcher<any>
}

type InitiateTerminateScrubbingProps = {
    x: number
    y: number
    isPlaying: boolean,
    barInterpreter: LogicalBarInterpreter
    dragPointRef: React.MutableRefObject<number | undefined>
    wasPlayingRef: React.MutableRefObject<boolean>
    dispatch: AnimationStateDispatcher<any>
}
/**
 * Returns true if scrubbing has been initiated, false if not.
 */
const conditionallyHandleScrubbingInitiation = (props: InitiateTerminateScrubbingProps) => {
    const { x, y, barInterpreter, dragPointRef, isPlaying, wasPlayingRef, dispatch } = props
    const clickStatus = barInterpreter(x, y)
    if (clickStatus !== 'scrubber') return false
    dragPointRef.current = x
    wasPlayingRef.current = isPlaying
    if (isPlaying) dispatch({type: 'TOGGLE_PLAYBACK'})
    return true
}

const conditionallyHandleScrubbingTermination = (isPlaying: boolean, dragPointRef: React.MutableRefObject<number | undefined>, wasPlayingRef: React.MutableRefObject<boolean>, dispatch: AnimationStateDispatcher<any>) => {
    if (dragPointRef.current && wasPlayingRef.current && !isPlaying) {
        dispatch({type: 'TOGGLE_PLAYBACK'})
    }
    wasPlayingRef.current = false
    dragPointRef.current = undefined
}

// What are the components?
// An updater
// An initializer (?)
// A set of state that lets the updater know what to do
// A resolver, that has a condition.

// THE THING WE ARE DEBOUNCING HERE is the FRAME UPDATE. Drag initiation and play/pause is SEPARATE.

// Behavior:
// On scrubber-drag initialization, pause playback (if any) to resume later.
// --> this DOES NOT NEED DEBOUNCING, but maybe we want to accommodate it in the framework anyway?
// Every time the mouse moves AND drag is active:
//  - update the new frame we're pointing to.
//  - If enough time has passed, resolve to the new frame.
//  - When dragging ends, resume playback if it was paused by us.

// So playback is toggled on click, and that sets the overall "we are dragging" state as well.
// TO RESOLVE, we need:
// - the current drag target
// - the current frame index
// - the current window or something I guess
// WE NEED:
// - the current drag target x value
// - the current frame index

const scrubberMoveUpdate: DebounceUpdater<ScrubberDragDebounceProperties, ScrubberDragDebouncePropertiesRefs> = (refs, state) => {
    const { dragPointRef, targetFrameIndexRef } = refs
    const { draggingPixelX, lookupFrameFn } = state
    if (!dragPointRef.current) return false

    dragPointRef.current = draggingPixelX
    const frame = lookupFrameFn(draggingPixelX)
    if (frame === targetFrameIndexRef.current) return false

    targetFrameIndexRef.current = frame
    return true
}

const scrubberMoveResolver: DebounceResolver<ScrubberDragDebouncePropertiesRefs, ScrubberDragResolverProps> = (refs, props) => {
    const { dispatch } = props
    const { dragPointRef, currentFrameIndexRef, targetFrameIndexRef } = refs

    if (dragPointRef.current && targetFrameIndexRef.current && targetFrameIndexRef.current !== currentFrameIndexRef.current) {
        dispatch({type: 'SET_CURRENT_FRAME', newIndex: targetFrameIndexRef.current})
    }
    targetFrameIndexRef.current = undefined
}

const useDebouncerRefs = () => {
    const dragPointRef = useRef<number | undefined>(undefined)
    const currentFrameIndexRef = useRef<number>(0)
    const targetFrameIndexRef = useRef<number | undefined>(undefined)
    const refs = useMemo(() => {return { dragPointRef, currentFrameIndexRef, targetFrameIndexRef }}, [dragPointRef, currentFrameIndexRef, targetFrameIndexRef])
    return refs
}

const useScrubberMoveResolver = (dispatch: AnimationStateDispatcher<any>, refs: ScrubberDragDebouncePropertiesRefs) => {
    const resolverProps = useMemo(() => { return { dispatch }}, [dispatch])
    const resolver = useDebouncer(scrubberMoveUpdate, scrubberMoveResolver, refs, resolverProps)
    return resolver
}

const useDraggableScrubber = (dispatch: AnimationStateDispatcher<any>, barInterpreter: LogicalBarInterpreter) => {
    const refs = useDebouncerRefs()
    const wasPlayingRef = useRef<boolean>(false)
    const throttledStateSetter = useScrubberMoveResolver(dispatch, refs)
    const handleScrubbingInitiation = useCallback((x: number, y: number, isPlaying: boolean) => {
        const props = {
            barInterpreter,
            isPlaying,
            dragPointRef: refs.dragPointRef,
            wasPlayingRef: wasPlayingRef,
            dispatch
        }
        conditionallyHandleScrubbingInitiation({ x, y, ...props })
    }, [barInterpreter, refs.dragPointRef, wasPlayingRef, dispatch])
    const handleScrubbingTermination = useCallback((isPlaying: boolean) => {
        conditionallyHandleScrubbingTermination(isPlaying, refs.dragPointRef, wasPlayingRef, dispatch)
    }, [refs.dragPointRef, wasPlayingRef, dispatch])
    return { handleScrubbingInitiation, handleScrubbingTermination, scrubbingStateHandler: throttledStateSetter }
}

export default useDraggableScrubber