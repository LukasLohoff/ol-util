/*eslint-env jest*/

import OlInteractionDragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import OlInteractionDraw from 'ol/interaction/Draw';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerImage from 'ol/layer/Image';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlLayerGroup from 'ol/layer/Group';
import OlMap from 'ol/Map';
import OlView from 'ol/View';

import TestUtil from '../TestUtil';

import {
  MapUtil,
} from '../index';

describe('MapUtil', () => {
  const testResolutions = {
    degrees: 0.000004807292355257246,
    m: 0.5345462690925383,
    ft: 1.7537607253692198,
    'us-ft': 1.7537572178477696
  };
  const testScale = 1909.09;

  let map;


  beforeEach(() => {
    map = TestUtil.createMap();
  });

  afterEach(() => {
    TestUtil.removeMap(map);
  });

  it('is defined', () => {
    expect(MapUtil).toBeDefined();
  });

  describe('#getInteractionsByName', () => {
    it('is defined', () => {
      expect(MapUtil.getInteractionsByName).toBeDefined();
    });

    it('returns an empty array if no interaction candidate is found', () => {
      let dragInteractionName = 'Drag Queen';
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      dragInteraction.set('name', dragInteractionName);
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByName(
        map, `${dragInteractionName} NOT AVAILABLE`);

      expect(returnedInteractions).toHaveLength(0);
    });

    it('returns the requested interactions by name', () => {
      let dragInteractionName = 'Drag Queen';
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      dragInteraction.set('name', dragInteractionName);
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByName(
        map, dragInteractionName);

      expect(returnedInteractions).toHaveLength(1);

      let anotherDragInteraction = new OlInteractionDragRotateAndZoom();
      anotherDragInteraction.set('name', dragInteractionName);
      map.addInteraction(anotherDragInteraction);

      returnedInteractions = MapUtil.getInteractionsByName(
        map, dragInteractionName);

      expect(returnedInteractions).toHaveLength(2);
    });
  });

  describe('#getInteractionsByClass', () => {
    it('is defined', () => {
      expect(MapUtil.getInteractionsByClass).toBeDefined();
    });

    it('returns an empty array if no interaction candidate is found', () => {
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByClass(
        map, OlInteractionDraw);

      expect(returnedInteractions).toHaveLength(0);
    });

    it('returns the requested interactions by class', () => {
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByClass(
        map, OlInteractionDragRotateAndZoom);

      expect(returnedInteractions).toHaveLength(1);

      let anotherDragInteraction = new OlInteractionDragRotateAndZoom();
      map.addInteraction(anotherDragInteraction);

      returnedInteractions = MapUtil.getInteractionsByClass(
        map, OlInteractionDragRotateAndZoom);

      expect(returnedInteractions).toHaveLength(2);
    });
  });

  describe('#getResolutionForScale', () => {
    it('is defined', () => {
      expect(MapUtil.getResolutionForScale).toBeDefined();
    });

    it('returns expected values for valid units', () => {
      const units = ['degrees', 'm', 'ft', 'us-ft'];
      units.forEach( (unit) => {
        expect(MapUtil.getResolutionForScale(testScale, unit)).toBe(testResolutions[unit]);
      });
    });

    it('returns inverse of getScaleForResolution', () => {
      const unit = 'm';
      const resolutionToTest = 190919.09;
      const calculateScale = MapUtil.getScaleForResolution(resolutionToTest, unit);
      expect(MapUtil.getResolutionForScale(calculateScale, unit)).toBe(resolutionToTest);
    });
  });

  describe('#getScaleForResolution', () => {
    it('is defined', () => {
      expect(MapUtil.getScaleForResolution).toBeDefined();
    });

    it('returns expected values for valid units', () => {
      const units = ['degrees', 'm', 'ft', 'us-ft'];

      /**
       * Helper method to round number to two floating digits
       */
      const roundToTwoDecimals = (num) => (Math.round(num * 100) / 100);

      units.forEach( (unit) => {
        expect(roundToTwoDecimals(MapUtil.getScaleForResolution(testResolutions[unit], unit))).toBe(testScale);
      });
    });

    it('returns inverse of getResolutionForScale', () => {
      const unit = 'm';
      const calculateScale = MapUtil.getResolutionForScale(testScale, unit);
      expect(MapUtil.getScaleForResolution(calculateScale, unit)).toBe(testScale);
    });
  });

  describe('#getLayerByName', () => {
    it('returns the layer by the given name', () => {
      const layerName = 'Peter';
      const layer = new OlLayerTile({
        name: layerName
      });
      map.addLayer(layer);
      const got = MapUtil.getLayerByName(map, layerName);

      expect(got).toBe(layer);
    });

    it('returns undefined if the layer could not be found', () => {
      const layerName = 'OSM-WMS';
      const got = MapUtil.getLayerByName(map, layerName);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayerByNameParam', () => {
    it('returns the layer by the given name', () => {
      const layerName = 'OSM-WMS';
      const layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            'LAYERS': layerName,
            'TILED': true
          }
        })
      });
      layer.set('key', 'prop');
      map.addLayer(layer);
      const got = MapUtil.getLayerByNameParam(map, layerName);

      expect(got).toBeInstanceOf(OlLayerTile);
      expect(got.get('key')).toBe('prop');
    });

    it('returns undefined if the layer could not be found', () => {
      const layerName = 'OSM-WMS';
      const got = MapUtil.getLayerByNameParam(map, layerName);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayerByFeature', () => {
    it('returns the layer by the given feature', () => {
      let namespace = 'BVB_NAMESPACE';
      let layerName = 'BVB';
      let qualifiedLayerName = `${namespace}:${layerName}`;

      let featId = `${layerName}.1909`;
      let feat = new OlFeature({
        geometry: new OlGeomPoint({
          coordinates: [1909, 1909]
        })
      });
      feat.setId(featId);

      let layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            'LAYERS': qualifiedLayerName,
            'TILED': true
          }
        })
      });
      layer.set('key', 'prop');
      map.addLayer(layer);
      let got = MapUtil.getLayerByFeature(map, feat, [namespace]);

      expect(got).toBeInstanceOf(OlLayerTile);
      expect(got.get('key')).toBe('prop');
    });

    it('returns undefined if the layer could not be found', () => {
      let namespace = 'BVB_NAMESPACE';
      let layerName = 'BVB';
      let qualifiedLayerName = `${namespace}:${layerName}`;
      let featId = `${layerName}_INVALID.1909`;
      let feat = new OlFeature({
        geometry: new OlGeomPoint({
          coordinates: [1909, 1909]
        })
      });
      feat.setId(featId);

      let layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            'LAYERS': qualifiedLayerName,
            'TILED': true
          }
        })
      });
      map.addLayer(layer);
      let got = MapUtil.getLayerByFeature(map, feat, [namespace]);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayersByGroup', () => {
    it('returns a flattened array of layers out of a given layergroup', () => {
      let layerGroup = new OlLayerGroup({
        layers: [
          TestUtil.createVectorLayer({name: 'Layer 1'}),
          TestUtil.createVectorLayer({name: 'Layer 2'}),
          new OlLayerGroup({
            layers: [
              TestUtil.createVectorLayer({name: 'Sublayer 1'}),
              TestUtil.createVectorLayer({name: 'Sublayer 2'}),
              new OlLayerGroup({
                layers: [
                  TestUtil.createVectorLayer({name: 'Subsublayer 1'}),
                  TestUtil.createVectorLayer({name: 'Subsublayer 2'}),
                ]
              }),
              TestUtil.createVectorLayer({name: 'Sublayer 3'})
            ]
          }),
          TestUtil.createVectorLayer({name: 'Layer 3'})
        ]
      });

      map.setLayerGroup(layerGroup);
      let got = MapUtil.getLayersByGroup(map, layerGroup);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(8);
    });
  });

  describe('#getAllLayers', () => {
    let subLayer;
    let nestedLayerGroup;
    let layer1;
    let layer2;
    let layerGroup;

    beforeEach(() => {
      const layerSource1 = new OlSourceTileWMS();
      layer1 = new OlLayerTile({
        name: 'layer1',
        source: layerSource1
      });
      const layerSource2 = new OlSourceTileWMS();
      layer2 = new OlLayerTile({
        name: 'layer2',
        visible: false,
        source: layerSource2
      });
      subLayer = new OlLayerTile({
        name: 'subLayer',
        source: new OlSourceTileWMS()
      });
      nestedLayerGroup = new OlLayerGroup({
        name: 'nestedLayerGroup',
        layers: [subLayer]
      });
      layerGroup = new OlLayerGroup({
        layers: [layer1, layer2, nestedLayerGroup]
      });
      map.setLayerGroup(layerGroup);
    });

    it('returns a flat list of all layers (map passed)', () => {
      const got = MapUtil.getAllLayers(map);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(4);
      expect(got).toContain(layer1);
      expect(got).toContain(layer2);
      expect(got).toContain(nestedLayerGroup);
      expect(got).toContain(subLayer);
    });

    it('returns a flat list of all layers (layergroup passed)', () => {
      const got = MapUtil.getAllLayers(nestedLayerGroup);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(1);
      expect(got).toContain(subLayer);
    });

    it('can be used with a filter', () => {
      const got = MapUtil.getAllLayers(map, l => l.get('name') === 'layer1');

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(1);
      expect(got).toContain(layer1);
    });

  });

  describe('getLayerPositionInfo', () => {
    let subLayer;
    let nestedLayerGroup;
    let layer1;
    let layer2;
    let layerGroup;

    beforeEach(() => {
      const layerSource1 = new OlSourceTileWMS();
      layer1 = new OlLayerTile({
        name: 'layer1',
        source: layerSource1
      });
      const layerSource2 = new OlSourceTileWMS();
      layer2 = new OlLayerTile({
        name: 'layer2',
        visible: false,
        source: layerSource2
      });
      subLayer = new OlLayerTile({
        name: 'subLayer',
        source: new OlSourceTileWMS()
      });
      nestedLayerGroup = new OlLayerGroup({
        name: 'nestedLayerGroup',
        layers: [subLayer]
      });
      layerGroup = new OlLayerGroup({
        layers: [layer1, layer2, nestedLayerGroup]
      });
      map.setLayerGroup(layerGroup);
    });

    it('uses the map if second argument is a map', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(layer1, map);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: layerGroup
      });
    });

    it('uses the layerGroup if given as second argument', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(subLayer, nestedLayerGroup);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: nestedLayerGroup
      });
    });

    it('works iterative', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(subLayer, map);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: nestedLayerGroup
      });
    });

  });

  describe('getLegendGraphicUrl', () => {

    let layer1;
    let layer2;
    let layer3;

    beforeEach(() => {
      layer1 = new OlLayerTile({
        name: 'OSM-WMS',
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm-gray/service?',
          params: {'LAYERS': 'OSM-WMS', 'TILED': true},
          serverType: 'geoserver'
        })
      });
      layer2 = new OlLayerImage({
        name: 'OSM-WMS',
        source: new OlSourceImageWMS({
          url: 'https://ows.terrestris.de/osm-gray/service',
          params: {'LAYERS': 'OSM-WMS', 'TILED': true},
          serverType: 'geoserver'
        })
      });
      layer3 = new OlLayerTile({
        name: 'OSM-WMS',
        source: new OlSourceTileWMS({
          urls: [
            'https://a.example.com/service?humpty=dumpty',
            'https://b.example.com/service?foo=bar'
          ],
          params: {'LAYERS': 'OSM-WMS', 'TILED': true},
          serverType: 'geoserver'
        })
      });
    });

    describe('returns a getLegendGraphicUrl from a given layer', () => {
      it('… for a tiled Layer', () => {
        const legendUrl = MapUtil.getLegendGraphicUrl(layer1);
        const url = 'https://ows.terrestris.de/osm-gray/service?';
        const layerParam = 'LAYER=OSM-WMS';
        const versionParam = 'VERSION=1.3.0';
        const serviceParam = 'SERVICE=WMS';
        const requestParam = 'REQUEST=getLegendGraphic';
        const formatParam = 'FORMAT=image%2Fpng';

        expect(legendUrl).toContain(url);
        expect(legendUrl).toContain(layerParam);
        expect(legendUrl).toContain(versionParam);
        expect(legendUrl).toContain(serviceParam);
        expect(legendUrl).toContain(requestParam);
        expect(legendUrl).toContain(formatParam);
      });
      it('… for an image Layer', () => {
        const legendUrl = MapUtil.getLegendGraphicUrl(layer2);
        const url = 'https://ows.terrestris.de/osm-gray/service?';
        const layerParam = 'LAYER=OSM-WMS';
        const versionParam = 'VERSION=1.3.0';
        const serviceParam = 'SERVICE=WMS';
        const requestParam = 'REQUEST=getLegendGraphic';
        const formatParam = 'FORMAT=image%2Fpng';

        expect(legendUrl).toContain(url);
        expect(legendUrl).toContain(layerParam);
        expect(legendUrl).toContain(versionParam);
        expect(legendUrl).toContain(serviceParam);
        expect(legendUrl).toContain(requestParam);
        expect(legendUrl).toContain(formatParam);
      });
    });

    it('does not append multiple questionmarks in URL', () => {
      const legendUrl = MapUtil.getLegendGraphicUrl(layer1);
      const numQuestionMarks = (legendUrl.match(/\?/g) || []).length;
      expect(legendUrl).toEqual(expect.stringContaining('?'));
      expect(legendUrl).toEqual(expect.not.stringContaining('??'));
      expect(numQuestionMarks).toEqual(1);
    });

    it('works as expected when layer URL contains params', () => {
      const legendUrl = MapUtil.getLegendGraphicUrl(layer3);
      const numQuestionMarks = (legendUrl.match(/\?/g) || []).length;
      const containsParams = /humpty=dumpty/.test(legendUrl);
      expect(numQuestionMarks).toEqual(1);
      expect(containsParams).toBe(true);
    });

    it('accepts extraParams for the request', () => {
      const extraParams = {
        HEIGHT: 10,
        WIDTH: 10
      };
      const legendUrl = MapUtil.getLegendGraphicUrl(layer1, extraParams);
      const url = 'https://ows.terrestris.de/osm-gray/service?';
      const layerParam = 'LAYER=OSM-WMS';
      const versionParam = 'VERSION=1.3.0';
      const serviceParam = 'SERVICE=WMS';
      const requestParam = 'REQUEST=getLegendGraphic';
      const formatParam = 'FORMAT=image%2Fpng';
      const heightParam = 'HEIGHT=10';
      const widthParam = 'WIDTH=10';

      expect(legendUrl).toContain(url);
      expect(legendUrl).toContain(layerParam);
      expect(legendUrl).toContain(versionParam);
      expect(legendUrl).toContain(serviceParam);
      expect(legendUrl).toContain(requestParam);
      expect(legendUrl).toContain(formatParam);
      expect(legendUrl).toContain(heightParam);
      expect(legendUrl).toContain(widthParam);
    });

  });

  describe('layerInResolutionRange', () => {
    it('is defined', () => {
      expect(MapUtil.layerInResolutionRange).not.toBeUndefined();
    });
    it('is a function', () => {
      expect(MapUtil.layerInResolutionRange).toBeInstanceOf(Function);
    });
    it('returns false if not passed a layer', () => {
      expect(MapUtil.layerInResolutionRange()).toBe(false);
    });
    it('returns false if not passed a map', () => {
      const layer = new OlLayerTile();
      expect(MapUtil.layerInResolutionRange(layer)).toBe(false);
    });
    it('returns false if map does not have a view', () => {
      const layer = new OlLayerTile();
      const map = new OlMap({view: null});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });
    it('returns false if map view does not have a resolution', () => {
      const layer = new OlLayerTile();
      const view = new OlView();
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });

    it('returns true: layer (no limits) & any viewRes', () => {
      const layer = new OlLayerTile();
      const view = new OlView({resolution: 42});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns true: layer (w/ minResolution) & viewRes > l.minres', () => {
      const layer = new OlLayerTile({
        minResolution: 42
      });
      const view = new OlView({resolution: 43});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns true: layer (w/ minResolution) & viewRes = l.minres', () => {
      const layer = new OlLayerTile({
        minResolution: 42
      });
      const view = new OlView({resolution: 42});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns true: layer (w/ maxResolution) & viewRes < l.maxres', () => {
      const layer = new OlLayerTile({
        maxResolution: 42
      });
      const view = new OlView({resolution: 41});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns false: layer (w/ maxResolution) & viewRes = l.maxres', () => {
      const layer = new OlLayerTile({
        maxResolution: 42
      });
      const view = new OlView({resolution: 42});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });

    it('returns true: layer (w/ min and max) & viewRes  within', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 46});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns false: layer (w/ min and max) & viewRes outside min', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 38});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });

    it('returns true: layer (w/ min and max) & viewRes = min', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 42});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(true);
    });

    it('returns false: layer (w/ min and max) & viewRes outside max', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 54});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });

    it('returns false: layer (w/ min and max) & viewRes = max', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 50});
      const map = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, map)).toBe(false);
    });
  });

  describe('#getLayersByProperty', () => {
    it('is defined', () => {
      expect(MapUtil.getLayersByProperty).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(MapUtil.getLayersByProperty).toBeInstanceOf(Function);
    });

    it('returns the layer for the given property', () => {
      const key = 'key';
      const prop = 'prop';
      const layer = new OlLayerTile({
        visible: false
      });
      layer.set(key, prop);
      map.addLayer(layer);

      const got = MapUtil.getLayersByProperty(map, key, prop);

      expect(got).toHaveLength(1);
      expect(got[0]).toEqual(layer);
      expect(got[0]).toBeInstanceOf(OlLayerTile);
      expect(got[0].get('key')).toBe('prop');
    });
  });

  describe('#getZoomForScale', () => {
    it('is defined', () => {
      expect(MapUtil.getZoomForScale).toBeDefined();
    });

    it('returns 0 if non numeric scale is provided', () => {
      const got = MapUtil.getZoomForScale('scale', [1, 2]);
      expect(got).toBe(0);
    });

    it('returns 0 if negative scale is provided', () => {
      const got = MapUtil.getZoomForScale(-1, [1, 2]);
      expect(got).toBe(0);
    });

    it('calls getResolutionForScale method', () => {
      const spy = jest.spyOn(MapUtil, 'getResolutionForScale');
      MapUtil.getZoomForScale(2000, [1, 2, 3]);

      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it('returns zoom level for provided resolution', () => {
      const mercatorResolutions = [
        1.19432856696, // 4265
        0.597164283478, // 2132
        0.298582141739, // 1066
        0.149291070869 // 533
      ];
      const testScales = [5000, 2500, 1000, 500];
      let index = 0;

      testScales.forEach(scale => {
        expect(MapUtil.getZoomForScale(scale, mercatorResolutions)).toBe(index);
        index++;
      });
    });
  });

  describe('#zoomToFeatures', () => {
    const features = [
      new OlFeature({
        geometry: new OlGeomPoint([0, 0])
      }),
      new OlFeature({
        geometry: new OlGeomPoint([1, 1])
      }),
      new OlFeature({
        geometry: new OlGeomPoint([2, 2])
      })
    ];

    it('is defined', () => {
      expect(MapUtil.zoomToFeatures).toBeDefined();
    });

    it('fits the view extent to the extent of the given features', () => {
      const view = new OlView({
        zoom: 19,
        constrainResolution: true
      });
      const map = new OlMap({view: view});

      MapUtil.zoomToFeatures(map, features);
      const extent = view.calculateExtent();

      expect(extent[0]).toBeCloseTo(-0.866138385868561);
      expect(extent[1]).toBeCloseTo(-0.866138385868561);
      expect(extent[2]).toBeCloseTo(2.866138385868561);
      expect(extent[3]).toBeCloseTo(2.866138385868561);
    });
  });

  describe('#isInScaleRange', () => {
    it('is defined', () => {
      expect(MapUtil.isInScaleRange).toBeDefined();
    });

    it('returns the visibility of a given layer', () => {
      const layer = TestUtil.createVectorLayer();

      let inScaleRange = MapUtil.isInScaleRange(layer, 5);
      expect(inScaleRange).toBe(true);

      layer.setProperties({
        minResolution: 0,
        maxResolution: 10
      });

      inScaleRange = MapUtil.isInScaleRange(layer, 5);
      expect(inScaleRange).toBe(true);

      inScaleRange = MapUtil.isInScaleRange(layer, 15);
      expect(inScaleRange).toBe(false);
    });
  });
});
