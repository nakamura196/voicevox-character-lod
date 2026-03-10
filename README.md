# VOICEVOX Character LOD

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![LOD](https://img.shields.io/badge/LOD-5%20Star-gold.svg)](#)
[![Format](https://img.shields.io/badge/Format-RDF%2FOWL-blue.svg)](#)
[![SHACL](https://img.shields.io/badge/SHACL-validated-green.svg)](#)
[![SPARQL](https://img.shields.io/badge/SPARQL-Dydra-blue.svg)](https://dydra.com/ut-digital-archives/voicevox-character-lod/sparql)

[VOICEVOX](https://voicevox.hiroshiba.jp/) テキスト音声合成エンジンのキャラクターデータを **Linked Open Data** として公開するデータセットです。

**Web**: https://nakamura196.github.io/voicevox-character-lod/

## データセット概要

| 項目 | 内容 |
|------|------|
| キャラクター数 | 27 |
| 対話ペア数 | 7 |
| トリプル数 | 591 |
| 外部リンク | Wikidata (`owl:sameAs`) 7件 |
| ライセンス | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 名前空間 | `https://nakamura196.github.io/voicevox-character-lod/ns/voicevox#` |
| 語彙 | OWL, Schema.org, FOAF, Dublin Core Terms, VoID, DCAT, SKOS |
| データ品質 | SHACL制約による検証済み |
| 言語 | 日本語 / English (bilingual) |

## ダウンロード

| 形式 | URL |
|------|-----|
| Turtle (.ttl) | [voicevox.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.ttl) |
| JSON-LD (.jsonld) | [voicevox.jsonld](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.jsonld) |
| N-Triples (.nt) | [voicevox.nt](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.nt) |
| RDF/XML (.rdf) | [voicevox.rdf](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox.rdf) |
| VoID メタデータ | [void.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/void.ttl) |
| DCAT カタログ | [dcat.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/dcat.ttl) |
| SHACL 制約 | [voicevox-shacl.ttl](https://nakamura196.github.io/voicevox-character-lod/lod/voicevox-shacl.ttl) |
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
| 東北ずん子 | [Q11526103](https://www.wikidata.org/entity/Q11526103) |

## データ品質

### SHACL制約

SHACL (Shapes Constraint Language) による以下のデータ品質制約を定義・検証しています:

- **Character**: schema:name（必須）、speakerId（必須・整数・非負）、speechStyle（必須）、hasEngine（必須）、homepage（推奨）、displayColor（推奨・CSS hex形式）
- **CharacterPair**: questioner/explainer（各1つ必須）、rdfs:label（必須）、hasMember（2つ以上必須）
- **TTSEngine**: schema:name（必須）、schema:url（必須）

### CI/CD

GitHub Actionsで自動検証:
- TTL構文チェック (rdflib)
- SHACL制約検証 (pyshacl)
- Dydra SPARQLエンドポイントへの自動デプロイ (mainブランチへのpush時)

## SPARQLエンドポイント

### Dydra (公開)

```
https://dydra.com/ut-digital-archives/voicevox-character-lod/sparql
```

[Webサイト](https://nakamura196.github.io/voicevox-character-lod/)のYASGUIウィジェットからインタラクティブにクエリを実行できます。

### ローカル (Fuseki)

```bash
docker compose up -d
curl -X POST 'http://localhost:3030/voicevox/data' \
  -H 'Content-Type: text/turtle' \
  -T docs/lod/voicevox.ttl
open http://localhost:3030/#/dataset/voicevox/query
```

## 活用事例: 掛け合い解説動画の自動生成

本LODデータセットは、ブログ記事からVOICEVOXキャラクターによる掛け合い解説動画を自動生成するパイプラインで活用されています。

```
ブログ記事 (Markdown)
    ↓ LLM (GPT-4o)
対話台本 (キャラクターの口調・役割はLODから参照)
    ↓ VOICEVOX TTS Engine
音声ファイル (.wav)
    ↓ Puppeteer + VRM
動画フレーム (キャラクター立ち絵+テロップ)
    ↓ FFmpeg
完成動画 → YouTube
```

LODデータセットの `vvox:speechStyle`, `vvox:sampleLine` プロパティをLLMのプロンプトに組み込むことで、各キャラクターの口調を忠実に再現した自然な対話を生成しています。

## 派生フォーマット生成

```bash
cd scripts
pip install -r requirements.txt
python generate_lod.py
```

`docs/lod/voicevox.ttl` を正規データとし、JSON-LD / N-Triples / RDF/XML を自動生成します。VoID の統計値も自動更新されます。

## Dydraへのアップロード

```bash
node scripts/dydra_upload.mjs upload   # データアップロード
node scripts/dydra_upload.mjs info     # トリプル数確認
node scripts/dydra_upload.mjs query    # テストクエリ
```

## ファイル構成

```
docs/                          # GitHub Pages で公開
├── index.html                 # ランディングページ (日英対応、D3.jsグラフ可視化)
├── favicon.svg                # ファビコン
├── images/characters/         # キャラクター立ち絵
├── ns/
│   ├── voicevox.ttl           # OWL オントロジー
│   ├── voicevox.jsonld
│   ├── voicevox.rdf
│   └── voicevox/
│       └── index.html         # 名前空間ドキュメント（人間可読）
└── lod/
    ├── voicevox.ttl           # データセット (正規)
    ├── voicevox.jsonld
    ├── voicevox.nt
    ├── voicevox.rdf
    ├── void.ttl               # VoID メタデータ
    ├── dcat.ttl               # DCAT カタログ
    ├── voicevox-shacl.ttl     # SHACL 制約
    └── stats.json             # 統計情報
scripts/
├── generate_lod.py            # 変換・統計生成スクリプト
├── dydra_upload.mjs           # Dydra アップロードスクリプト
└── requirements.txt
.github/workflows/
└── validate.yml               # CI: TTL検証 + SHACL + Dydraデプロイ
docker-compose.yml             # SPARQL エンドポイント (Fuseki, ローカル用)
LICENSE                        # CC BY 4.0
```

## ライセンス

データセット: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

各キャラクターの利用にあたっては、それぞれの公式ガイドラインに従ってください:
- [東北ずん子プロジェクト](https://zunko.jp/guideline.html) (ずんだもん、四国めたん、九州そら、中国うさぎ、東北きりたん、東北ずん子、東北イタコ)
- [春日部つむぎ](https://tsumugi-official.studio.site/rule)
