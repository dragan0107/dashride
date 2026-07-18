import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import type { BorderCamStream } from '@/src/data/borderCams';
import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  stream: BorderCamStream;
}

/**
 * HLS via WebView + hls.js (same path as the proven LiveStream screen).
 * Native expo-video/ExoPlayer flashes green frames on MUP hardware streams;
 * Chromium's software decode path does not.
 */
function createVideoHtml(videoUrl: string): string {
  const safeUrl = JSON.stringify(videoUrl);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
  </style>
</head>
<body>
  <video
    id="v"
    autoplay
    muted
    controls
    playsinline
    webkit-playsinline
    x5-playsinline
    x5-video-player-type="h5"
    preload="auto"
  ></video>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
  <script>
    (function () {
      var url = ${safeUrl};
      var video = document.getElementById('v');
      function notify(type, message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, message: message || '' }));
        }
      }
      function playSafe() {
        video.play().catch(function () {});
      }
      if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          notify('ready');
          playSafe();
        });
        hls.on(Hls.Events.ERROR, function (_e, data) {
          if (data && data.fatal) {
            notify('error', data.type || 'hls');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          notify('ready');
          playSafe();
        });
        video.addEventListener('error', function () {
          notify('error', 'native');
        });
      } else {
        notify('error', 'unsupported');
      }
    })();
  </script>
</body>
</html>`;
}

export function StreamPlayer({ stream }: Props) {
  const { colors, fonts } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const html = useMemo(() => createVideoHtml(stream.url), [stream.url]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        message?: string;
      };
      if (payload.type === 'ready') {
        setLoading(false);
        setError(null);
      } else if (payload.type === 'error') {
        setLoading(false);
        setError(payload.message || 'Stream error');
      }
    } catch {
      // ignore malformed messages
    }
  }, []);

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.title,
          { color: colors.text, fontFamily: fonts.bodyMedium },
        ]}
        numberOfLines={1}>
        {stream.title}
      </Text>

      <View
        style={[
          styles.card,
          stream.tall ? styles.cardTall : null,
          { backgroundColor: '#000', borderColor: colors.border },
        ]}>
        <WebView
          key={`${stream.id}-${reloadKey}`}
          style={styles.video}
          originWhitelist={['*']}
          source={{ html }}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onError={() => {
            setLoading(false);
            setError('Failed to load player');
          }}
          onMessage={onMessage}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          mixedContentMode="compatibility"
          cacheEnabled={false}
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
        />

        {loading && !error ? (
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text
              style={[
                styles.overlayText,
                { color: colors.textSecondary, fontFamily: fonts.body },
              ]}>
              Connecting…
            </Text>
          </View>
        ) : null}

        {error ? (
          <View
            style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.92)' }]}>
            <Ionicons
              name="videocam-off-outline"
              size={36}
              color={colors.danger}
            />
            <Text
              style={[
                styles.overlayText,
                { color: colors.text, fontFamily: fonts.bodyMedium },
              ]}>
              Stream unavailable
            </Text>
            <Pressable
              onPress={retry}
              style={({ pressed }) => [
                styles.retryBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.retryLabel,
                  { color: '#0B1118', fontFamily: fonts.bodyBold },
                ]}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 6,
    marginLeft: 2,
  },
  card: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTall: {
    height: 320,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  overlayText: {
    fontSize: 15,
  },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 14,
  },
});
