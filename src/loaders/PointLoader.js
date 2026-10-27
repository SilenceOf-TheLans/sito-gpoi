function deriveName(url) {
  const path = new URL(url, window.location.href).pathname;
  const file = decodeURIComponent(path.split('/').pop() || 'POINT CLOUD');
  return file.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').toUpperCase();
}

function validatePositions(positions) {
  if (positions.length === 0 || positions.length % 3 !== 0) {
    throw new Error('Point cloud positions must contain a non-empty multiple of three values.');
  }

  for (let index = 0; index < positions.length; index += 1) {
    if (!Number.isFinite(positions[index])) {
      throw new Error(`Point cloud contains an invalid coordinate at index ${index}.`);
    }
  }
}

export async function loadPointCloud(url, { name } = {}) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Point cloud request failed (${response.status} ${response.statusText}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  const isBinary = /\.bin(?:$|[?#])/i.test(url) || /application\/octet-stream/i.test(contentType);
  let positions;
  let payloadName;

  if (isBinary) {
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength === 0 || buffer.byteLength % 4 !== 0) {
      throw new Error('Binary point cloud must be a non-empty Float32 buffer.');
    }

    positions = new Float32Array(buffer);
  } else {
    const payload = await response.json();
    const source = Array.isArray(payload) ? payload : payload?.positions;

    if (!Array.isArray(source)) {
      throw new Error('Point cloud JSON must be an array or an object with a "positions" array.');
    }

    if (!Array.isArray(payload) && typeof payload.name === 'string') {
      payloadName = payload.name;
    }

    positions = Array.isArray(source[0]) ? Float32Array.from(source.flat()) : Float32Array.from(source);
  }

  validatePositions(positions);

  return {
    positions,
    count: positions.length / 3,
    name: name || payloadName || deriveName(url)
  };
}
