import {getVectorContext} from 'ol/render';
import { unByKey } from 'ol/Observable';

/**
 * This class provides some static methods which might be helpful when working
 * with digitize functions to animate features.
 *
 * @class AnimateUtil
 */
class AnimateUtil {

  /**
   * Moves / translates an `OlFeature` to the given `pixel` delta in
   * in the end with given `duration` in ms, using the given style.
   *
   * @param {import("ol/Map").default} map An OlMap.
   * @param {import("ol/layer/Vector").default<import("ol/source/Vector").default>} layer A vector layer to receive an postrender event.
   * @param {import("ol/Feature").default} featureToMove The feature to move.
   * @param {number} duration The duration in ms for the moving to complete.
   * @param {number} pixel Delta of pixels to move the feature.
   * @param {import("ol/style/Style").default} [style] The style to use when moving the feature.
   *
   * @return {Promise<import("ol/Feature").default>} Promise of the moved feature.
   */
  static moveFeature(map, layer, featureToMove, duration, pixel, style) {
    return new Promise(resolve => {
      const geometry = featureToMove.getGeometry();
      if (!geometry) {
        throw new Error('Feature has no geometry.');
      }
      const start = Date.now();
      const resolution = map.getView().getResolution() ?? 0;
      const totalDisplacement = pixel * resolution;
      const expectedFrames = duration / 1000 * 60;
      let actualFrames = 0;
      const deltaX = totalDisplacement / expectedFrames;
      const deltaY = totalDisplacement / expectedFrames;

      /**
       * Moves the feature `pixel` right and `pixel` up.
       * @ignore
       */
      const listenerKey = layer.on('postrender', (event) => {
        const vectorContext = getVectorContext(event);
        const frameState = event.frameState;
        if (!frameState) {
          return;
        }
        const elapsed = frameState.time - start;

        geometry.translate(deltaX, deltaY);

        if (style) {
          vectorContext.setStyle(style);
        }
        vectorContext.drawGeometry(geometry);

        if (elapsed > duration || actualFrames >= expectedFrames) {
          unByKey(listenerKey);
          resolve(featureToMove);
        }
        // tell OpenLayers to continue postrender animation
        frameState.animate = true;

        actualFrames++;
        map.render();
      });
    });
  }
}

export default AnimateUtil;
