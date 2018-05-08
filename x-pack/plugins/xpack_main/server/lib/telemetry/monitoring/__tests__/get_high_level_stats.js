/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from 'expect.js';
import sinon from 'sinon';
import { fetchHighLevelStats, getHighLevelStats, handleHighLevelStatsResponse } from '../get_high_level_stats';

describe('get_high_level_stats', () => {
  const callWith = sinon.stub();
  const size = 123;
  const product = 'xyz';
  const cloudName = 'bare-metal';
  const start = 0;
  const end = 1;
  const server = {
    config: sinon.stub().returns({
      get: sinon.stub().withArgs(`xpack.monitoring.${product}.index_pattern`).returns(`.monitoring-${product}-N-*`)
        .withArgs('xpack.monitoring.max_bucket_size').returns(size)
    })
  };
  const response = {
    hits: {
      hits: [
        {
          _source: {
            cluster_uuid: 'a',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '1.2.3-alpha1'
              }
            }
          }
        },
        {
          _source: {
            cluster_uuid: 'a',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '1.2.3-alpha1'
              }
            }
          }
        },
        {
          _source: {
            cluster_uuid: 'b',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '2.3.4-rc1'
              }
            }
          }
        },
        {
          _source: {
            cluster_uuid: 'b',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '2.3.4'
              }
            }
          }
        },
        // no version
        {
          _source: {
            cluster_uuid: 'b'
          }
        },
        // provides cloud data
        {
          _source: {
            cluster_uuid: 'c',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '5.6.1'
              },
              cloud: {
                name: cloudName,
                id: '123',
                vm_type: 'x1',
                region: 'abc-123'
              }
            }
          }
        },
        {
          _source: {
            cluster_uuid: 'c',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '5.6.1'
              },
              cloud: {
                name: cloudName,
                id: '234',
                vm_type: 'ps4',
                region: 'def-123',
                zone: 'def-123-A'
              }
            }
          }
        },
        // same cloud instance as above (based on its ID)
        {
          _source: {
            cluster_uuid: 'c',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '5.6.1'
              },
              cloud: {
                name: cloudName,
                id: '234',
                vm_type: 'ps4',
                region: 'def-123',
                zone: 'def-123-A'
              }
            }
          }
        },
        // cloud instance without anything other than the name
        {
          _source: {
            cluster_uuid: 'c',
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '5.6.1'
              },
              cloud: {
                name: cloudName
              }
            }
          }
        },
        // no cluster_uuid (not counted)
        {
          _source: {
            [`${product}_stats`]: {
              [`${product}`]: {
                version: '2.3.4'
              }
            }
          }
        }
      ]
    }
  };
  const expectedClusters = {
    a: {
      count: 2,
      versions: [
        { version: '1.2.3-alpha1', count: 2 }
      ],
      cloud: undefined
    },
    b: {
      count: 3,
      versions: [
        { version: '2.3.4-rc1', count: 1 },
        { version: '2.3.4', count: 1 }
      ],
      cloud: undefined
    },
    c: {
      count: 4,
      versions: [
        { version: '5.6.1', count: 4 }
      ],
      cloud: [
        {
          name: cloudName,
          count: 4,
          vms: 2,
          vm_types: [
            { vm_type: 'x1', count: 1 },
            { vm_type: 'ps4', count: 2 }
          ],
          regions: [
            { region: 'abc-123', count: 1 },
            { region: 'def-123', count: 2 }
          ],
          zones: [
            { zone: 'def-123-A', count: 2 }
          ]
        }
      ]
    }
  };
  const clusterUuids = Object.keys(expectedClusters);

  describe('getHighLevelStats', () => {
    it('returns clusters', async () => {
      callWith.withArgs('search').returns(Promise.resolve(response));

      expect(await getHighLevelStats(server, callWith, clusterUuids, start, end, product)).to.eql(expectedClusters);
    });
  });

  describe('fetchHighLevelStats', () => {
    it('searches for clusters', async () => {
      callWith.returns(Promise.resolve(response));

      expect(await fetchHighLevelStats(server, callWith, clusterUuids, start, end, product)).to.be(response);
    });
  });

  describe('handleHighLevelStatsResponse', () => {
    // filterPath makes it easy to ignore anything unexpected because it will come back empty
    it('handles unexpected response', () => {
      const clusters = handleHighLevelStatsResponse({}, product);

      expect(clusters).to.eql({});
    });

    it('handles valid response', () => {
      const clusters = handleHighLevelStatsResponse(response, product);

      expect(clusters).to.eql(expectedClusters);
    });

    it('handles no hits response', () => {
      const clusters = handleHighLevelStatsResponse({ hits: { hits: [ ] } }, product);

      expect(clusters).to.eql({});
    });
  });
});
