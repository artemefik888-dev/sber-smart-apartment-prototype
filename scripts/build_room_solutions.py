from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOMS = Path("public/materials/rooms")
MERGES = {
    "vannaya-basic-comfort-maximum.pdf": (
        ("vannaya-basic.pdf", "vannaya-comfort.pdf", "vannaya-maximum.pdf"),
        22,
        "3daa77a436b4616c31da45dd55cd3d66729744ab1b51b1b2fc95849d9f55ab45",
    ),
    "prihozhaya-basic-comfort-maximum.pdf": (
        ("prihozhaya-basic.pdf", "prihozhaya-comfort.pdf", "prihozhaya-maximum.pdf"),
        34,
        "dbf933fe795f81b2294311a4db9cd80fa2d616f45828101dafeb60e2cf8a4eb5",
    ),
    "gostinaya-basic-comfort-maximum.pdf": (
        ("gostinaya-basic.pdf", "gostinaya-comfort.pdf", "gostinaya-maximum.pdf"),
        35,
        "bef88ecfa9ac2cd7bfca2709f674dbfb9198a616172f079e4bd4f1a07a0c78af",
    ),
    "detskaya-basic-comfort-maximum.pdf": (
        ("detskaya-basic.pdf", "detskaya-comfort.pdf", "detskaya-maximum.pdf"),
        39,
        "b956d7be580e916f0bd5f0a35404291d7f730835624bd74efc5af11abb4040f3",
    ),
    "kuhnya-basic-comfort-maximum.pdf": (
        ("kuhnya-basic.pdf", "kuhnya-comfort.pdf", "kuhnya-maximum.pdf"),
        32,
        "b7a5e54d1167b963e215f0ad4fbd852b7c6f4446ee635c7a0ab7ae83ca371102",
    ),
    "spalnya-basic-comfort-maximum.pdf": (
        ("spalnya-basic.pdf", "spalnya-comfort.pdf", "spalnya-maximum.pdf"),
        39,
        "be1df0ed79e08f7229acfcbde9b7f6838f32d36a0467c89bbe09d37efb405d90",
    ),
}


def build(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for output_name, (source_names, expected_pages, expected_sha256) in MERGES.items():
        writer = PdfWriter()
        for source_name in source_names:
            writer.append(str(ROOMS / source_name))

        output_path = output_dir / output_name
        with output_path.open("wb") as stream:
            writer.write(stream)

        reader = PdfReader(output_path)
        if len(reader.pages) != expected_pages:
            raise ValueError(f"{output_name}: expected {expected_pages} pages, got {len(reader.pages)}")
        if any(float(page.mediabox.width) != 1500 or float(page.mediabox.height) != 1500 for page in reader.pages):
            raise ValueError(f"{output_name}: unexpected page size")
        actual_sha256 = hashlib.sha256(output_path.read_bytes()).hexdigest()
        if actual_sha256 != expected_sha256:
            raise ValueError(f"{output_name}: unexpected SHA-256 {actual_sha256}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    build(parser.parse_args().output_dir)
