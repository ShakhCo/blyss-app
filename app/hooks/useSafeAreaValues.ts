import { useSignal, viewport } from "@tma.js/sdk-react";

export interface SafeAreaValue {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface ContentAreaValue {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export function useSafeAreaValues(): { safeAreaValue: SafeAreaValue; contentAreaValue: ContentAreaValue } {
    const safeAreaInsets = useSignal(viewport.safeAreaInsets);
    const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);

    const safeAreaValue: SafeAreaValue = {
        top: safeAreaInsets?.top ?? 0,
        bottom: safeAreaInsets?.bottom ?? 0,
        left: safeAreaInsets?.left ?? 0,
        right: safeAreaInsets?.right ?? 0,
    };

    const contentAreaValue: ContentAreaValue = {
        top: contentSafeAreaInsets?.top ?? 0,
        bottom: contentSafeAreaInsets?.bottom ?? 0,
        left: contentSafeAreaInsets?.left ?? 0,
        right: contentSafeAreaInsets?.right ?? 0,
    };

    return { safeAreaValue, contentAreaValue };
}
