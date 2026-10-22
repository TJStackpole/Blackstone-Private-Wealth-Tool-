"use client";

import { Component, type ReactNode } from "react";

interface Props {
  addonId: string;
  children: ReactNode;
}

/**
 * The fuse (Rule 4). If anything inside an add-on throws while rendering, this box shows a calm message
 * and the rest of the page, including the map, keeps working.
 */
export default class AddonBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Logged for debugging; the page itself stays usable.
    console.warn(`[addon:${this.props.addonId}]`, error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="status" data-addon-unavailable={this.props.addonId} className="rounded-card border border-dashed border-line bg-bg-raised p-4 sm:p-5 text-sm text-muted-strong">
          This tool is temporarily unavailable. The rest of the page still works.
        </div>
      );
    }
    return this.props.children;
  }
}
