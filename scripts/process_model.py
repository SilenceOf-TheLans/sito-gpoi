import argparse
import array
import bisect
import json
import math
import random
import sys
from pathlib import Path


def read_obj(path):
    vertices = []
    triangles = []

    with path.open("r", encoding="utf-8", errors="ignore") as handle:
        for line_number, line in enumerate(handle, 1):
            parts = line.split()

            if not parts:
                continue

            tag = parts[0]

            if tag == "v":
                if len(parts) < 4:
                    raise ValueError(f"{path}:{line_number}: malformed vertex line.")
                try:
                    vertices.append((float(parts[1]), float(parts[2]), float(parts[3])))
                except ValueError as error:
                    raise ValueError(
                        f"{path}:{line_number}: vertex coordinates must be numeric."
                    ) from error

            elif tag == "f":
                if len(parts) < 4:
                    continue
                indices = []

                for token in parts[1:]:
                    raw_index = token.split("/")[0]

                    if not raw_index:
                        continue

                    index = int(raw_index)
                    resolved = index - 1 if index > 0 else len(vertices) + index

                    if resolved < 0 or resolved >= len(vertices):
                        raise ValueError(
                            f"{path}:{line_number}: face index {index} is out of range."
                        )

                    indices.append(resolved)

                for offset in range(1, len(indices) - 1):
                    triangles.append((indices[0], indices[offset], indices[offset + 1]))

    if not vertices:
        raise ValueError("The OBJ file does not contain any vertices.")
    if not triangles:
        raise ValueError("The OBJ file does not contain any faces.")

    return vertices, triangles


def normalize_vertices(vertices, radius):
    min_x = min(vertex[0] for vertex in vertices)
    min_y = min(vertex[1] for vertex in vertices)
    min_z = min(vertex[2] for vertex in vertices)
    max_x = max(vertex[0] for vertex in vertices)
    max_y = max(vertex[1] for vertex in vertices)
    max_z = max(vertex[2] for vertex in vertices)

    center = ((min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2)
    centered = [
        (x - center[0], y - center[1], z - center[2]) for x, y, z in vertices
    ]
    max_distance = max(math.sqrt(x * x + y * y + z * z) for x, y, z in centered)

    if max_distance <= 1e-12:
        raise ValueError("The model has zero size after centering.")

    scale = radius / max_distance
    return [(x * scale, y * scale, z * scale) for x, y, z in centered]


def triangle_area(first, second, third):
    ab = (second[0] - first[0], second[1] - first[1], second[2] - first[2])
    ac = (third[0] - first[0], third[1] - first[1], third[2] - first[2])
    cross = (
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
    )
    return 0.5 * math.sqrt(cross[0] ** 2 + cross[1] ** 2 + cross[2] ** 2)


def sample_surface(vertices, triangles, count, seed):
    valid_triangles = []
    cumulative = []
    total_area = 0.0

    for triangle in triangles:
        area = triangle_area(
            vertices[triangle[0]], vertices[triangle[1]], vertices[triangle[2]]
        )

        if area <= 1e-14:
            continue

        total_area += area
        valid_triangles.append(triangle)
        cumulative.append(total_area)

    if not valid_triangles:
        raise ValueError("All model faces are degenerate; nothing to sample.")

    rng = random.Random(seed)
    points = []

    for _ in range(count):
        target = rng.random() * total_area
        index = bisect.bisect_left(cumulative, target)

        if index >= len(valid_triangles):
            index = len(valid_triangles) - 1

        first, second, third = valid_triangles[index]
        a = vertices[first]
        b = vertices[second]
        c = vertices[third]

        root = math.sqrt(rng.random())
        weight_b = root * (1 - rng.random())
        weight_c = root - weight_b
        weight_a = 1 - root

        points.append(
            (
                a[0] * weight_a + b[0] * weight_b + c[0] * weight_c,
                a[1] * weight_a + b[1] * weight_b + c[1] * weight_c,
                a[2] * weight_a + b[2] * weight_b + c[2] * weight_c,
            )
        )

    return points


def write_output(points, output, radius):
    flat = [coordinate for point in points for coordinate in point]
    suffix = output.suffix.lower()
    output.parent.mkdir(parents=True, exist_ok=True)

    if suffix == ".bin":
        buffer = array.array("f", flat)

        if sys.byteorder != "little":
            buffer.byteswap()

        output.write_bytes(buffer.tobytes())
    elif suffix == ".json":
        payload = {
            "name": output.stem.replace("_", " ").replace("-", " ").upper(),
            "pointCount": len(points),
            "radius": radius,
            "positions": [round(value, 5) for value in flat],
        }

        with output.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, separators=(",", ":"))
    else:
        raise ValueError("Output must use a .bin or .json extension.")


def main():
    parser = argparse.ArgumentParser(
        description="Sample an OBJ mesh surface into a normalized point cloud."
    )
    parser.add_argument("input", type=Path, help="Source OBJ mesh.")
    parser.add_argument("output", type=Path, help="Destination .bin or .json point cloud.")
    parser.add_argument(
        "--points", type=int, default=60000, help="Number of surface points to sample."
    )
    parser.add_argument(
        "--radius",
        type=float,
        default=5.0,
        help="Bounding-sphere radius used to normalize the model.",
    )
    parser.add_argument("--seed", type=int, default=7, help="Random seed.")
    args = parser.parse_args()

    if args.points <= 0:
        parser.error("--points must be positive.")
    if args.radius <= 0:
        parser.error("--radius must be positive.")
    if not args.input.is_file():
        parser.error(f"Input file not found: {args.input}")

    vertices, triangles = read_obj(args.input)
    vertices = normalize_vertices(vertices, args.radius)
    points = sample_surface(vertices, triangles, args.points, args.seed)
    write_output(points, args.output, args.radius)

    size = args.output.stat().st_size
    print(f"Input: {args.input}")
    print(f"Triangles: {len(triangles)}")
    print(f"Points: {len(points)}")
    print(f"Normalized radius: {args.radius}")
    print(f"Output: {args.output} ({size / 1024:.1f} KiB)")


if __name__ == "__main__":
    main()
