from typing import Tuple
import numpy as np
import kachery_client as kc
import sortingview as sv
import spikeextractors as se
import figurl as fig

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    data = test_average_waveforms(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-1', data=data)
    url = F.url(label='test_average_waveforms')
    print(url)

def test_average_waveforms(*, recording: sv.LabboxEphysRecordingExtractor, sorting: sv.LabboxEphysSortingExtractor):
    noise_level = estimate_noise_level(recording)
    plots = []
    for unit_id in sorting.get_unit_ids():
        a = compute_average_waveform(recording=recording, sorting=sorting, unit_id=unit_id)
        channel_ids = a['channel_ids']
        waveform = a['waveform']
        plots.append({
            'unitId': unit_id,
            'channelIds': channel_ids,
            'waveform': waveform.T
        })
    
    data = {
        'type': 'AverageWaveforms',
        'averageWaveforms': plots,
        'samplingFrequency': recording.get_sampling_frequency(),
        'noiseLevel': noise_level
    }
    return data

def extract_snippets(*, traces: np.ndarray, times: np.array, snippet_len: Tuple[int]):
    N = traces.shape[0]
    M = traces.shape[1]
    T = snippet_len[0] + snippet_len[1]
    ret = np.zeros((len(times), T, M), dtype=traces.dtype)
    for t in range(T):
        times2 = times + t - snippet_len[0]
        valid = np.where((0 <= times2) & (times2 < N))
        if len(valid) > 0:
            ret[valid, t, :] = traces[times2[valid], :]
    return ret

def compute_average_waveform(*, recording: sv.LabboxEphysRecordingExtractor, sorting: sv.LabboxEphysSortingExtractor, unit_id: int):
    traces = recording.get_traces().T
    times = sorting.get_unit_spike_train(unit_id=unit_id)
    snippets = extract_snippets(traces=traces, times=times, snippet_len=(20, 20))
    waveform = np.mean(snippets, axis=0)
    return {
        'channel_ids': recording.get_channel_ids(),
        'waveform': waveform.astype(np.float32)
    }

def estimate_noise_level(recording: sv.LabboxEphysRecordingExtractor):
    traces0 = recording.get_traces(start_frame=0, end_frame=int(np.minimum(recording.get_num_frames(), recording.get_sampling_frequency() * 60)))
    est_noise_level = np.median(np.abs(traces0.ravel())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    return est_noise_level

if __name__ == '__main__':
    main()