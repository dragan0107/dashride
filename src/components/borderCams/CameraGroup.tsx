import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { StreamPlayer } from '@/src/components/borderCams/StreamPlayer';
import type { BorderCamGroup } from '@/src/data/borderCams';
import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  group: BorderCamGroup;
  expanded: boolean;
  onToggle: () => void;
}

export function CameraGroup({ group, expanded, onToggle }: Props) {
  const { colors, fonts } = useAppTheme();
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, progress]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.accent],
    ),
  }));

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onToggle();
        }}>
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.header,
              headerStyle,
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View style={styles.headerText}>
              <Text
                style={[
                  styles.code,
                  { color: colors.accent, fontFamily: fonts.bodyBold },
                ]}>
                {group.code}
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary, fontFamily: fonts.body },
                ]}>
                {group.label} · {group.streams.length} cam
                {group.streams.length === 1 ? '' : 's'}
              </Text>
            </View>
            <Animated.View style={chevronStyle}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </Animated.View>
          </Animated.View>
        )}
      </Pressable>

      {expanded ? (
        // No opacity fade around VideoView — animating video surfaces causes
        // intermittent green flashes on Android (ExoPlayer / SurfaceView).
        <View style={styles.streams}>
          {group.streams.map((stream) => (
            <StreamPlayer key={stream.id} stream={stream} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  code: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
  },
  streams: {
    marginTop: 10,
  },
});
