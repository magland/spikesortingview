import { FunctionComponent } from "react";
import { HoveredInfo } from "./UnitSimilarityMatrixView";

type Props = {
    hoveredInfo: HoveredInfo | undefined
}

const BottomToolbar: FunctionComponent<Props> = ({hoveredInfo}) => {
    return (
        <span>
            {
                hoveredInfo ? (
                    <span>
                        Units {hoveredInfo.unitId1}/{hoveredInfo.unitId2} | {hoveredInfo.value !== undefined ? `value: ${hoveredInfo.value}` : ''}
                    </span>
                ) : (
                    <span />
                )
            }
        </span>
    )
}

export default BottomToolbar