import { type GeoBoundingBox } from '@/models';
import { isCardinalBoundingBox } from '../utils';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function MapIndicator(props: { geoBoundingBox: GeoBoundingBox }) {

  const { geoBoundingBox } = props;

  const calculateCenter = (geoBoundingBox: GeoBoundingBox) => {
    if(isCardinalBoundingBox(geoBoundingBox)) {
      return {
        lat: (geoBoundingBox.left + geoBoundingBox.right) / 2,
        lon: (geoBoundingBox.top + geoBoundingBox.bottom) / 2
      }
    }
    else if('bottom_left' in geoBoundingBox) {
     return {
        lat: (geoBoundingBox.bottom_left.lat + geoBoundingBox.top_right.lat) / 2,
        lon: (geoBoundingBox.bottom_left.lon + geoBoundingBox.top_right.lon) / 2
      }
    }
    return {
      lat: (geoBoundingBox.bottom_right.lat + geoBoundingBox.top_left.lat) / 2,
      lon: (geoBoundingBox.bottom_right.lon + geoBoundingBox.top_left.lon) / 2
    }
  }

  const centerPoint = calculateCenter(geoBoundingBox);
  const mapCenter: [number, number] = [centerPoint.lat, centerPoint.lon];

  console.log(centerPoint);

  return (
      <MapContainer style={{ height: "400px" }} center={mapCenter} zoom={10} scrollWheelZoom={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={[centerPoint.lat, centerPoint.lon]} />
    </MapContainer>
  );

}