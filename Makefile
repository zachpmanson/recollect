# recollect Makefile
#
# Requires the devshell (flake.nix — run `direnv allow` or `nix develop`
# before using). Provides the Android toolchain: node/pnpm, JDK 17, gradle,
# adb, ANDROID_HOME.

-include .env

APK := android/app/build/outputs/apk/release/app-release.apk
APP_ID := com.anonymous.recollect
ACTIVITY := $(APP_ID)/.MainActivity

.PHONY: build prebuild deps lint typecheck ci clean dev devices connect deploy

# Build the release APK (signed with the debug keystore, stash pattern).
# Prebuild first — it regenerates android/ from app.json.
# Default builds all ABIs; `make build ABI=arm64-v8a` builds one (smaller APK).
# Builds run CPU-capped (build-capped.sh pins each build to BUILD_CORES) so
# concurrent Android builds on the shared box can't starve DNS/SSH/XMPP.
ABI ?=
ABIS_ALL := arm64-v8a,armeabi-v7a,x86,x86_64
BUILD_CORES ?= 0-3
CAP := $(HOME)/beltino/scripts/build-capped.sh

build:
	npx expo prebuild --platform android --no-install
	$(CAP) "$(CURDIR)" -- assembleRelease \
		-PreactNativeArchitectures=$(if $(ABI),$(ABI),$(ABIS_ALL))

# Regenerate the native android/ project (wipes it).
prebuild:
	npx expo prebuild --platform android --no-install

# Install JS dependencies (frozen against pnpm-lock.yaml).
deps:
	pnpm install --frozen-lockfile

lint:
	pnpm lint

format:
	cd android && ./gradlew lint

typecheck:
	npx tsc --noEmit

ci: lint typecheck

clean:
	cd android && ./gradlew clean

dev:
	npx expo start

include $(HOME)/beltino/scripts/android-deploy.mk