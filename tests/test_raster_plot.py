import numpy as np
import kachery_client as kc
import sortingview as sv
import spikeextractors as se
import figurl as fig

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    data = test_raster_plot(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-1', data=data)
    url = F.url(label='test_raster_plot')
    print(url)

def test_raster_plot(*, recording: sv.LabboxEphysRecordingExtractor, sorting: sv.LabboxEphysSortingExtractor):
    plots = []
    for unit_id in sorting.get_unit_ids():
        spike_times_sec = np.array(sorting.get_unit_spike_train(unit_id=unit_id)) / sorting.get_sampling_frequency()
        plots.append({
            'unitId': unit_id,
            'spikeTimesSec': spike_times_sec.astype(np.float32)
        })
    
    data = {
        'type': 'RasterPlot',
        'startTimeSec': 0,
        'endTimeSec': recording.get_num_frames() / recording.get_sampling_frequency(),
        'plots': plots
    }
    return data

if __name__ == '__main__':
    main()