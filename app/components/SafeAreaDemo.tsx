import { type FC, type ReactNode } from 'react';
import { useSignal, viewport } from '@tma.js/sdk-react';
import { Logo } from './icons/Logo';

interface SafeAreaDemoProps {
  children: ReactNode;
  type?: 'safe' | 'content';
  className?: string;
}

/**
 * Demo component that applies safe area padding using CSS variables.
 *
 * @param type - 'safe' for system safe area (notches, navigation bars) or 'content' for Telegram UI elements
 * @param children - Content to render inside the safe area
 * @param className - Additional CSS classes
 */
export const SafeAreaDemo: FC<SafeAreaDemoProps> = ({
  children,
  type = 'safe',
  className = ''
}) => {
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);

  const insets = type === 'safe' ? safeAreaInsets : contentSafeAreaInsets;

  return (
    <div
      className={className}
      style={{
        paddingTop: insets?.top ?? 0,
        paddingBottom: insets?.bottom ?? 0,
        paddingLeft: insets?.left ?? 0,
        paddingRight: insets?.right ?? 0,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Fixed footer component that respects safe area bottom inset.
 * Useful for bottom navigation bars or action buttons.
 */
export const SafeAreaFooter: FC<{ className?: string; children?: ReactNode }> = ({
  className = '',
  children
}) => {
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

  return (
    <div
      className={`shrink-0 z-50 bg-stone-900 text-white text-xs ${className}`}
      style={{
        paddingBottom: safeAreaInsets?.bottom ?? 0,
      }}
    >
    </div>
  );
};

/**
 * Fixed header component that respects safe area top inset.
 * Useful for top navigation bars or headers.
 */
export const SafeAreaHeader: FC<{ className?: string; children?: ReactNode }> = ({
  className = '',
  children
}) => {
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

  return (
    <div
      className={`shrink-0 z-50 bg-stone-900 pb-4 text-white text-xs ${className}`}
      style={{
        paddingTop: safeAreaInsets?.top ?? 0,
      }}
    >
      {children || <Logo />}
    </div>
  );
};
