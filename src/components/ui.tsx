import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  const { colors, fonts } = useAppTheme();

  const bg =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? colors.danger
        : variant === 'secondary'
          ? colors.surface
          : 'transparent';

  const fg =
    variant === 'primary'
      ? '#0B1118'
      : variant === 'ghost'
        ? colors.textSecondary
        : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: variant === 'ghost' ? colors.border : bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: fg, fontFamily: fonts.bodyBold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const { colors, fonts } = useAppTheme();
  return (
    <View style={[styles.stat, { borderBottomColor: colors.border }]}>
      <Text
        style={[
          styles.statLabel,
          { color: colors.textSecondary, fontFamily: fonts.body },
        ]}>
        {label}
      </Text>
      <View style={styles.statRight}>
        <Text
          style={[
            styles.statValue,
            { color: colors.text, fontFamily: fonts.displayMedium },
          ]}>
          {value}
        </Text>
        {hint ? (
          <Text
            style={[
              styles.statHint,
              { color: colors.textSecondary, fontFamily: fonts.body },
            ]}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statLabel: {
    fontSize: 14,
  },
  statRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
  },
  statHint: {
    fontSize: 12,
  },
});
