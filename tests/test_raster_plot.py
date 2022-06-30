# 6/22/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://594b8d6f70c7a054fa3b7a295ffba40fb93f31b1&label=test_raster_plot

import numpy as np
import sortingview as sv
import spikeinterface as si
import spikeinterface.extractors as se
import figurl as fig

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data = test_raster_plot(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test_raster_plot')
    print(url)

def test_raster_plot(*, recording: si.BaseRecording, sorting: si.BaseSorting):
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