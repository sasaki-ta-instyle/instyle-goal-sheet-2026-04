'use client';
import { useLayoutEffect, useRef } from 'react';
import { PersonalGoalData, SmartGoalRow, SlLevel } from '@/lib/types';

const SMART_FIELDS: { key: 's' | 'm' | 'a' | 'r' | 't'; letter: string; label: string; placeholder: string }[] = [
  { key: 's', letter: 'S', label: 'Specific（具体的）', placeholder: '何を達成するか、具体的に' },
  { key: 'm', letter: 'M', label: 'Measurable（測定可能）', placeholder: '達成度を測る数値・指標' },
  { key: 'a', letter: 'A', label: 'Achievable（達成可能）', placeholder: '現実的に到達可能な水準か' },
  { key: 'r', letter: 'R', label: 'Relevant（関連性）', placeholder: '部署目標・自分の役割との関連' },
  { key: 't', letter: 'T', label: 'Time-bound（期限）', placeholder: '〇月末・期中マイルストーンなど' },
];

const SL_OPTIONS: { value: SlLevel; title: string; desc: string }[] = [
  { value: 'S1', title: 'S1｜指示型', desc: '高指示・低支援。何を・いつまでに・どうやるかを具体的に指示してもらう段階。' },
  { value: 'S2', title: 'S2｜コーチ型', desc: '高指示・高支援。指示を受けつつ理由や背景も共有し、納得して進める段階。' },
  { value: 'S3', title: 'S3｜支援型', desc: '低指示・高支援。やり方は任され、判断に迷うときに上長が支援する段階。' },
  { value: 'S4', title: 'S4｜委任型', desc: '低指示・低支援。目的だけ共有して、進め方も意思決定も自分で完結させる段階。' },
];

interface Props {
  data: PersonalGoalData;
  onChange: (data: PersonalGoalData) => void;
}

const toNumeric = (v: string) =>
  v.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
   .replace(/[^0-9.\-,]/g, '');

function TI({ value, onChange, placeholder, numeric }: { value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <input
      className="input"
      style={{ padding: '6px 8px', fontSize: '.8125rem' }}
      value={value}
      inputMode={numeric ? 'decimal' : undefined}
      onChange={e => onChange(numeric ? toNumeric(e.target.value) : e.target.value)}
      placeholder={placeholder ?? '—'}
    />
  );
}

function TA({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="input"
      rows={1}
      style={{
        padding: '6px 8px',
        fontSize: '.8125rem',
        lineHeight: 1.5,
        resize: 'none',
        overflow: 'hidden',
        width: '100%',
        fontFamily: 'inherit',
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? '—'}
    />
  );
}

export default function PersonalGoalForm({ data, onChange }: Props) {
  const set = <K extends keyof PersonalGoalData>(key: K, value: PersonalGoalData[K]) =>
    onChange({ ...data, [key]: value });

  const updateStatus = (i: number, value: string) => {
    const arr = data.currentStatus.map((r, idx) => idx === i ? { ...r, value } : r);
    set('currentStatus', arr);
  };
  const updateSmart = (i: number, field: keyof SmartGoalRow, value: string) => {
    const arr = data.smartGoals.map((r, idx) => idx === i ? { ...r, [field]: value } : r);
    set('smartGoals', arr);
  };
  return (
    <div>
      <p className="section-title">04｜個人目標 記入シート</p>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>① 現在地の確認</p>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '24%' }}>項目</th>
              <th>内容・記入欄</th>
            </tr>
          </thead>
          <tbody>
            {data.currentStatus.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, fontSize: '.8125rem' }}>{row.label}</td>
                <td>
                  <textarea
                    className="input"
                    style={{ padding: '6px 10px', fontSize: '.8125rem', minHeight: 60 }}
                    value={row.value}
                    onChange={e => updateStatus(i, e.target.value)}
                    placeholder="記入してください"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span>② SMART個人目標</span>
        <a
          href="https://www.dodadsj.com/content/20240206_smart/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '.6875rem',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          SMARTの法則とは ↗
        </a>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {data.smartGoals.map((row, i) => (
          <div
            key={i}
            style={{
              background: 'var(--glass-tinted)',
              borderRadius: 'var(--r)',
              padding: '16px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
            }}
          >
            <p
              style={{
                fontSize: '.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '.04em',
                marginBottom: 12,
              }}
            >
              目標 {i + 1}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <label
                  style={{
                    fontSize: '.75rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    lineHeight: 1.4,
                  }}
                >
                  該当する部署KPI
                </label>
                <TI
                  value={row.relatedKpi || ''}
                  onChange={v => updateSmart(i, 'relatedKpi', v)}
                  placeholder="該当する部署KPIがある場合に記入"
                />
              </div>
              {SMART_FIELDS.map(f => (
                <div
                  key={f.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    alignItems: 'start',
                    gap: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: '.75rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      lineHeight: 1.4,
                      paddingTop: 6,
                    }}
                  >
                    <span style={{ display: 'inline-block', width: 16, fontWeight: 700 }}>{f.letter}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{f.label}</span>
                  </label>
                  <TA
                    value={row[f.key]}
                    onChange={v => updateSmart(i, f.key, v)}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  alignItems: 'start',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <label
                  style={{
                    fontSize: '.75rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    paddingTop: 6,
                  }}
                >
                  備考・補足など
                </label>
                <TA
                  value={row.note}
                  onChange={v => updateSmart(i, 'note', v)}
                  placeholder="備考・補足など"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span>③ SL理論</span>
        <a
          href="https://www.dodadsj.com/content/20230224_sl-theory/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '.6875rem',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          SL理論とは ↗
        </a>
      </p>
      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        今期の自分が S1〜S4 のどこに属するかを<strong>上長と握って</strong>選択してください。期中の関わり方（指示／支援の量）の認識を揃えるためのものです。
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 12,
        }}
      >
        {SL_OPTIONS.map(opt => {
          const selected = data.slLevel === opt.value;
          return (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 'var(--r)',
                background: selected ? 'rgba(255,255,255,.85)' : 'var(--glass-tinted)',
                boxShadow: selected
                  ? 'inset 0 1px 0 rgba(255,255,255,.95), 0 2px 8px rgba(53,54,45,.10)'
                  : 'none',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(.4,0,.2,1)',
              }}
            >
              <input
                type="radio"
                name="slLevel"
                value={opt.value}
                checked={selected}
                onChange={() => set('slLevel', opt.value)}
                style={{ marginTop: 3 }}
              />
              <span style={{ display: 'block' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '.8125rem',
                    fontWeight: 600,
                    color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  {opt.title}
                </span>
                <span style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                  {opt.desc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <textarea
        className="input"
        style={{ width: '100%', minHeight: 64, resize: 'vertical', padding: '8px 10px', fontSize: '.8125rem', marginBottom: 24 }}
        placeholder="上長と握った内容・理由・期中の関わり方の希望など（任意）"
        value={data.slNote}
        onChange={e => set('slNote', e.target.value)}
      />

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 6 }}>④ 上長からの一言</p>
      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
        ここは本人ではなく上長が記入します。シートが書き終わったらシェア用URLを上長に送ってください。
      </p>
      <textarea
        className="input"
        style={{ width: '100%', minHeight: 96, resize: 'vertical', padding: '8px 10px', fontSize: '.8125rem' }}
        placeholder="上長が記入。期初の期待・SL の合意・ギャランティへの所感・コメントなど"
        value={data.supervisorComment}
        onChange={e => set('supervisorComment', e.target.value)}
      />
    </div>
  );
}
