import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "raw_models" / "iris_orion_hub_spoke.obj"


class MeshBuilder:
    def __init__(self):
        self.vertices = []
        self.faces = []

    def add_box(self, center, size, yaw=0.0):
        x, y, z = center
        sx, sy, sz = (dimension / 2 for dimension in size)
        corners = [
            (-sx, -sy, -sz),
            (sx, -sy, -sz),
            (sx, sy, -sz),
            (-sx, sy, -sz),
            (-sx, -sy, sz),
            (sx, -sy, sz),
            (sx, sy, sz),
            (-sx, sy, sz),
        ]
        cos_yaw = math.cos(yaw)
        sin_yaw = math.sin(yaw)
        start = len(self.vertices) + 1

        for local_x, local_y, local_z in corners:
            self.vertices.append(
                (
                    x + local_x * cos_yaw + local_z * sin_yaw,
                    y + local_y,
                    z - local_x * sin_yaw + local_z * cos_yaw,
                )
            )

        triangles = (
            (0, 2, 1), (0, 3, 2),
            (4, 5, 6), (4, 6, 7),
            (0, 1, 5), (0, 5, 4),
            (1, 2, 6), (1, 6, 5),
            (2, 3, 7), (2, 7, 6),
            (3, 0, 4), (3, 4, 7),
        )
        self.faces.extend(tuple(start + index for index in face) for face in triangles)

    def add_cylinder(self, start, end, radius, segments=12):
        direction = tuple(end[i] - start[i] for i in range(3))
        length = math.sqrt(sum(component * component for component in direction))
        axis = tuple(component / length for component in direction)
        reference = (0.0, 1.0, 0.0) if abs(axis[1]) < 0.92 else (1.0, 0.0, 0.0)
        side = (
            axis[1] * reference[2] - axis[2] * reference[1],
            axis[2] * reference[0] - axis[0] * reference[2],
            axis[0] * reference[1] - axis[1] * reference[0],
        )
        side_length = math.sqrt(sum(component * component for component in side))
        side = tuple(component / side_length for component in side)
        up = (
            axis[1] * side[2] - axis[2] * side[1],
            axis[2] * side[0] - axis[0] * side[2],
            axis[0] * side[1] - axis[1] * side[0],
        )
        start_index = len(self.vertices) + 1

        for point in (start, end):
            for segment in range(segments):
                angle = math.tau * segment / segments
                cosine = math.cos(angle) * radius
                sine = math.sin(angle) * radius
                self.vertices.append(
                    tuple(
                        point[i] + side[i] * cosine + up[i] * sine
                        for i in range(3)
                    )
                )

        for segment in range(segments):
            following = (segment + 1) % segments
            lower_a = start_index + segment
            lower_b = start_index + following
            upper_a = start_index + segments + segment
            upper_b = start_index + segments + following
            self.faces.extend(
                (
                    (lower_a, lower_b, upper_b),
                    (lower_a, upper_b, upper_a),
                    (start_index + 2 * segments, lower_b, lower_a),
                    (start_index + 2 * segments + 1, upper_a, upper_b),
                )
            )

        self.vertices.extend((start, end))

    def add_sphere(self, center, radius, rings=8, segments=12):
        x, y, z = center
        start_index = len(self.vertices) + 1

        for ring in range(rings + 1):
            latitude = math.pi * ring / rings
            for segment in range(segments):
                longitude = math.tau * segment / segments
                self.vertices.append(
                    (
                        x + radius * math.sin(latitude) * math.cos(longitude),
                        y + radius * math.cos(latitude),
                        z + radius * math.sin(latitude) * math.sin(longitude),
                    )
                )

        for ring in range(rings):
            for segment in range(segments):
                following = (segment + 1) % segments
                upper_a = start_index + ring * segments + segment
                upper_b = start_index + ring * segments + following
                lower_a = upper_a + segments
                lower_b = upper_b + segments

                if ring == 0:
                    self.faces.append((upper_b, lower_b, lower_a))
                elif ring == rings - 1:
                    self.faces.append((upper_a, upper_b, lower_a))
                else:
                    self.faces.extend(
                        (
                            (upper_a, upper_b, lower_b),
                            (upper_a, lower_b, lower_a),
                        )
                    )

    def add_horizontal_torus(
        self, center, major_radius, minor_radius, major_segments=64, minor_segments=8
    ):
        x, y, z = center
        start_index = len(self.vertices) + 1

        for major in range(major_segments):
            around = math.tau * major / major_segments
            for minor in range(minor_segments):
                tube = math.tau * minor / minor_segments
                radius = major_radius + minor_radius * math.cos(tube)
                self.vertices.append(
                    (
                        x + radius * math.cos(around),
                        y + minor_radius * math.sin(tube),
                        z + radius * math.sin(around),
                    )
                )

        for major in range(major_segments):
            next_major = (major + 1) % major_segments
            for minor in range(minor_segments):
                next_minor = (minor + 1) % minor_segments
                first = start_index + major * minor_segments + minor
                second = start_index + next_major * minor_segments + minor
                third = start_index + next_major * minor_segments + next_minor
                fourth = start_index + major * minor_segments + next_minor
                self.faces.extend(((first, second, third), (first, third, fourth)))

    def write_obj(self, path):
        lines = [
            "# Iris Orion Hub & Spoke monitoring constellation",
            "o Iris_Orion_Hub_Spoke",
        ]
        lines.extend(f"v {x:.6f} {y:.6f} {z:.6f}" for x, y, z in self.vertices)
        lines.extend(f"f {a} {b} {c}" for a, b, c in self.faces)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def rotate_point(center, local, yaw):
    x, y, z = local
    cosine = math.cos(yaw)
    sine = math.sin(yaw)
    return (
        center[0] + x * cosine + z * sine,
        center[1] + y,
        center[2] - x * sine + z * cosine,
    )


def add_drone(mesh, center, yaw, scale=1.0):
    def scale_point(point):
        return tuple(component * scale for component in point)

    def box(local_center, size, local_yaw=0.0):
        mesh.add_box(
            rotate_point(center, scale_point(local_center), yaw),
            scale_point(size),
            yaw + local_yaw,
        )

    def cylinder(local_start, local_end, radius, segments=12):
        mesh.add_cylinder(
            rotate_point(center, scale_point(local_start), yaw),
            rotate_point(center, scale_point(local_end), yaw),
            radius * scale,
            segments,
        )

    def sphere(local_center, radius):
        mesh.add_sphere(
            rotate_point(center, scale_point(local_center), yaw),
            radius * scale,
        )

    box((0, 0, 0), (0.68, 0.16, 0.48))
    box((0, 0.10, -0.02), (0.42, 0.08, 0.32))
    box((0, -0.12, 0.21), (0.22, 0.10, 0.16))
    sphere((0, -0.12, 0.31), 0.075)
    for sign_x in (-1, 1):
        cylinder((sign_x * 0.22, -0.06, 0), (sign_x * 0.28, -0.34, 0), 0.025)
        cylinder((sign_x * 0.28, -0.34, -0.34), (sign_x * 0.28, -0.34, 0.34), 0.025)

    for sign_x in (-1, 1):
        for sign_z in (-1, 1):
            rotor_x = sign_x * 0.72
            rotor_z = sign_z * 0.58
            cylinder(
                (sign_x * 0.18, 0.0, sign_z * 0.12),
                (rotor_x, 0.015, rotor_z),
                0.045,
            )
            cylinder(
                (rotor_x, 0.02, rotor_z),
                (rotor_x, 0.16, rotor_z),
                0.095,
            )
            box(
                (rotor_x, 0.18, rotor_z),
                (0.58, 0.018, 0.045),
                local_yaw=0.62,
            )


def build_constellation():
    mesh = MeshBuilder()
    hub_y = 1.15
    orbit_radius = 2.8

    mesh.add_box((0, -2.45, 0), (2.0, 0.58, 1.8))
    mesh.add_box((0, -2.1, 0), (1.68, 0.16, 1.48))
    mesh.add_box((0, -2.0, 0), (1.3, 0.06, 1.1))
    mesh.add_cylinder((0, -2.24, 0), (0, hub_y - 0.28, 0), 0.055, 16)

    for x_sign in (-1, 1):
        for z_sign in (-1, 1):
            mesh.add_box(
                (x_sign * 0.64, -2.07, z_sign * 0.56),
                (0.18, 0.06, 0.14),
            )

    add_drone(mesh, (0, hub_y, 0), 0, scale=1.4)
    mesh.add_cylinder((0, hub_y + 0.39, 0), (0, hub_y + 0.62, 0), 0.035, 10)
    mesh.add_sphere((0, hub_y + 0.66, 0), 0.09, rings=6, segments=10)
    mesh.add_horizontal_torus((0, hub_y, 0), orbit_radius, 0.025, 96, 8)

    for index in range(4):
        angle = math.tau * index / 4
        node_x = orbit_radius * math.cos(angle)
        node_z = orbit_radius * math.sin(angle)
        node_center = (node_x, hub_y, node_z)

        mesh.add_cylinder(
            (0, hub_y, 0),
            (node_x * 0.77, hub_y, node_z * 0.77),
            0.018,
            8,
        )
        add_drone(mesh, node_center, angle, scale=0.28)

    return mesh


def main():
    mesh = build_constellation()
    mesh.write_obj(OUTPUT)
    print(f"Wrote {OUTPUT} with {len(mesh.vertices)} vertices and {len(mesh.faces)} triangles.")


if __name__ == "__main__":
    main()
