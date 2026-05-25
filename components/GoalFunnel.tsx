'use client';

import { FormData } from '@/lib/types';

interface Props {
  formData: FormData;
  currentStep: number;
}

function truncate(s: string | undefined | null, n: number): string {
  if (!s) return '';
  const t = s.trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
}

interface TierMeta {
  step: number;
  label: string;
}

const TIERS: TierMeta[] = [
  { step: 2, label: 'グループ' },
  { step: 3, label: '会社' },
  { step: 4, label: '部署' },
  { step: 5, label: '個人' },
];

export default function GoalFunnel({ formData, currentStep }: Props) {
  // 個人タイルには「今期の役割・期待（自己認識）」を優先表示
  const personalSummary =
    formData.personal.currentStatus.find(s => s.label.includes('役割') || s.label.includes('期待'))?.value
    || '';

  // 入力済みの内容だけ表示。未入力ならプレースホルダーは出さない。
  const summaries: Record<number, string> = {
    2: truncate(formData.group.strategicFocus, 76),
    3: truncate(formData.company.strategicFocus, 76),
    4: truncate(formData.dept.mission || formData.dept.kgi1.kgi || formData.dept.kgi1.mission, 76),
    5: truncate(personalSummary, 76),
  };

  return (
    <div
      style={{
        padding: '4px 0 0',
      }}
    >
      <p
        style={{
          fontSize: '.625rem',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          letterSpacing: '.14em',
          marginBottom: 16,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        Goal Cascade
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {TIERS.map((tier, i) => {
          // すり鉢状: 100% → 90% → 80% → 70%
          const widthPct = 100 - i * 10;
          const isActive = currentStep === tier.step;
          const isPast = currentStep > tier.step;
          const isFuture = currentStep < tier.step;
          const taper = 4;
          const summary = summaries[tier.step];

          return (
            <div key={tier.step} style={{ width: '100%', position: 'relative' }}>
              {i > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -3,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '5px solid var(--color-text-muted)',
                    opacity: 0.5,
                  }}
                />
              )}
              <div
                style={{
                  width: `${widthPct}%`,
                  margin: '0 auto',
                  padding: '12px 14px',
                  background: isActive
                    ? 'rgba(255,255,255,.95)'
                    : isPast
                    ? 'rgba(255,255,255,.6)'
                    : 'rgba(255,255,255,.28)',
                  clipPath: `polygon(0 0, 100% 0, calc(100% - ${taper}px) 100%, ${taper}px 100%)`,
                  boxShadow: isActive
                    ? 'inset 0 1px 0 rgba(255,255,255,.95), 0 4px 16px rgba(53,54,45,.14)'
                    : 'inset 0 1px 0 rgba(255,255,255,.6)',
                  opacity: isFuture ? 0.55 : 1,
                  transition: 'all 250ms cubic-bezier(.4,0,.2,1)',
                  marginTop: i === 0 ? 0 : 6,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '.8125rem',
                    fontWeight: 700,
                    color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                    letterSpacing: '.04em',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {tier.label}
                </p>
                {summary && (
                  <p
                    style={{
                      fontSize: '.6875rem',
                      lineHeight: 1.55,
                      color: isActive
                        ? 'var(--color-text)'
                        : isPast
                        ? 'var(--color-text)'
                        : 'var(--color-text-muted)',
                      margin: '6px 0 0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                    }}
                  >
                    {summary}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
