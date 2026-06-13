import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

import { IconButton } from './IconButton';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max height as a fraction of the screen (default 0.82). */
  maxHeightRatio?: number;
}

const SCREEN_H = Dimensions.get('window').height;

/** Ascending modal sheet with handle + title (§5.7). ~260ms ease-out. */
export function BottomSheet({ open, onClose, title, children, maxHeightRatio = 0.82 }: BottomSheetProps) {
  const { colors, radius, fonts } = useTheme();
  const [mounted, setMounted] = useState(open);
  const slide = useRef(new Animated.Value(0)).current; // 0 hidden → 1 shown

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 260,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, mounted, slide]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!mounted) return null;

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_H, 0] });
  const backdrop = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{ position: 'absolute', inset: 0, backgroundColor: '#080c14', opacity: backdrop }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View
            style={{
              transform: [{ translateY }],
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.sheetTop,
              borderTopRightRadius: radius.sheetTop,
              maxHeight: SCREEN_H * maxHeightRatio,
              shadowColor: '#000',
              shadowOpacity: 0.22,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: -12 },
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong }}
              />
            </View>
            {title != null && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 18,
                  paddingTop: 12,
                  paddingBottom: 8,
                }}
              >
                <Text style={{ fontFamily: fonts.display600, fontSize: 19, color: colors.text }}>
                  {title}
                </Text>
                <IconButton icon="close" tone="muted" size={34} onPress={handleClose} />
              </View>
            )}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 22 }}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
