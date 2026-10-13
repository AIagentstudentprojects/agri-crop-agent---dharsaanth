export interface DetectedLocationResult {
  placeName: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'ip' | 'fallback';
  message: string;
}

/**
 * Reverse geocodes coordinates to a human-readable village/town/district/state
 */
export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        return data.name;
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }
  return `Farm Location (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
}

/**
 * Fallback to IP-based location detection when browser GPS is blocked, denied or unavailable
 */
export async function detectIpLocation(): Promise<DetectedLocationResult> {
  try {
    const res = await fetch('/api/detect-ip-location');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const resolvedName =
          data.name || `${data.city || 'Detected Region'}, ${data.country || ''}`;
        return {
          placeName: resolvedName,
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip',
          message: `Network location detected: ${resolvedName}`,
        };
      }
    }
  } catch (err) {
    console.warn('IP location detection error:', err);
  }

  // Graceful default if IP detection is unavailable
  return {
    placeName: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    source: 'fallback',
    message: 'Default agricultural region loaded (Pune, Maharashtra)',
  };
}

/**
 * Detects the farmer's live location with high accuracy GPS first, then falls back to IP
 */
export async function getLiveFarmerLocation(): Promise<DetectedLocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return await detectIpLocation();
  }

  return new Promise((resolve) => {
    let resolved = false;

    // Safety timeout in case GPS prompt hangs
    const safetyTimeout = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        const ipResult = await detectIpLocation();
        resolve({
          ...ipResult,
          message: 'GPS response timed out. Using network location.',
        });
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimeout);

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const placeName = await reverseGeocodeCoordinates(lat, lon);

        resolve({
          placeName,
          latitude: lat,
          longitude: lon,
          source: 'gps',
          message: `Live GPS locked: ${placeName}`,
        });
      },
      async (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimeout);

        console.info('GPS not accessible, trying network IP fallback:', err.message);
        const ipResult = await detectIpLocation();
        resolve({
          ...ipResult,
          message: 'GPS unavailable. Network location detected.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}
