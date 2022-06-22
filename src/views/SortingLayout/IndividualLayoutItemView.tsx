import { useFileData } from "figurl/getFileData";
import { FunctionComponent } from "react";
import View from 'View';
import { LayoutItem, SLView } from "./SortingLayoutViewData";

type Props = {
    layoutItem: LayoutItem
    views: SLView[]
    width: number
    height: number
}  

const IndividualLayoutItemView: FunctionComponent<Props> = ({layoutItem, views, width, height}) => {
    if (layoutItem.type !== 'View') {
        throw Error('Unexpected')
    }
    const {viewId} = layoutItem
    const view = views.filter(v => (v.viewId === viewId))[0]
    if (!view) throw Error(`View not found ${viewId}`)

    const { fileData: figureData, errorMessage } = useFileData(view.dataUri)

    if (!figureData) {
        return (
            <div style={{ width, height }}>
                {
                    errorMessage ? errorMessage : 'Waiting for data'
                }
            </div>
        )
    }
    return (
        <View
            data={figureData}
            width={width}
            height={height}
        />
    )
}

export default IndividualLayoutItemView