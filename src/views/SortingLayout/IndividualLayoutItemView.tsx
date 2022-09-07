import { useFileData } from "figurl";
import { FunctionComponent, useEffect, useState } from "react";
import ProgressComponent from "../common/ProgressComponent";
import { ViewComponentProps } from "./LayoutItemView";
import { LayoutItem, SLView } from "./SortingLayoutViewData";

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: SLView[]
    width: number
    height: number
}  

const IndividualLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'View') {
        throw Error('Unexpected')
    }
    const {viewId} = layoutItem
    const view = views.filter(v => (v.viewId === viewId))[0]
    if (!view) throw Error(`View not found ${viewId}`)

    const { fileData: figureData, progress, errorMessage } = useFileData(view.dataUri)
    const [progressValue, setProgressValue] = useState<{loaded: number, total: number} | undefined>(undefined)
    useEffect(() => {
        progress.onProgress(({loaded, total}) => {
            setProgressValue({loaded, total})
        })
    }, [progress])

    if (!figureData) {
        return (
            <div style={{ width, height }}>
                {
                    errorMessage ? errorMessage : (
                        <ProgressComponent
                            loaded={progressValue?.loaded}
                            total={progressValue?.total}
                        />
                    )
                }
            </div>
        )
    }
    return (
        <ViewComponent
            data={figureData}
            width={width}
            height={height}
        />
    )
}

export default IndividualLayoutItemView