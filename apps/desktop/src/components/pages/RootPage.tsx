import { Outlet } from 'react-router';
import Sidebar from '../navigation/Sidebar';
import { platform } from '@tauri-apps/plugin-os';
import { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from '../navigation/Toolbar';
import { NotificationWrapper, useNotification } from 'chefdeck-shared';
import { useTauriListener } from '../../hooks/useTauriListener';

export default function RootPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [dragWidth, setDragWidth] = useState(0);

  const { addNotification } = useNotification();

  const pxToNum = (px: string) => Number(px.replace('px', '')) || 0;

  const getEffectiveRadius = useCallback(
    (cs: CSSStyleDeclaration) =>
      pxToNum(
        (cs.borderTopLeftRadius || cs.borderRadius || '0px').split(' ')[0]
      ),
    []
  );

  const draw = useCallback(() => {
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const canvas = canvasRef.current;
    if (!container || !sidebar || !canvas) return;

    const cR = container.getBoundingClientRect();
    const sR = sidebar.getBoundingClientRect();

    const cW = Math.max(1, Math.round(cR.width));
    const cH = Math.max(1, Math.round(cR.height));

    // Resize canvas to match container pixels
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cW * dpr);
    canvas.height = Math.floor(cH * dpr);

    // Style size (CSS pixels)
    canvas.style.width = `${cW}px`;
    canvas.style.height = `${cH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.resetTransform();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cW, cH);

    // Paint the overlay slab (matches your theme)
    // Use computed background to match Tailwind bg colors
    const isDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const overlayColor = isDark ? '#202020' : '#ffffff';

    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, cW, cH);

    // Compute hole coordinates relative to container
    const x = Math.round(sR.left - cR.left);
    const y = Math.round(sR.top - cR.top);
    const w = Math.round(sR.width);
    const h = Math.round(sR.height);

    // Effective corner radius
    const cs = getComputedStyle(sidebar);
    const r = Math.max(0, getEffectiveRadius(cs));
    const rx = Math.min(r, Math.floor(w / 2));
    const ry = Math.min(r, Math.floor(h / 2));

    // Punch the hole with destination-out
    ctx.globalCompositeOperation = 'destination-out';

    // Draw rounded rect path for hole
    ctx.beginPath();
    // If no rounding, just a rect
    if (rx <= 0.5 || ry <= 0.5) {
      ctx.rect(x, y, w, h);
    } else {
      // Rounded rectangle using arcTo (uses a single arc radius that's the min of rx/ry)
      const rArc = Math.min(rx, ry);
      const x2 = x + w;
      const y2 = y + h;

      // Start at top-left + radius
      ctx.moveTo(x + rArc, y);
      // Top edge
      ctx.lineTo(x2 - rArc, y);
      // Top-right corner
      ctx.arcTo(x2, y, x2, y + rArc, rArc);
      // Right edge
      ctx.lineTo(x2, y2 - rArc);
      // Bottom-right corner
      ctx.arcTo(x2, y2, x2 - rArc, y2, rArc);
      // Bottom edge
      ctx.lineTo(x + rArc, y2);
      // Bottom-left corner
      ctx.arcTo(x, y2, x, y2 - rArc, rArc);
      // Left edge
      ctx.lineTo(x, y + rArc);
      // Top-left corner
      ctx.arcTo(x, y, x + rArc, y, rArc);
    }
    ctx.closePath();
    ctx.fill();

    // Restore for potential future draws
    ctx.globalCompositeOperation = 'source-over';
  }, [getEffectiveRadius]);

  useEffect(() => {
    if (platform() === 'macos') {
      const ro = new ResizeObserver(draw);
      if (sidebarRef.current) ro.observe(sidebarRef.current);
      if (containerRef.current) ro.observe(containerRef.current);
      window.addEventListener('resize', draw);

      // Initial paint
      draw();

      return () => {
        ro.disconnect();
        window.removeEventListener('resize', draw);
      };
    }
  }, [draw]);

  useEffect(() => {
    if (platform() !== 'macos') return;

    const sidebarNode = sidebarRef.current;
    const contentNode = contentRef.current;
    if (!sidebarNode || !contentNode) return;

    const ro = new ResizeObserver(() => {
      const w = contentNode.getBoundingClientRect().width;
      setDragWidth(window.innerWidth - Math.round(w));
    });

    ro.observe(sidebarNode);

    // Initialize once so your drag region width is correct on mount
    const initialW = contentNode.getBoundingClientRect().width;
    setDragWidth(window.innerWidth - Math.round(initialW));

    return () => {
      ro.unobserve(sidebarNode);
      ro.disconnect();
    };
  }, []);

  useTauriListener('new_recipe_cloud_error', (event) => {
    addNotification(event.payload, 'error');
  });

  useTauriListener('delete_recipe_cloud_error', (event) => {
    addNotification(event.payload, 'error');
  });

  return (
    <>
      <NotificationWrapper />
      <div
        className="h-10 fixed top-0 left-0 z-50 inset-0 outline-red-900"
        style={{ width: dragWidth + 'px' }}
        data-tauri-drag-region
      ></div>

      <div
        ref={containerRef}
        className={`relative w-full h-full flex ${platform() === 'macos' ? 'gap-2 p-2' : 'bg-white dark:bg-[#202020]'} overflow-hidden bg-transparent`}
      >
        {/* Overlay canvas that creates the hole */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0"
        />

        {/* Foreground UI */}
        <Sidebar ref={sidebarRef} />
        <div ref={contentRef} className={`flex-1 flex flex-col z-10`}>
          <Toolbar />
          <div className="flex-1 min-h-0 overflow-y-auto relative">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
