import OlView from 'ol/View';
import OlMap from 'ol/Map';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlMapBrowserEvent from 'ol/MapBrowserEvent';

/**
 * A set of some useful static helper methods.
 *
 * @class
 */
export class TestUtil {

  static mapDivId = 'map';
  static mapDivHeight = 256;
  static mapDivWidth = 256;

  /**
   * Creates and applies a map <div> element to the body.
   *
   * @return {HTMLElement} The mounted <div> element.
   */
  static mountMapDiv = () => {
    var div = document.createElement('div');
    var style = div.style;

    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = TestUtil.mapDivWidth + 'px';
    style.height = TestUtil.mapDivHeight + 'px';
    div.id = TestUtil.mapDivId;

    document.body.appendChild(div);

    return div;
  };

  /**
   * Removes the map div element from the body.
   */
  static unmountMapDiv = () => {
    let div = document.querySelector(`div#${TestUtil.mapDivId}`);
    if (!div) {
      return;
    }
    let parent = div.parentNode;
    if (parent) {
      parent.removeChild(div);
    }
    div = null;
  };

  /**
   * Creates an OpenLayers map.
   *
   * @param {import("ol/PluggableMap").MapOptions & { resolutions: number[] }} mapOpts Additional options for the map to create.
   * @return {import("ol/Map").default} The ol map.
   */
  static createMap = (mapOpts) => {
    let source = new OlSourceVector();
    let layer = new OlLayerVector({source: source});
    let targetDiv = TestUtil.mountMapDiv();
    let defaultMapOpts = {
      target: targetDiv,
      layers: [layer],
      view: new OlView({
        center: [829729, 6708850],
        resolution: 1,
        resolutions: mapOpts ? mapOpts.resolutions : undefined
      })
    };

    Object.assign(defaultMapOpts, mapOpts);

    let map = new OlMap(defaultMapOpts);

    map.renderSync();

    return map;
  };

  /**
   * Removes the map.
   *
   * @param {OlMap|undefined} map
   */
  static removeMap = (map) => {
    if (map instanceof OlMap) {
      map.dispose();
    }
    TestUtil.unmountMapDiv();
  };

  /**
   * Simulates a browser pointer event on the map viewport.
   * Origin: https://github.com/openlayers/openlayers/blob/master/test/spec/ol/interaction/draw.test.js#L67
   *
   * @param {import("ol/Map").default} map The map to use.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {boolean} opt_shiftKey Shift key is pressed
   * @param {boolean} dragging Whether the map is being dragged or not.
   */
  static simulatePointerEvent = (map, type, x, y, opt_shiftKey, dragging) => {
    let viewport = map.getViewport();
    // Calculated in case body has top < 0 (test runner with small window).
    let position = viewport.getBoundingClientRect();
    let shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false;
    const event = new MouseEvent(type);
    // @ts-ignore
    event.clientX = position.left + x + TestUtil.mapDivWidth / 2;
    // @ts-ignore
    event.clientY = position.top + y + TestUtil.mapDivHeight / 2;
    // @ts-ignore
    event.shiftKey = shiftKey;
    map.handleMapBrowserEvent(new OlMapBrowserEvent(type, map, event, dragging));
  };

  /**
   * Creates and returns an empty vector layer.
   *
   * @param {Object} properties The properties to set.
   * @return {OlLayerVector<OlSourceVector>} The layer.
   */
  static createVectorLayer = (properties) => {
    let source = new OlSourceVector();
    let layer = new OlLayerVector({source: source});

    layer.setProperties(properties);

    return layer;
  };

  /**
   * Returns a point feature with a random position.
   * @type {Object}
   */
  static generatePointFeature = ((props = {
    ATTR_1: Math.random() * 100,
    ATTR_2: 'Borsigplatz 9',
    ATTR_3: 'Dortmund'
  }) => {
    const coords = [
      Math.floor(Math.random() * 180) - 180,
      Math.floor(Math.random() * 90) - 90
    ];
    const geom = new OlGeomPoint(coords);
    const feat = new OlFeature({
      geometry: geom
    });

    feat.setProperties(props);

    return feat;
  });

}

export default TestUtil;
