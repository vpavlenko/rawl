# 開発方針

- モジュールに分割し、独立して動作するように実装する
- なるべく UI に依存しないコードを書く (下記の場合は FooComponent のみが React.js に依存するように)
- Flux などのアーキテクチャを試したい場合は、モジュール内で完結するように実装する
- モジュールは機能やビューの単位で分割する
- モジュールごとに機能を検証できるようにする (テストコードなど)

## ディレクトリ

モジュールごとにディレクトリを分ける

- coffee/
  - FooModule/
    - FooEntity.coffee
    - FooValue.coffee
    - FooController.coffee
    - FooComponent.coffee
    
