"""
VOICEVOX Character LOD — 派生フォーマット生成スクリプト

canonical TTL からJSON-LD, N-Triples, RDF/XML を生成し、
VoID統計情報を自動更新する。

Usage:
    cd scripts
    pip install -r requirements.txt
    python generate_lod.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL, XSD, FOAF, DCTERMS

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS = REPO_ROOT / "docs"
LOD_DIR = DOCS / "lod"
NS_DIR = DOCS / "ns"

VVOX = Namespace("https://nakamura196.github.io/voicevox-character-lod/ns/voicevox#")
VOID = Namespace("http://rdfs.org/ns/void#")
SCHEMA = Namespace("https://schema.org/")

CONTEXT = {
    "@context": {
        "vvox": "https://nakamura196.github.io/voicevox-character-lod/ns/voicevox#",
        "schema": "https://schema.org/",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "owl": "http://www.w3.org/2002/07/owl#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "skos": "http://www.w3.org/2004/02/skos/core#",
        "void": "http://rdfs.org/ns/void#",
        "wd": "http://www.wikidata.org/entity/",
    }
}


def load_graph(path: Path) -> Graph:
    g = Graph()
    g.parse(str(path), format="turtle")
    return g


def serialize_formats(g: Graph, base_path: Path, name: str) -> None:
    """TTL -> JSON-LD, N-Triples, RDF/XML"""
    # JSON-LD
    jsonld_str = g.serialize(format="json-ld", indent=2)
    jsonld_data = json.loads(jsonld_str)
    if isinstance(jsonld_data, list):
        jsonld_data = {"@context": CONTEXT["@context"], "@graph": jsonld_data}
    else:
        jsonld_data["@context"] = CONTEXT["@context"]
    (base_path / f"{name}.jsonld").write_text(
        json.dumps(jsonld_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  -> {name}.jsonld")

    # N-Triples
    nt_str = g.serialize(format="nt")
    (base_path / f"{name}.nt").write_text(nt_str, encoding="utf-8")
    print(f"  -> {name}.nt")

    # RDF/XML
    rdfxml_str = g.serialize(format="xml")
    (base_path / f"{name}.rdf").write_text(rdfxml_str, encoding="utf-8")
    print(f"  -> {name}.rdf")


def compute_stats(g: Graph) -> dict:
    """Compute dataset statistics."""
    subjects = set(g.subjects())
    predicates = set(g.predicates())

    characters = set(g.subjects(RDF.type, VVOX.Character))
    pairs = set(g.subjects(RDF.type, VVOX.CharacterPair))

    wd_links = 0
    for _, _, o in g.triples((None, OWL.sameAs, None)):
        if str(o).startswith("http://www.wikidata.org/entity/"):
            wd_links += 1

    stats = {
        "triples": len(g),
        "entities": len(subjects),
        "classes": len(set(g.objects(None, RDF.type))),
        "properties": len(predicates),
        "characters": len(characters),
        "pairs": len(pairs),
        "wikidata_links": wd_links,
    }
    return stats


def update_void(stats: dict) -> None:
    """Update VoID file with computed statistics."""
    void_path = LOD_DIR / "void.ttl"
    content = void_path.read_text(encoding="utf-8")

    replacements = {
        r'void:triples\s+"\d+"': f'void:triples     "{stats["triples"]}"',
        r'void:entities\s+"\d+"': f'void:entities    "{stats["entities"]}"',
        r'void:properties\s+"\d+"': f'void:properties  "{stats["properties"]}"',
    }
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content, count=1)

    void_path.write_text(content, encoding="utf-8")
    print(f"  -> void.ttl updated (triples={stats['triples']})")


def generate_stats_json(stats: dict) -> None:
    """Generate stats.json for web templates."""
    stats_path = LOD_DIR / "stats.json"
    stats_path.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  -> stats.json")


def main() -> None:
    print("=== VOICEVOX Character LOD Generator ===\n")

    print("[1/4] Loading dataset...")
    data_g = load_graph(LOD_DIR / "voicevox.ttl")
    print(f"  Loaded {len(data_g)} triples\n")

    print("[2/4] Generating derivative formats (dataset)...")
    serialize_formats(data_g, LOD_DIR, "voicevox")
    print()

    print("[3/4] Generating derivative formats (ontology)...")
    onto_g = load_graph(NS_DIR / "voicevox.ttl")
    serialize_formats(onto_g, NS_DIR, "voicevox")
    print()

    print("[4/4] Computing statistics...")
    stats = compute_stats(data_g)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    update_void(stats)
    generate_stats_json(stats)

    print("\nDone!")


if __name__ == "__main__":
    main()
