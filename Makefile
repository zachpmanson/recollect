# recollect Makefile
#
# Requires the devshell (flake.nix — run `direnv allow` or `nix develop`
# before using). Provides the Android toolchain: node/pnpm, JDK 17, gradle,
# adb, ANDROID_HOME.

-include .env

APK := android/app/build/outputs/apk/debug/app-debug.apk
APP_ID := com.anonymous.recollect
ACTIVITY := $(APP_ID)/.MainActivity

.PHONY: build prebuild deps lint typecheck ci clean dev devices connect deploy

# Build the debug APK. Runs prebuild first if android/ doesn't exist yet.
build: android-ensure
	cd android && ./gradlew assembleDebug

# Regenerate the native android/ project (wipes it).
prebuild:
	npx expo prebuild --platform android --no-install

android-ensure:
	@if [ ! -d android ]; then $(MAKE) prebuild; fi

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