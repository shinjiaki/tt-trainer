import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/icons';
import { useTheme } from '@/theme';
import { formatMonthYear, toISODate, WEEKDAYS_SHORT } from '@/utils/date';

export interface CalendarMark {
  /** Filled-dot color (e.g. presence). */
  dot?: string;
  /** Outline-dot color (e.g. absence). */
  ring?: string;
  /** Small number badge (e.g. count when > 1). */
  count?: number;
}

interface CalendarProps {
  /** Visible year. */
  year: number;
  /** Visible month, 0-based. */
  month: number;
  /** Highlighted day, 'YYYY-MM-DD'. */
  selectedDate?: string | null;
  /** Per-ISO-date decorations. */
  marks?: Record<string, CalendarMark>;
  /** Tap handler for a day (omit to make the grid read-only). */
  onSelectDay?: (iso: string) => void;
  /** Month navigation (omit to hide the ‹ › controls). */
  onChangeMonth?: (year: number, month: number) => void;
}

/** Monthly grid used for date picking (setup) and attendance (player detail). */
export function Calendar({
  year,
  month,
  selectedDate,
  marks,
  onSelectDay,
  onChangeMonth,
}: CalendarProps) {
  const { colors, fonts } = useTheme();

  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toISODate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const step = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChangeMonth?.(d.getFullYear(), d.getMonth());
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const isoFor = (day: number) => `${year}-${pad2(month + 1)}-${pad2(day)}`;

  return (
    <View>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        {onChangeMonth ? (
          <NavButton icon="back" onPress={() => step(-1)} />
        ) : (
          <View style={{ width: 34 }} />
        )}
        <Text style={{ fontFamily: fonts.display600, fontSize: 16, color: colors.text }}>
          {formatMonthYear(year, month)}
        </Text>
        {onChangeMonth ? (
          <NavButton icon="chevron" onPress={() => step(1)} />
        ) : (
          <View style={{ width: 34 }} />
        )}
      </View>

      {/* weekday labels */}
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS_SHORT.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center', paddingBottom: 6 }}>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 11, color: colors.textFaint }}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`b${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
          }
          const iso = isoFor(day);
          const selected = selectedDate === iso;
          const isToday = iso === todayIso;
          const mark = marks?.[iso];

          return (
            <View key={iso} style={{ width: `${100 / 7}%`, height: 44, padding: 3 }}>
              <Pressable
                onPress={onSelectDay ? () => onSelectDay(iso) : undefined}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: selected ? colors.primary : 'transparent',
                  borderWidth: isToday && !selected ? 1.5 : 0,
                  borderColor: colors.borderStrong,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.ui600,
                    fontSize: 13.5,
                    color: selected ? '#fff' : colors.text,
                  }}
                >
                  {day}
                </Text>
                {/* marks */}
                {mark && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2, height: 6 }}>
                    {mark.dot && (
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: selected ? '#fff' : mark.dot,
                        }}
                      />
                    )}
                    {mark.ring && (
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          borderWidth: 1.2,
                          borderColor: selected ? '#fff' : mark.ring,
                        }}
                      />
                    )}
                  </View>
                )}
                {mark?.count && mark.count > 1 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 2,
                      minWidth: 13,
                      height: 13,
                      paddingHorizontal: 2,
                      borderRadius: 7,
                      backgroundColor: selected ? '#fff' : colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.mono700,
                        fontSize: 8,
                        color: selected ? colors.primary : '#fff',
                      }}
                    >
                      {mark.count}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function NavButton({ icon, onPress }: { icon: 'back' | 'chevron'; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={18} color={colors.textMuted} />
    </Pressable>
  );
}
