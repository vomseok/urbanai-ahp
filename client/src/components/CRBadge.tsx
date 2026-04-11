// CR(일관성 비율) 배지 컴포넌트
// CR < 0.1: 일관성 양호 (녹색)
// CR 0.1~0.2: 주의 (황색)
// CR >= 0.2: 재검토 필요 (적색)

import { getCRStatus } from "@/lib/ahp";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CRBadgeProps {
  cr: number;
  ci?: number;
  lambdaMax?: number;
  n?: number;
  showDetail?: boolean;
  className?: string;
}

export default function CRBadge({ cr, ci, lambdaMax, n, showDetail = false, className }: CRBadgeProps) {
  const status = getCRStatus(cr);

  const config = {
    good: {
      icon: CheckCircle2,
      label: "일관성 양호",
      bg: "oklch(0.95 0.05 145)",
      border: "oklch(0.75 0.12 145)",
      text: "oklch(0.35 0.12 145)",
      iconColor: "oklch(0.55 0.15 145)",
    },
    warning: {
      icon: AlertTriangle,
      label: "일관성 주의",
      bg: "oklch(0.97 0.05 70)",
      border: "oklch(0.85 0.12 70)",
      text: "oklch(0.45 0.12 70)",
      iconColor: "oklch(0.65 0.14 70)",
    },
    bad: {
      icon: XCircle,
      label: "재검토 필요",
      bg: "oklch(0.97 0.05 27)",
      border: "oklch(0.85 0.12 27)",
      text: "oklch(0.45 0.12 27)",
      iconColor: "oklch(0.577 0.245 27)",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div
      className={cn("rounded-lg border p-3", className)}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: c.iconColor }} />
        <span className="text-sm font-semibold" style={{ color: c.text }}>
          {c.label}
        </span>
        <span
          className="ml-auto font-mono text-sm font-bold"
          style={{ color: c.text, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          CR = {(cr * 100).toFixed(1)}%
        </span>
      </div>

      {showDetail && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: c.border }}>
          <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: c.text }}>
            {lambdaMax !== undefined && (
              <div>
                <span className="opacity-70">λmax</span>
                <p className="font-mono font-semibold">{lambdaMax.toFixed(4)}</p>
              </div>
            )}
            {ci !== undefined && (
              <div>
                <span className="opacity-70">CI</span>
                <p className="font-mono font-semibold">{ci.toFixed(4)}</p>
              </div>
            )}
            <div>
              <span className="opacity-70">CR</span>
              <p className="font-mono font-semibold">{cr.toFixed(4)}</p>
            </div>
          </div>

          {status === "bad" && (
            <div className="mt-2 flex items-start gap-1.5">
              <Info size={12} style={{ color: c.iconColor, marginTop: "2px", flexShrink: 0 }} />
              <p className="text-xs" style={{ color: c.text }}>
                CR이 0.1을 초과합니다. 비교 판단을 다시 검토하여 일관성을 높여 주세요.
                특히 A{'>'} B이고 B{'>'} C이면 A{'>'} C가 되어야 합니다.
              </p>
            </div>
          )}

          {status === "warning" && (
            <div className="mt-2 flex items-start gap-1.5">
              <Info size={12} style={{ color: c.iconColor, marginTop: "2px", flexShrink: 0 }} />
              <p className="text-xs" style={{ color: c.text }}>
                CR이 0.1~0.2 사이입니다. 가능하면 비교 판단을 재검토하는 것을 권장합니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
