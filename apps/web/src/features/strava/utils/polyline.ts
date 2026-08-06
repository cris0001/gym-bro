// Decode a Google/Strava encoded polyline into [lat, lng] pairs. Standard algorithm:
// each coordinate is a zig-zag-encoded delta split into 5-bit chunks. Pure function.
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const nextDelta = (): number => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    // Undo the zig-zag: odd → negative.
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    lat += nextDelta();
    lng += nextDelta();
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
