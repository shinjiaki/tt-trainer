/**
 * Icon set (§2.4). Line icons, stroke ~1.9, currentColor-style via `color`.
 * Most map to lucide-react-native; `paddle` and `whistle` aren't in lucide so
 * they're drawn with react-native-svg using the prototype's paths.
 */
import {
  Armchair,
  ArrowLeftRight,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Home,
  Info,
  LayoutGrid,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Timer,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const Paddle = ({ size = 24, color = '#000', strokeWidth = 1.9 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 9.5a5 5 0 1 0-5 5l-1 1"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m8.5 15.5-3.6 3.6a1.6 1.6 0 0 1-2.3-2.3l3.6-3.6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Whistle = ({ size = 24, color = '#000', strokeWidth = 1.9 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 11H3.5A1.5 1.5 0 0 0 2 12.5v2A1.5 1.5 0 0 0 3.5 16H7l2.5 3 1.5-3a4.5 4.5 0 1 0 0-5z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <SvgCircle cx={15.5} cy={13} r={1} fill={color} />
  </Svg>
);

export type IconName =
  | 'home'
  | 'court'
  | 'paddle'
  | 'players'
  | 'settings'
  | 'plus'
  | 'whistle'
  | 'timer'
  | 'play'
  | 'pause'
  | 'reset'
  | 'close'
  | 'back'
  | 'chevron'
  | 'check'
  | 'edit'
  | 'trash'
  | 'search'
  | 'swap'
  | 'bench'
  | 'bell'
  | 'info'
  | 'dot';

export const Icons: Record<IconName, ComponentType<IconProps>> = {
  home: Home,
  court: LayoutGrid,
  paddle: Paddle,
  players: Users,
  settings: Settings,
  plus: Plus,
  whistle: Whistle,
  timer: Timer,
  play: Play,
  pause: Pause,
  reset: RotateCcw,
  close: X,
  back: ChevronLeft,
  chevron: ChevronRight,
  check: Check,
  edit: Pencil,
  trash: Trash2,
  search: Search,
  swap: ArrowLeftRight,
  bench: Armchair,
  bell: Bell,
  info: Info,
  dot: Circle,
};

export function Icon({
  name,
  size = 24,
  color = '#000',
  strokeWidth = 1.9,
}: IconProps & { name: IconName }) {
  const Cmp = Icons[name];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
