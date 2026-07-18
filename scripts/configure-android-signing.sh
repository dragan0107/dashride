#!/usr/bin/env bash
set -euo pipefail

# Configures Android release signing after `expo prebuild`.
# Expects:
#   ANDROID_KEYSTORE_BASE64
#   ANDROID_KEY_ALIAS
#   ANDROID_KEYSTORE_PASSWORD
#   ANDROID_KEY_PASSWORD

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT/android/app"
GRADLE_PROPS="$ROOT/android/gradle.properties"
BUILD_GRADLE="$APP_DIR/build.gradle"
KEYSTORE_NAME="dashride-release.keystore"
KEYSTORE_PATH="$APP_DIR/$KEYSTORE_NAME"

if [[ ! -d "$APP_DIR" ]]; then
  echo "android/app not found. Run expo prebuild first." >&2
  exit 1
fi

for var in ANDROID_KEYSTORE_BASE64 ANDROID_KEY_ALIAS ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: $var" >&2
    exit 1
  fi
done

echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$KEYSTORE_PATH"
echo "Wrote keystore to $KEYSTORE_PATH"

sed -i '/^# --- dashride ci signing ---$/,/^# --- end dashride ci signing ---$/d' "$GRADLE_PROPS" || true

cat >> "$GRADLE_PROPS" <<EOF

# --- dashride ci signing ---
MYAPP_UPLOAD_STORE_FILE=$KEYSTORE_NAME
MYAPP_UPLOAD_KEY_ALIAS=$ANDROID_KEY_ALIAS
MYAPP_UPLOAD_STORE_PASSWORD=$ANDROID_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=$ANDROID_KEY_PASSWORD
# --- end dashride ci signing ---
EOF

python3 - "$BUILD_GRADLE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

signing_block = """
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
"""

if "MYAPP_UPLOAD_STORE_FILE" not in text:
    marker = "    buildTypes {"
    if marker not in text:
        raise SystemExit("Could not find buildTypes block in build.gradle")
    text = text.replace(marker, signing_block + marker, 1)

# Expo/RN templates put signingConfigs.debug on the release buildType by default.
# Switch only the first signingConfig inside the release { ... } section.
release_marker = "        release {"
if release_marker not in text:
    raise SystemExit("Could not find release buildType in build.gradle")

before, after = text.split(release_marker, 1)
if "signingConfig signingConfigs.release" not in after.split("        debug {", 1)[0]:
    if "signingConfig signingConfigs.debug" not in after:
        # insert right after release {
        after = "\n            signingConfig signingConfigs.release" + after
    else:
        after = after.replace(
            "signingConfig signingConfigs.debug",
            "signingConfig signingConfigs.release",
            1,
        )

path.write_text(before + release_marker + after)
print(f"Patched signing config in {path}")
PY

echo "Android release signing configured."
