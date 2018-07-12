# ol-util

## A set of helper classes for working with openLayers

## API

### AnimateUtil

  - **moveFeature()**

### CapabilitiesUtil

  - **parseWmsCapabilities()**
  - **getLayersFromWmsCapabilties()**

### FeatureUtil

  - **getFeatureTypeName()**
  - **resolveAttributeTemplate()**

### FileUtil

  - **addGeojsonLayerFromFile()**
  - **addShpLayerFromFile()**
  - **addGeojsonLayer()**

### GeometryUtil

  - **splitByLine()**
  - **addBuffer()**
  - **mergeGeometries()**
  - **separateGeometries()**
  - **union()**
  - **difference()**
  - **intersection()**

### MapUtil

  - **getInteractionsByName()**
  - **getInteractionsByClass()**
  - **getResolutionForScale()**
  - **getScaleForResolution()**
  - **getAllLayers()**
  - **getLayerByOlUid()**
  - **getLayerByName()**
  - **getLayerByNameParam()**
  - **getLayerByFeature()**
  - **getLayersByGroup()**
  - **getLayersByProperty()**
  - **getLayerPositionInfo()**
  - **getLegendGraphicUrl()**
  - **layerInResolutionRange()**
  - **roundScale()**

### MeasureUtil

  - **getLength()**
  - **formatLength()**
  - **getArea()**
  - **formatArea()**
  - **angle()**
  - **angle360()**
  - **makeClockwise()**
  - **makeZeroDegreesAtNorth()**
  - **formatAngle()**

### ProjectionUtil

  - **initProj4Definitions()**
  - **initProj4DefinitionMappings()**

### WfsFilterUtil

  - **createWfsFilter()**
