import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { useMemo } from 'react';
import { paintSpanHighlights } from './paint';
import { PixelHighlightSpanSet } from './TimeScrollView';

export type TSVHighlightLayerProps<T extends {[key: string]: any}> = {
    highlightSpans?: PixelHighlightSpanSet[]
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const TSVHighlightLayer = <T extends {[key: string]: any}>(props: TSVHighlightLayerProps<T>) => {
    const {width, height, highlightSpans, margins } = props
    const drawData = useMemo(() => ({
        width, height, highlightSpans, margins
    }), [width, height, highlightSpans, margins])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paintSpanHighlights}
            drawData={drawData}
        />
    )
}

export default TSVHighlightLayer