import React, { useCallback, useMemo, useRef } from 'react';
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from 'util/rateLimiters';

export type PanState = {
    anchorTime?: number,
    anchorX?: number,
    panning?: boolean
    pannedTime?: number
    pannedX?: number
}

export type PanStateRef = React.MutableRefObject<PanState>

export type PanUpdateProperties = {
    mouseX: number
    time: number
}

type PanUpdateRefs = {
    divRef: React.MutableRefObject<HTMLDivElement | null>
    panStateRef: PanStateRef
}

// Convenience alias for long fn signature
type PanFn = (deltaT: number) => void
type PanResolverProps = {
    panRecordingSelectionDeltaT: PanFn
}


const setNextPanUpdate: DebounceThrottleUpdater<PanUpdateProperties, PanUpdateRefs> = (refs, state) => {
    const { panStateRef } = refs
    const { mouseX, time } = state
    if (!panStateRef.current.panning) return false
    if (panStateRef.current.pannedTime === time && panStateRef.current.pannedX === mouseX) return false
    panStateRef.current.pannedTime = time
    panStateRef.current.pannedX = mouseX

    return true
}


const panResolver: DebounceThrottleResolver<PanUpdateRefs, PanResolverProps> = (refs, props) => {
    const {panStateRef} = refs
    const {panRecordingSelectionDeltaT} = props
    const deltaT = (panStateRef?.current?.anchorTime ?? 0) - (panStateRef?.current?.pannedTime ?? 0)
    if (deltaT === 0) return
    panRecordingSelectionDeltaT && panRecordingSelectionDeltaT(deltaT)
    // Don't reset panning state by default here--user may still be holding the mouse button
}


export const useThrottledPan = (refs: PanUpdateRefs, panRecordingSelectionDeltaT: PanFn) => {
    const resolverProps = useMemo(() => {return {panRecordingSelectionDeltaT}}, [panRecordingSelectionDeltaT])
    const panHandler = useThrottler(setNextPanUpdate, panResolver, refs, resolverProps, 50)
    return panHandler
}


const resetPanStateAnchor = (ref: PanStateRef, mouseX: number, time: number, cancelPendingPan: () => void) => {
    ref.current.anchorTime = time
    ref.current.anchorX = mouseX
    ref.current.panning = false
    ref.current.pannedX = undefined
    ref.current.pannedTime = undefined
    cancelPendingPan()
}


const startPanning = (ref: PanStateRef, mouseX: number) => {
    const deltaX = mouseX - (ref.current.anchorX ?? mouseX)
    if (Math.abs(deltaX) > 5) {
        ref.current.panning = true
    }
}


const clearPanState = (ref: PanStateRef, cancelPendingPan: () => void) => {
    ref.current = {}
    cancelPendingPan()
}


const isPanning = (ref: PanStateRef) => {
    return ref.current?.panning ?? false
}


const useTimeScrollPan = (divRef: React.MutableRefObject<HTMLDivElement | null>, panRecordingSelectionDeltaT: PanFn) => {
    const panStateRef = useRef<PanState>({})
    const refs = useMemo(() => {return {divRef, panStateRef}}, [divRef, panStateRef])
    const { throttler, cancelThrottled } = useThrottledPan(refs, panRecordingSelectionDeltaT)
    const resetAnchor = useCallback((mouseX: number, time: number) => {
        resetPanStateAnchor(panStateRef, mouseX, time, cancelThrottled)
    }, [panStateRef, cancelThrottled])
    const startPan = useCallback((mouseX: number) => startPanning(panStateRef, mouseX), [panStateRef])
    const clearPan = useCallback(() => clearPanState(panStateRef, cancelThrottled), [panStateRef, cancelThrottled])
    const panning = useCallback(() => isPanning(panStateRef), [panStateRef])

    return {
        setPanUpdate: throttler,
        resetAnchor,
        startPan,
        clearPan,
        isPanning: panning
    }
}

export default useTimeScrollPan
