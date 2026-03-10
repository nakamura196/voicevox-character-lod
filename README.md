# VOICEVOX Character LOD

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![LOD](https://img.shields.io/badge/LOD-5%20Star-gold.svg)](#)
[![Format](https://img.shields.io/badge/Format-RDF%2FOWL-blue.svg)](#)

[VOICEVOX](https://voicevox.hiroshiba.jp/) テキスト音声合成エンジンのキャラクターデータを **Linked Open Data** として公開するデータセットです。

**Web**: https://nakamura196.github.io/voicevox-character-lod/

## データセット概要

| 項目 | 内容 |
|------|------|
| キャラクター数 | 8 |
| 対話ペア数 | 4 |
| 外部リンク | Wikidata (`owl:sameAs`) 5件 |
| ライセンス | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 名前空間 | `https://nakamura196.github.io/voicevox-character-lod/ns/voicevox#` |
| 語彙 | OWL, Schema.org, FOAF, Dublin Core Terms, VoID, SKOS |
| 言語 | 日本語 / English (bilingual) |

## ダウンロード

| 形式 | URL |
|------|-----|
| Turtle (.ttl) | [voicevox.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.ttl) |
| JSON-LD (.jsonld) | [voicevox.jsonld](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.jsonld) |
| N-Triples (.nt) | [voicevox.nt](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.nt) |
| RDF/XML (.rdf) | [voicevox.rdf](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.rdf) |
| VoID メタデータ | [void.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/void.ttl) |
| OWL オントロジー | [voicevox.ttl](https://nakamura196.github.io/voicevox-character-lod/ns/voicevox.ttl) |

## オントロジー

独自の OWL オントロジー (`vvox:`) で TTS キャラクターのドメイン知識を体系化しています。

- **クラス**: `vvox:Character`, `vvox:CharacterPair`, `vvox:TTSEngine`
- **オブジェクトプロパティ**: `vvox:questioner`, `vvox:explainer`, `vvox:hasMember`, `vvox:hasEngine`, `vvox:imageCreator`
- **データ型プロパティ**: `vvox:speakerId`, `vvox:speechStyle`, `vvox:displayColor`, `vvox:displayColorDark`, `vvox:standingImage`, `vvox:sampleLine`

[名前空間ドキュメント](https://nakamura196.github.io/voicevox-character-lod/ns/voicevox/)

## 外部リンク (5-Star LOD)

| キャラクター | Wikidata |
|-------------|----------|
| VOICEVOX (ソフトウェア) | [Q106428182](https://www.wikidata.org/entity/Q106428182) |
| ずんだもん | [Q113476219](https://www.wikidata.org/entity/Q113476219) |
| 四国めたん | [Q113476218](https://www.wikidata.org/entity/Q113476218) |
| 春日部つむぎ | [Q113476220](https://www.wikidata.org/entity/Q113476220) |
| 東北きりたん | [Q55634043](https://www.wikidata.org/entity/Q55634043) |

## SPARQLエンドポイント

Apache Jena Fuseki を Docker で起動してローカルでクエリを実行できます:

```bash
docker compose up -d

curl -X POST 'http://localhost:3030/voicevox/data' \
  -H 'Content-Type: text/turtle' \
  -T docs/lod/voicevox.ttl

# ブラウザでアクセス
open http://localhost:3030/#/dataset/voicevox/query
```

## 派生フォーマット生成

```bash
cd scripts
pip install -r requirements.txt
python generate_lod.py
```

`docs/lod/voicevox.ttl` を正規データとし、JSON-LD / N-Triples / RDF/XML を自動生成します。VoID の統計値も自動更新されます。

## ファイル構成

```
docs/                          # GitHub Pages で公開
├── index.html                 # ランディングページ (日英対応、D3.jsグラフ可視化)
├── ns/
│   ├── voicevox.ttl           # OWL オントロジー
│   ├── voicevox.jsonld
│   ├── voicevox.rdf
│   └── voicevox/
│       └── index.html         # 名前空間ドキュメント（人間可読）
└── lod/
    ├── voicevox.ttl           # データセット
    ├── voicevox.jsonld
    ├── voicevox.nt
    ├── voicevox.rdf
    ├── void.ttl               # VoID メタデータ
    └── stats.json             # 統計情報
scripts/
├── generate_lod.py            # 変換・統計生成スクリプト
└── requirements.txt
docker-compose.yml             # SPARQL エンドポイント (Fuseki)
LICENSE                        # CC BY 4.0
```

## ライセンス

データセット: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

各キャラクターの利用にあたっては、それぞれの公式ガイドラインに従ってください:
- [東北ずん子プロジェクト](https://zunko.jp/guideline.html)
- [春日部つむぎ](https://tsumugi-official.studio.site/rule)
