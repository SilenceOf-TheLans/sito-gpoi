import argparse
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def center_point(u, p, q):
    ring = 2.0 + math.cos(q * u)
    return (
        ring * math.cos(p * u),
        ring * math.sin(p * u),
        -1.15 * math.sin(q * u),
    )


def subtract(first, second):
    return (
        first[0] - second[0],
        first[1] - second[1],
        first[2] - second[2],
    )


def cross(first, second):
    return (
        first[1] * second[2] - first[2] * second[1],
        first[2] * second[0] - first[0] * second[2],
        first[0] * second[1] - first[1] * second[0],
    )


def dot(first, second):
    return first[0] * second[0] + first[1] * second[1] + first[2] * second[2]


def normalize(vector):
    length = math.sqrt(dot(vector, vector))
    if length <= 1e-12:
        return (0.0, 0.0, 0.0)
    return (vector[0] / length, vector[1] / length, vector[2] / length)


def build_vertices(rings, tube_segments, tube_radius, p, q):
    vertices = []
    step = 1e-4

    for ring_index in range(rings):
        u = (ring_index / rings) * math.tau
        center = center_point(u, p, q)
        tangent = normalize(
            subtract(center_point(u + step, p, q), center_point(u - step, p, q))
        )
        reference = (0.0, 0.0, 1.0)

        if abs(dot(tangent, reference)) > 0.92:
            reference = (0.0, 1.0, 0.0)

        side = normalize(cross(tangent, reference))
        up = normalize(cross(side, tangent))

        for tube_index in range(tube_segments):
            v = (tube_index / tube_segments) * math.tau
            side_offset = math.cos(v) * tube_radius
            up_offset = math.sin(v) * tube_radius
            vertices.append(
                (
                    center[0] + side[0] * side_offset + up[0] * up_offset,
                    center[1] + side[1] * side_offset + up[1] * up_offset,
                    center[2] + side[2] * side_offset + up[2] * up_offset,
                )
            )

    return vertices


def build_faces(rings, tube_segments):
    faces = []

    for ring_index in range(rings):
        next_ring = (ring_index + 1) % rings

        for tube_index in range(tube_segments):
            next_tube = (tube_index + 1) % tube_segments
            first = ring_index * tube_segments + tube_index + 1
            second = ring_index * tube_segments + next_tube + 1
            third = next_ring * tube_segments + next_tube + 1
            fourth = next_ring * tube_segments + tube_index + 1

            faces.append((first, second, third))
            faces.append((first, third, fourth))

    return faces


def write_obj(path, vertices, faces):
    lines = [f"v {x:.6f} {y:.6f} {z:.6f}" for x, y, z in vertices]
    lines.extend(f"f {a} {b} {c}" for a, b, c in faces)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(
        description="Generate the procedural torus-knot OBJ used by the demo point cloud."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "assets" / "raw_models" / "demo_knot.obj",
        help="Destination OBJ file.",
    )
    parser.add_argument("--rings", type=int, default=240, help="Tube rings around the knot.")
    parser.add_argument(
        "--tube-segments",
        type=int,
        default=14,
        help="Vertices around each tube cross-section.",
    )
    parser.add_argument("--tube-radius", type=float, default=0.55, help="Tube radius.")
    parser.add_argument("--p", type=int, default=2, help="First torus-knot winding number.")
    parser.add_argument("--q", type=int, default=3, help="Second torus-knot winding number.")
    args = parser.parse_args()

    if args.rings < 3 or args.tube_segments < 3:
        parser.error("--rings and --tube-segments must be at least 3.")
    if args.tube_radius <= 0:
        parser.error("--tube-radius must be positive.")

    vertices = build_vertices(
        args.rings, args.tube_segments, args.tube_radius, args.p, args.q
    )
    faces = build_faces(args.rings, args.tube_segments)
    write_obj(args.output, vertices, faces)

    print(
        f"Wrote {args.output} with {len(vertices)} vertices and {len(faces)} triangles."
    )


if __name__ == "__main__":
    main()
