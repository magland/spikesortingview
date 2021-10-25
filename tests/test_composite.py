import os
import numpy as np
import kachery_client as kc
import sortingview as sv
import spikeextractors as se
import figurl as fig
from test_autocorrelograms import test_autocorrelograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    data1 = test_raster_plot(recording=R, sorting=S)
    data2 = test_autocorrelograms(recording=R, sorting=S)
    data3 = test_average_waveforms(recording=R, sorting=S)

    data = {
        'type': 'Composite',
        'layout': 'default',
        'views': [
            {
                'type': data0['type'],
                'label': data0['type'],
                'figureDataSha1': _upload_data_and_return_sha1(data0),
                'defaultHeight': 300
            }
            for data0 in [data1, data2, data3]
        ]
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-1', data=data)
    url = F.url(label='test_composite')
    print(url)

def _upload_data_and_return_sha1(data):
    data_uri = _store_json(data)
    data_hash = data_uri.split('/')[2]
    kc.upload_file(data_uri, channel=os.environ['FIGURL_CHANNEL'])
    return data_hash

def _store_json(x: dict):
    from figurl.core.serialize_wrapper import _serialize
    return kc.store_json(_serialize(x))

if __name__ == '__main__':
    main()