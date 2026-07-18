import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { BorderCamStream } from '@/src/data/borderCams';
import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  stream: BorderCamStream;
}

function hlsSource(uri: string) {
  return { uri, contentType: 'hls' as const };
}

export function StreamPlayer({ stream }: Props) {
  const { colors, fonts } = useAppTheme();

  const player = useVideoPlayer(hlsSource(stream.url), (p) => {
    p.muted = true;
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        // player may already be released
      }
    };
  }, [player]);

  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  const isLoading = status === 'loading' || status === 'idle';
  const hasError = status === 'error';

  const retry = useCallback(() => {
    void player.replaceAsync(hlsSource(stream.url)).then(() => {
      player.muted = true;
      player.play();
    });
  }, [player, stream.url]);

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
        {/*
          Use default surfaceView on Android — textureView + live HLS often
          flashes solid green frames during decoder keyframe gaps.
        */}
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls
          fullscreenOptions={{ enable: true }}
        />

        {isLoading && !hasError ? (
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

        {hasError ? (
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
            {error?.message ? (
              <Text
                style={[
                  styles.errorDetail,
                  { color: colors.textSecondary, fontFamily: fonts.body },
                ]}
                numberOfLines={2}>
                {error.message}
              </Text>
            ) : null}
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
  errorDetail: {
    fontSize: 12,
    textAlign: 'center',
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
