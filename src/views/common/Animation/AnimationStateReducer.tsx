import React from "react"

const MS_PER_TICK_60HZ = 1000/60

export type DrawFn<T> = (frame_data: T) => void

export type AnimationState<T> = {
    frameData: T[],
    replayMultiplier: number,
    isPlaying: boolean,
    currentFrameIndex: number,
    playbackStartedTimestamp: number | undefined,
    playbackStartedFrameIndex: number,
    pendingFrameCode: number | undefined,
    baseMsPerFrame: number, // the number of ms per frame that will correspond to 1:1 playback, i.e. playback in real-time of the recording.
    animationDispatchFn: ((calltime: number) => void) | undefined
}

export type AnimationStateDispatcher<T> = React.Dispatch<AnimationStateAction<T>>

export type AnimationStateActionType = 'SET_DISPATCH' | 'UPDATE_FRAME_DATA' | 'TICK' | 'TOGGLE_PLAYBACK' | 'SET_CURRENT_FRAME' | 'SET_BASE_MS_PER_FRAME' | 'SET_REPLAY_RATE' | 'SKIP' | 'TO_END'

export type AnimationStateAction<T> =
    AnimationStateSetDispatchAction |
    AnimationStateUpdateFrameDataAction<T> |
    AnimationStateTickAction |
    AnimationStateTogglePlaybackAction |
    AnimationStateSetCurrentFrameAction |
    AnimationStateSetBaseMsPerFrameAction |
    AnimationStateSetReplayRateAction |
    AnimationStateSkipAction |
    AnimationStateToEndAction

export type AnimationStateSetDispatchAction = {
    type: 'SET_DISPATCH'
    animationDispatchFn: ((calltime: number) => void)
}

export type AnimationStateUpdateFrameDataAction<T> = {
    type: 'UPDATE_FRAME_DATA'
    incomingFrames: T[]
    replaceExistingFrames?: boolean
}

export type AnimationStateTickAction = {
    type: 'TICK'
    now: number
}

export type AnimationStateTogglePlaybackAction = {
    type: 'TOGGLE_PLAYBACK'
}

export type AnimationStateSetCurrentFrameAction = { 
    type: 'SET_CURRENT_FRAME',
    newIndex: number
}

export type AnimationStateSetBaseMsPerFrameAction = {
    type: 'SET_BASE_MS_PER_FRAME',
    baseMsPerFrame: number
}

export type AnimationStateSetReplayRateAction = {
    type: 'SET_REPLAY_RATE',
    newRate: number
}

export type AnimationStateSkipAction = {
    type: 'SKIP'
    backward?: boolean
    fineSteps?: number
    frameByFrame?: boolean
}

export type AnimationStateToEndAction = {
    type: 'TO_END'
    backward?: boolean
}

export const SET_DISPATCH: AnimationStateActionType = 'SET_DISPATCH'
export const UPDATE_FRAME_DATA: AnimationStateActionType = 'UPDATE_FRAME_DATA'
export const TICK: AnimationStateActionType = 'TICK'
export const TOGGLE_PLAYBACK: AnimationStateActionType = 'TOGGLE_PLAYBACK'
export const SET_CURRENT_FRAME: AnimationStateActionType = 'SET_CURRENT_FRAME'
export const SET_BASE_MS_PER_FRAME: AnimationStateActionType = 'SET_BASE_MS_PER_FRAME'
export const SET_REPLAY_RATE: AnimationStateActionType = 'SET_REPLAY_RATE'
export const SKIP: AnimationStateActionType = 'SKIP'
export const TO_END: AnimationStateActionType = 'TO_END'

// TODO: Is this really needed? It really only serves to type the frame data.
export const makeDefaultState = <T, >(): AnimationState<T> => {
    return {
        frameData: [],
        replayMultiplier: 1,
        isPlaying: false,
        currentFrameIndex: 0,
        playbackStartedTimestamp: undefined,
        playbackStartedFrameIndex: 0,
        pendingFrameCode: undefined,
        baseMsPerFrame: MS_PER_TICK_60HZ,
        animationDispatchFn: undefined
    }
}

// This produces a function that conforms with the expectations of requestAnimationFrame() and still
// knows how to continue ticking the state's clock.
export const curryDispatch = <T, >(dispatch: React.Dispatch<AnimationStateAction<T>>) => {
    const curried = (calltime: number) => {
        const tickAction = {
            type: 'TICK',
            now: calltime,
            curriedDispatchFn: curried
        } as AnimationStateAction<T>
        dispatch(tickAction)
    }
    return curried
}


//////// The main event
const AnimationStateReducer = <T, >(s: AnimationState<T>, a: AnimationStateAction<T>): AnimationState<T> => {
    const { type } = a
    switch (type) {
        case SET_DISPATCH:
            return {...s, animationDispatchFn: a.animationDispatchFn}
        case UPDATE_FRAME_DATA:
            return updateFrames(s, a)
        case TICK:
            return doTick(s, a)
        case TOGGLE_PLAYBACK:
            return togglePlayState(s)
        case SET_CURRENT_FRAME:
            return setFrame(s, a)
        case SET_BASE_MS_PER_FRAME:
            if (a.baseMsPerFrame === 0) {
                console.warn('Attempt to set ms-per-frame to 0.')
                return s
            }
            refreshAnimationCycle(s)
            return { ...s, baseMsPerFrame: a.baseMsPerFrame, playbackStartedTimestamp: undefined }
        case SET_REPLAY_RATE:
            // Negative values are allowed and will just play it backwards.
            if (a.newRate === 0) {
                console.warn(`Attempt to set new replay rate to 0.`)
                return s
            }
            refreshAnimationCycle(s)
            return { ...s, replayMultiplier: a.newRate, playbackStartedTimestamp: undefined }
        case SKIP:
            return doSkip(s, a)
        case TO_END:
            s.currentFrameIndex = a.backward ? 0 : s.frameData.length - 1
            refreshAnimationCycle(s)
            return {...s, playbackStartedTimestamp: undefined}
        default: {
            throw Error(`Invalid action type for animation state reducer: ${type}`)
        }
    }
}

const refreshAnimationCycle = (s: AnimationState<any>) => {
    if (s.pendingFrameCode === undefined || !s.isPlaying) return
    window.cancelAnimationFrame(s.pendingFrameCode)
    if (s.animationDispatchFn === undefined) {
        console.warn('Animation callback unset.')
        return
    }
    s.pendingFrameCode = window.requestAnimationFrame(s.animationDispatchFn)
}


const updateFrames = <T, >(s: AnimationState<T>, a: AnimationStateUpdateFrameDataAction<T>): AnimationState<T> => {
    if (a.replaceExistingFrames) {
        s.frameData = a.incomingFrames
    } else {
        // apparently iteratively inserting these is orders of magnitude faster than using the concat function,
        // but the reference is pretty old, so we should consider profiling this
        a.incomingFrames.forEach(frame => s.frameData.push(frame))
    }
    return {...s}
}


const doTick = <T, >(s: AnimationState<T>, a: AnimationStateTickAction): AnimationState<T> => {
    if (s.animationDispatchFn === undefined) {
        console.warn('Attempt to animate, but no dispatch function set. No-op.')
        return s
    }
    if (s.playbackStartedTimestamp) {
        const elapsedMs = a.now - s.playbackStartedTimestamp
        if (elapsedMs < 0) {
            console.warn(`Doing animation tick, but elapsed time is somehow negative: ${a.now} - ${s.playbackStartedTimestamp} = ${elapsedMs}`)
            return s
        }
        const rawElapsedFrames = elapsedMs/s.baseMsPerFrame * s.replayMultiplier
        const elapsedFrames = s.replayMultiplier > 0 ? Math.floor(rawElapsedFrames) : Math.ceil(rawElapsedFrames)
        s.currentFrameIndex = Math.max(0, Math.min((s.frameData.length - 1), s.playbackStartedFrameIndex + elapsedFrames))
    } else {
        s.playbackStartedTimestamp = a.now
        s.playbackStartedFrameIndex = s.currentFrameIndex
    }

    if (((s.currentFrameIndex === s.frameData.length - 1) && s.replayMultiplier > 0) || ((s.currentFrameIndex === 0) && s.replayMultiplier < 0)) {
        return togglePlayState(s)
    }
    return {...s, pendingFrameCode: window.requestAnimationFrame(s.animationDispatchFn)}
}

const togglePlayState = <T, >(s: AnimationState<T>): AnimationState<T> => {
    if (s.isPlaying) {
        s.pendingFrameCode && window.cancelAnimationFrame(s.pendingFrameCode)
        s.pendingFrameCode = undefined
        s.playbackStartedTimestamp = undefined // The old value doesn't matter, since we can't time anything with it after pause.
        s.playbackStartedFrameIndex = s.currentFrameIndex
    } else {
        if (!s.animationDispatchFn) {
            console.warn('Toggling play state to active, but no dispatch function set up. No-op.')
            return s
        }
        s.pendingFrameCode = window.requestAnimationFrame(s.animationDispatchFn)
    }
    s.isPlaying = !s.isPlaying
    return {...s}
}

const setFrame = <T, >(s: AnimationState<T>, a: AnimationStateSetCurrentFrameAction): AnimationState<T> => {
    const { newIndex } = a
    if (newIndex < 0) {
        console.warn(`Attempt to set playback index to negative value ${newIndex}. No-op.`)
        return s
    }
    if (0 < newIndex && newIndex < 1) {
        const i = Math.floor(s.frameData.length * newIndex)
        s.currentFrameIndex = i
    } else {
        s.currentFrameIndex = Math.min(newIndex, s.frameData.length - 1)
    }
    if (s.playbackStartedTimestamp) {
        s.playbackStartedTimestamp = undefined
        refreshAnimationCycle(s)
    }
    return {...s}
}

const msPerFineSkip = 100
const minStepSize = 1
const coarseStepSizePct = 0.03
/**
 * Skip forward/backward by a defined amount controlled by the skip action parameters and the playback speed.
 * This is controlled by `AnimationStateSkipAction.fineSteps`:
 * - When `fineSteps` is unset, *coarse* skip is used. This is currently a jump of 3%
 * of the total recording length (but consider making it 5 sec of current playback speed).
 * - When `fineSteps` is set, *fine* skip is used. The step rate is:
 *    - if `AnimationStateSkipAction.frameByFrame` is true, then each step is one frame.
 *    - Otherwise, each step is 1/10 of a second of playback at the current speed (min 1 frame).
 *   The per-step skip rate is multiplied by the numer of fine steps requested (for debouncing mouse wheel controls).
 * - If `fineSteps` is a 0 value, the function returns the input state (a no-op).
 * @param s Current animation state
 * @param a Skip action
 * @returns Updated animation state.
 */
const doSkip = <T, >(s: AnimationState<T>, a: AnimationStateSkipAction): AnimationState<T> => {
    const { backward, fineSteps, frameByFrame } = a

    if (fineSteps !== undefined && fineSteps === 0) {
        // No steps requested. No-op: return identity.
        return s
    }
    const frameSkipCount = fineSteps
        ? fineSteps * (frameByFrame
                        ? minStepSize
                        : (Math.max((Math.round(s.replayMultiplier * msPerFineSkip/s.baseMsPerFrame)), minStepSize)))
        : (Math.floor(s.frameData.length * coarseStepSizePct))

    const newFrame = s.currentFrameIndex + (frameSkipCount * (backward ? -1 : 1))

    s.currentFrameIndex = newFrame < 0
        ? 0
        : newFrame > (s.frameData.length - 1)
            ? s.frameData.length : newFrame
    refreshAnimationCycle(s)
    return {...s, playbackStartedTimestamp: undefined}
}

export default AnimationStateReducer
