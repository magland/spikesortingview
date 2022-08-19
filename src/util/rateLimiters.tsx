import { useCallback, useMemo, useRef } from 'react'


export type DebounceThrottleUpdater<T, TRefs> = (refs: TRefs, state: T) => boolean
export type DebounceThrottleResolver<TRefs, ResolverProps> = (refs: TRefs, props: ResolverProps) => void

// TODO: Could probably combine these into one with a version toggle

export const useThrottler = <T, TRefs, ResolverProps>(
    updateFn: DebounceThrottleUpdater<T, TRefs>,
    resolveFn: DebounceThrottleResolver<TRefs, ResolverProps>,
    refs: TRefs,
    resolverProps: ResolverProps,
    timeMs?: number,
) => {
    const pendingRequest = useRef<number| undefined>(undefined)
    const cancelThrottled = useCallback(() => {
        if (!pendingRequest.current) return
        timeMs ? window.cancelAnimationFrame(pendingRequest.current) : window.clearTimeout(pendingRequest.current)
        pendingRequest.current = undefined
    }, [pendingRequest, timeMs])

    const resolver = useCallback((time: number) => {
        // OPTIONAL: could insert debug messages here
        resolveFn(refs, resolverProps)
        pendingRequest.current = undefined
    }, [pendingRequest, refs, resolveFn, resolverProps])

    const throttler = useCallback((state: T) => {
        const change = updateFn(refs, state)

        if (change && !(pendingRequest.current)) {
            pendingRequest.current = timeMs ? window.requestAnimationFrame(resolver) : window.setTimeout(resolver, timeMs)
        }
    }, [pendingRequest, updateFn, resolver, refs, timeMs])
    return { throttler, cancelThrottled }
}

export const useDebouncer = <T, TRefs, ResolverProps>(
        updateFn: DebounceThrottleUpdater<T, TRefs>,
        resolveFn: DebounceThrottleResolver<TRefs, ResolverProps>,
        refs: TRefs,
        resolverProps: ResolverProps,
        timeMs?: number
    ) => {
    const time = useMemo(() => timeMs ?? 100, [timeMs]) // we don't debounce on animation frames b/c that's probably too fast
    const lastRequest = useRef<number | undefined>(undefined)
    const cancelDebouncer = useCallback(() => {
        if (!lastRequest.current) return
        window.clearTimeout(lastRequest.current)
        lastRequest.current = undefined
    }, [lastRequest])

    const resolver = useCallback((time: number) => {
        resolveFn(refs, resolverProps)
        lastRequest.current = undefined
    }, [resolveFn, refs, resolverProps])
    const debouncer = useCallback((state: T) => {
        const change = updateFn(refs, state)
        if (change) {
            if (lastRequest.current) clearTimeout(lastRequest.current)
            lastRequest.current = setTimeout(resolver, time)
        }
    }, [updateFn, refs, lastRequest, resolver, time])
    return { debouncer, cancelDebouncer }
}
