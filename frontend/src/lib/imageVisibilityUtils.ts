import { useState, useEffect } from 'react';
import type {
  DeviceType,
  SubmoduleMode,
  ItemImageVisibilityMatrix,
  Settings,
} from '../types/app.types';

export const DEFAULT_IMAGE_VISIBILITY_MATRIX: ItemImageVisibilityMatrix = {
  qsr: { desktop: false, tablet: false, mobile: false },
  table: { desktop: false, tablet: false, mobile: false },
  digital_menu: { desktop: false, tablet: false, mobile: false },
};

/**
 * Parses and returns the ItemImageVisibilityMatrix from settings.
 * Defaults strictly to false across all submodules and devices.
 */
export function parseImageVisibilityMatrix(settings?: Settings): ItemImageVisibilityMatrix {
  if (!settings) {
    return {
      qsr: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.qsr },
      table: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.table },
      digital_menu: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.digital_menu },
    };
  }

  if (settings.itemImageVisibility) {
    try {
      const parsed =
        typeof settings.itemImageVisibility === 'string'
          ? JSON.parse(settings.itemImageVisibility)
          : settings.itemImageVisibility;
      if (parsed && typeof parsed === 'object') {
        return {
          qsr: {
            desktop: Boolean(parsed.qsr?.desktop ?? false),
            tablet: Boolean(parsed.qsr?.tablet ?? false),
            mobile: Boolean(parsed.qsr?.mobile ?? false),
          },
          table: {
            desktop: Boolean(parsed.table?.desktop ?? false),
            tablet: Boolean(parsed.table?.tablet ?? false),
            mobile: Boolean(parsed.table?.mobile ?? false),
          },
          digital_menu: {
            desktop: Boolean(parsed.digital_menu?.desktop ?? false),
            tablet: Boolean(parsed.digital_menu?.tablet ?? false),
            mobile: Boolean(parsed.digital_menu?.mobile ?? false),
          },
        };
      }
    } catch {
      // fallback
    }
  }

  // Fallback to legacy single boolean `showItemImages` if present
  const legacyVal = settings.showItemImages === 'true' || settings.showItemImages === true;
  if (legacyVal) {
    return {
      qsr: { desktop: true, tablet: true, mobile: true },
      table: { desktop: true, tablet: true, mobile: true },
      digital_menu: { desktop: true, tablet: true, mobile: true },
    };
  }

  return {
    qsr: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.qsr },
    table: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.table },
    digital_menu: { ...DEFAULT_IMAGE_VISIBILITY_MATRIX.digital_menu },
  };
}

/**
 * Returns whether dish images should be visible for a given submodule mode and device.
 * Defaults strictly to false if not configured.
 */
export function isItemImageVisible(
  settings: Settings | undefined,
  mode: SubmoduleMode,
  device: DeviceType
): boolean {
  const matrix = parseImageVisibilityMatrix(settings);
  return matrix[mode]?.[device] ?? false;
}

/**
 * Custom React hook to detect current device based on viewport width:
 * - Desktop: >= 1024px
 * - Tablet: 768px - 1023px
 * - Mobile: < 768px
 */
export function useDeviceType(): DeviceType {
  const getDevice = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  };

  const [device, setDevice] = useState<DeviceType>(getDevice);

  useEffect(() => {
    const handleResize = () => {
      setDevice(getDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return device;
}
