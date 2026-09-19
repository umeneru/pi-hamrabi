# pi-hamrabi

[pi](https://github.com/badlogic/pi-mono) の起動ヘッダーを、セッション情報と ASCII アートを並べた表示に置き換える拡張機能です。

## 機能

- pi のバージョン、作業ディレクトリ、モデル、読み込み済み Skill を表示
- 十分な幅では情報と ASCII アートを2カラム表示
- 狭い端末では縦積みに切り替え
- ANSI カラーと全角文字を考慮して端末幅内に描画

## 必要環境

- pi `0.85.1` 以降

## インストール

```bash
pi install git:github.com/umeneru/pi-hamrabi
```

起動時の標準 Context / Skills / Extensions 一覧も非表示にする場合は、`~/.pi/agent/settings.json` に次を追加してください。

```json
{
  "quietStartup": true
}
```

カスタムヘッダーは `quietStartup` が有効でも表示されます。

## 更新

```bash
pi update git:github.com/umeneru/pi-hamrabi
```

## アンインストール

```bash
pi remove git:github.com/umeneru/pi-hamrabi
```

## ライセンス

[MIT License](LICENSE)
