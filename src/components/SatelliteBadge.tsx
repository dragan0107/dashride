import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import type { GpsQuality } from '@/src/hooks/useLiveLocation';
import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  count: number | null;
  quality: GpsQuality;
}

export function SatelliteBadge({ count, quality }: Props) {
  const { colors, fonts } = useAppTheme();

  const searching = quality === 'searching' || count == null;
  const weak = quality === 'weak';
  const tint = searching
    ? colors.textSecondary
    : weak
      ? colors.danger
      : colors.accent;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={
        searching
          ? 'Searching for satellites'
          : `${count} satellites connected`
      }>
      <MaterialCommunityIcons name="satellite-uplink" size={16} color={tint} />
      <Text style={[styles.count, { color: tint, fontFamily: fonts.display }]}>
        {searching ? '—' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 22,
  },
  count: {
    fontSize: 16,
    minWidth: 18,
    textAlign: 'center',
  },
});
