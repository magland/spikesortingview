import numpy as np
import sortingview as sv
import spikeextractors as se
import figurl as fig
from helpers.compute_correlogram_data import compute_correlogram_data

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    plots = []
    for unit_id in S.get_unit_ids():
        spike_times_sec = np.array(S.get_unit_spike_train(unit_id=unit_id)) / S.get_sampling_frequency()
        plots.append({
            'unitId': unit_id,
            'spikeTimesSec': spike_times_sec.astype(np.float32)
        })
    
    data = {
        'type': 'RasterPlot',
        'startTimeSec': 0,
        'endTimeSec': R.get_num_frames() / R.get_sampling_frequency(),
        'plots': plots
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-1', data=data)
    url = F.url(label='test_raster_plot')
    print(url)

if __name__ == '__main__':
    main()