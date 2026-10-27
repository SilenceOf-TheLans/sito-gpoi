const cloudModules = import.meta.glob('../../assets/point_clouds/*.{json,bin}', {
  eager: true,
  query: '?url',
  import: 'default'
});

export const pointClouds = Object.entries(cloudModules)
  .sort(([first], [second]) => first.localeCompare(second))
  .map(([path, url]) => {
    const file = path.split('/').pop();
    const stem = file.replace(/\.[^.]+$/, '');

    return {
      file,
      name: stem.replace(/[_-]+/g, ' ').toUpperCase(),
      url
    };
  });

const DEFAULT_CLOUD = 'iris_orion_hub_spoke';

export function resolvePointCloud(search = window.location.search) {
  const requested = new URLSearchParams(search).get('cloud');

  return (
    pointClouds.find((cloud) => cloud.file.replace(/\.[^.]+$/, '') === requested) ||
    pointClouds.find((cloud) => cloud.file.replace(/\.[^.]+$/, '') === DEFAULT_CLOUD) ||
    pointClouds[0] ||
    null
  );
}
