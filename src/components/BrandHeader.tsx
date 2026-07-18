import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';

interface Props {
  title: string;
  subtitle?: string;
}

export function BrandHeader({ title, subtitle }: Props) {
  const { colors, fonts } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.brand,
          { color: colors.accent, fontFamily: fonts.bodyBold },
        ]}>
        DashRide
      </Text>
      <Text
        style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, fontFamily: fonts.body },
          ]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    gap: 2,
  },
  brand: {
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
