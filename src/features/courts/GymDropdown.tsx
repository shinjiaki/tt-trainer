import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Icon } from '@/icons';
import type { Court, Gym } from '@/models/types';
import { useTheme } from '@/theme';

interface GymDropdownProps {
  gyms: Gym[];
  courts: Court[];
  selectedGym: Gym | null;
  onSelect: (gymId: string) => void;
  onManageGyms: () => void;
}

/** Gym selector: trigger + anchored popover with backdrop (§5.3). */
export function GymDropdown({ gyms, courts, selectedGym, onSelect, onManageGyms }: GymDropdownProps) {
  const { colors, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 16, y: 80, width: 240 });
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y: y + height + 8, width: Math.max(width, 240) });
      setOpen(true);
    });
  };

  const courtCount = (gid: string) => courts.filter((c) => c.gymId === gid).length;

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 9, alignSelf: 'flex-start' }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 4,
            backgroundColor: selectedGym?.color ?? colors.primary,
          }}
        />
        <Text
          numberOfLines={1}
          style={{ fontFamily: fonts.display700, fontSize: 22, color: colors.text, maxWidth: 240 }}
        >
          {selectedGym ? selectedGym.name : 'Ginásio'}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevron" size={18} color={colors.textFaint} />
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: anchor.y,
              left: anchor.x,
              minWidth: anchor.width,
              maxWidth: 320,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 6,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 14 },
              elevation: 8,
            }}
          >
            {gyms.map((g) => {
              const on = g.id === selectedGym?.id;
              const n = courtCount(g.id);
              return (
                <Pressable
                  key={g.id}
                  onPress={() => {
                    onSelect(g.id);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                    backgroundColor: on ? colors.primarySoft : 'transparent',
                    borderRadius: 10,
                    padding: 11,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      backgroundColor: g.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="court" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
                      {g.name}
                    </Text>
                    <Text style={{ fontFamily: fonts.ui400, fontSize: 11.5, color: colors.textMuted }}>
                      {n} {n === 1 ? 'quadra' : 'quadras'}
                    </Text>
                  </View>
                  {on && <Icon name="check" size={18} color={colors.primary} />}
                </Pressable>
              );
            })}

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 6, marginHorizontal: 4 }} />

            <Pressable
              onPress={() => {
                setOpen(false);
                onManageGyms();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 10, padding: 11 }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  backgroundColor: colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="settings" size={16} color={colors.primary} />
              </View>
              <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.primary }}>
                Gerenciar ginásios
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
