import { defaultZoomScaleFactor, ZoomDirection } from 'libraries/RecordingSelectionContext';
import { abs } from 'mathjs';
import React, { useCallback, useMemo, useRef } from 'react';
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from 'util/rateLimiters';

type ZoomStateProperties = {
    zoomsCount: number
}

type ZoomStateRefs = {
    divRef: React.MutableRefObject<HTMLDivElement | null>
    zoomsCount: React.MutableRefObject<number>
}

// Convenience alias for long fn signature
type ZoomFn = (direction: ZoomDirection, factor?: number | undefined) => void

type ZoomResolverProps = {
    zoomRecordingSelection: ZoomFn
}

const zoomUpdate: DebounceThrottleUpdater<ZoomStateProperties, ZoomStateRefs> = (refs, state) => {
    const { divRef } = refs
    const { zoomsCount } = state
    const divHasFocus = (divRef?.current as any)['_hasFocus']
    const unchanged = !divHasFocus || zoomsCount === 0
    if (!unchanged) {
        refs.zoomsCount.current += zoomsCount
    }
    return !unchanged
}

const zoomResolver: DebounceThrottleResolver<ZoomStateRefs, ZoomResolverProps> = (refs, props) => {
    const {zoomsCount} = refs
    const {zoomRecordingSelection} = props
    if (!zoomsCount.current || zoomsCount.current === 0) return
    const direction = zoomsCount.current > 0 ? 'in' : 'out'
    const factor = defaultZoomScaleFactor ** abs(zoomsCount.current)
    zoomRecordingSelection && zoomRecordingSelection(direction, factor)
    zoomsCount.current = 0
}

export const useThrottledZoom = (divRef: React.MutableRefObject<HTMLDivElement | null>, zoomRecordingSelection: ZoomFn) => {
    const zoomsCount = useRef(0)
    const refs = useMemo(() => {return {divRef, zoomsCount}}, [divRef, zoomsCount])
    const resolverProps = useMemo(() => { return {zoomRecordingSelection}}, [zoomRecordingSelection])
    const zoomHandler = useThrottler(zoomUpdate, zoomResolver, refs, resolverProps, 50)
    return zoomHandler
}

const useTimeScrollZoom = (divRef: React.MutableRefObject<HTMLDivElement | null>, zoomRecordingSelection: ZoomFn) => {
    const { throttler } = useThrottledZoom(divRef, zoomRecordingSelection)
    const wheelHandler = useCallback((e: React.WheelEvent) => {
        if (e.deltaY === 0) return
        const zoomsCount = -e.deltaY/100
        throttler({zoomsCount})
    }, [throttler])
    
    return wheelHandler
}

export default useTimeScrollZoom
