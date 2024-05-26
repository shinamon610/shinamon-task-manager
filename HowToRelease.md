cargo.tomlでversion管理しているので、それを更新。<-ここ忘れると既存のビルドのreleaseを更新することになる。
適当にdevにpush
mainにマージするプルリク作って、マージ。
github actionでビルドされて、releaseが更新される。が、mad arm版がなぜか壊れているので、それだけローカルでビルドして更新する。