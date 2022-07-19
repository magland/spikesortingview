import { FunctionComponent } from "react";
import UnitMetricHistogram from "./UnitMetricHistogram";
import UnitMetricScatterPlot from "./UnitMetricScatterPlot";
import { UMGMetric, UMGUnit } from "./UnitMetricsGraphViewData";

export type UnitMetricPlotProps = {
    type: 'histogram' | 'scatter'
    metric1: UMGMetric
    metric2: UMGMetric
    units: UMGUnit[]
    selectedUnitIds: Set<number | string>
    setSelectedUnitIds: (unitIds: (string | number)[]) => void
    width: number
    height: number
}

const UnitMetricPlot: FunctionComponent<UnitMetricPlotProps> = ({type, metric1, metric2, units, selectedUnitIds, setSelectedUnitIds, width, height}) => {
    if (type === 'histogram') {
        return (
            <UnitMetricHistogram
                metric={metric1}
                units={units}
                selectedUnitIds={selectedUnitIds}
                width={width}
                height={height}
            />
        )
    }
    else {
        return (
            <UnitMetricScatterPlot
                metric1={metric1}
                metric2={metric2}
                units={units}
                selectedUnitIds={selectedUnitIds}
                setSelectedUnitIds={setSelectedUnitIds}
                width={width}
                height={height}
            />
        )
    }
}

export default UnitMetricPlot