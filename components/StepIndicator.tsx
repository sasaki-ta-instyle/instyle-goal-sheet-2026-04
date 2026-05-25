'use client';

const STEPS = [
  { num: 1, label: 'カバー' },
  { num: 2, label: 'グループ目標' },
  { num: 3, label: '会社目標' },
  { num: 4, label: '部署目標' },
  { num: 5, label: '個人目標' },
  { num: 6, label: 'ギャランティ' },
  { num: 7, label: 'グレード' },
  { num: 8, label: '昇格評価' },
  { num: 9, label: 'ボーナス' },
  { num: 10, label: '確認・出力' },
];

interface Props {
  current: number;
  onNavigate: (step: number) => void;
}

export default function StepIndicator({ current, onNavigate }: Props) {
  return (
    <div className="step-nav" style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '0 24px',
      margin: '20px 0',
      position: 'sticky',
      top: 16,
      zIndex: 100,
    }}>
      <nav style={{
        display: 'inline-flex',
        gap: 2,
        padding: 6,
        background: 'rgba(243,241,238,.68)',
        backdropFilter: 'saturate(220%) blur(32px)',
        WebkitBackdropFilter: 'saturate(220%) blur(32px)',
        border: '1px solid rgba(255,255,255,.80)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(0,0,0,.05),0 8px 32px rgba(53,54,45,.14)',
        borderRadius: 999,
      }}>
        {STEPS.map(step => {
          const isActive = step.num === current;
          const isDone = step.num < current;
          return (
            <button
              key={step.num}
              onClick={() => onNavigate(step.num)}
              style={{
                display: 'block',
                padding: '8px 14px',
                fontSize: '.75rem',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-sans)',
                color: isActive ? 'var(--color-text)' : isDone ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
                textDecoration: 'none',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(.4,0,.2,1)',
                whiteSpace: 'nowrap',
                background: isActive ? 'rgba(255,255,255,.85)' : 'transparent',
                boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,.95),0 2px 8px rgba(53,54,45,.08)' : 'none',
              }}
            >
              <span style={{ opacity: isDone ? 0.6 : 1 }}>
                {isDone ? '✓ ' : ''}{step.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
