import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandHeader } from '@/src/components/BrandHeader';
import { CameraGroup } from '@/src/components/borderCams/CameraGroup';
import { Screen } from '@/src/components/Screen';
import { BORDER_CAM_GROUPS } from '@/src/data/borderCams';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function BorderCamsScreen() {
  const { colors, fonts } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <Screen padded={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: 28 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerGrow}>
            <BrandHeader
              title="Border Cams"
              subtitle="Live crossings · Serbia & neighbors"
            />
          </View>
          <View style={styles.liveBadge}>
            <View style={[styles.liveDot, { backgroundColor: colors.danger }]} />
            <Text
              style={[
                styles.liveText,
                { color: colors.danger, fontFamily: fonts.bodyBold },
              ]}>
              LIVE
            </Text>
          </View>
        </View>

        {BORDER_CAM_GROUPS.map((group) => (
          <CameraGroup
            key={group.id}
            group={group}
            expanded={expandedId === group.id}
            onToggle={() => toggle(group.id)}
          />
        ))}

        <Text
          style={[
            styles.footnote,
            { color: colors.textSecondary, fontFamily: fonts.body },
          ]}>
          Public traffic cameras from official border feeds. Expand a crossing
          to start the stream — only one group plays at a time to save battery.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerGrow: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  footnote: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
});
