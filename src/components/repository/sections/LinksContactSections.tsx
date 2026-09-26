// Professional Links and Contact.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { EmptySection, IconRow, ItemShell, take, type SectionProps } from './shared';

import { getContactChannels } from '@/components/professional/ContactSheet';
import { colors, spacing } from '@/theme';
import { linkIcons, openExternal, openWebLink } from '@/utils/links';

export function LinksSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.links.length === 0) return <EmptySection text="No professional links yet" />;
  return (
    <View style={styles.list}>
      {take(pro.links, limit).map((l) => (
        <ItemShell key={l.id} onRemove={onRemove && (() => onRemove(l.id))}>
          <IconRow
            icon={linkIcons[l.type]}
            tint={colors.surfaceAlt}
            color={colors.ink}
            title={l.label}
            lines={[l.url.replace(/^https?:\/\//, '')]}
            onPress={() => openWebLink(l.url)}
            right={!onRemove ? <Ionicons name="arrow-forward" size={16} color={colors.textSubtle} /> : undefined}
          />
        </ItemShell>
      ))}
    </View>
  );
}

export function ContactSection({ pro }: SectionProps) {
  const channels = getContactChannels(pro);
  if (channels.length === 0) return <EmptySection text="No contact information" />;
  return (
    <View style={styles.list}>
      {channels.map((ch) => (
        <IconRow
          key={ch.label}
          icon={ch.icon}
          tint={colors.surfaceAlt}
          color={ch.color}
          title={ch.label}
          lines={[ch.value]}
          onPress={ch.url ? () => openExternal(ch.url!) : undefined}
          right={ch.url ? <Ionicons name="open-outline" size={16} color={colors.textSubtle} /> : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
});
