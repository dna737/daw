import { type GeoBoundingBox } from '@/models';
import { isCardinalBoundingBox, isDiagonalBoundingBox } from '../utils';
import { Map, Marker } from 'pigeon-maps';

export default function MapIndicator(props: { geoBoundingBox: GeoBoundingBox | undefined, type: string | undefined}) {

  const { geoBoundingBox, type } = props;

  console.log("geoBoundingBox", geoBoundingBox, type);
  if(!geoBoundingBox || !isCardinalBoundingBox(geoBoundingBox) || !isDiagonalBoundingBox(geoBoundingBox) || !type) {
    return null;
  }

  const calculateCenter = (geoBoundingBox: GeoBoundingBox) => {
    if(type === "edges" && isCardinalBoundingBox(geoBoundingBox)) {
      console.log("cardinal", geoBoundingBox, typeof geoBoundingBox.left, typeof geoBoundingBox.right);
      console.log("cardinal", (geoBoundingBox.left + geoBoundingBox.right) / 2);
      return {
        lon: (geoBoundingBox.left + geoBoundingBox.right) / 2,
        lat: (geoBoundingBox.top + geoBoundingBox.bottom) / 2
      }
    }
    else if(type === "upper_diagonal" && 'bottom_left' in geoBoundingBox) {
     return {
        lat: (geoBoundingBox.bottom_left.lat + geoBoundingBox.top_right.lat) / 2,
        lon: (geoBoundingBox.bottom_left.lon + geoBoundingBox.top_right.lon) / 2
      }
    }
    else if(type === "lower_diagonal" && 'bottom_right' in geoBoundingBox) {
      return {
      lat: (geoBoundingBox.bottom_right.lat + geoBoundingBox.top_left.lat) / 2,
      lon: (geoBoundingBox.bottom_right.lon + geoBoundingBox.top_left.lon) / 2
      }
    }
    return {
      lat: 0,
      lon: 0
    }
  }


  const getMarkers = () => {

    if(type === "edges" && isCardinalBoundingBox(geoBoundingBox)) {

      return [
        {
          lat: geoBoundingBox.top,
          lon: geoBoundingBox.left
        },
        {
          lat: geoBoundingBox.top,
          lon: geoBoundingBox.right
        },
        {
          lat: geoBoundingBox.bottom,
          lon: geoBoundingBox.right
        },
        {
          lat: geoBoundingBox.bottom,
          lon: geoBoundingBox.left
        }
      ]
    }
    else if(type === "upper_diagonal" && 'bottom_left' in geoBoundingBox) {
      return [
        {
          lat: geoBoundingBox.bottom_left.lat,
          lon: geoBoundingBox.bottom_left.lon
        },
        {
          lat: geoBoundingBox.top_right.lat,
          lon: geoBoundingBox.top_right.lon
        }
      ]
    }
    else if(type === "lower_diagonal" && 'bottom_right' in geoBoundingBox) {
      return [
        {
          lat: geoBoundingBox.bottom_right.lat,
          lon: geoBoundingBox.bottom_right.lon
        },
        {
          lat: geoBoundingBox.top_left.lat,
          lon: geoBoundingBox.top_left.lon
        }
      ]
    }
    return [];
  }

  const centerPoint = calculateCenter(geoBoundingBox);
  console.log("centerPoint", centerPoint);
  const mapCenter: [number, number] = [centerPoint.lat, centerPoint.lon];

  return (
    <Map height={300} defaultCenter={mapCenter} defaultZoom={3} center={mapCenter} zoom={3}>
      {getMarkers().map((marker, index) => (
        // TODO: Make the marker interactive
        <Marker key={index} width={50} anchor={[marker.lat, marker.lon]} />
      ))}
    </Map>
  )
}
