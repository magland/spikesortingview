import { FunctionComponent, useMemo } from 'react';
import { VegaLite } from 'react-vega'

// See https://github.com/vega/react-vega/issues/85#issuecomment-795138175
import './VegaLiteComponent.css'

type Props = {
    spec: any
    width: number
    height: number
}

export const VegaLiteComponent: FunctionComponent<Props> = ({spec, width, height}) => {
    const spec2 = useMemo(() => {
        return {...spec, width: "container", height: "container"}
    }, [spec])
    return (
        <div style={{width, height}}>
            <VegaLite
                spec={spec2}
                actions={false} // actions include export to SVG
            />
        </div>
    )
}

export default VegaLiteComponent