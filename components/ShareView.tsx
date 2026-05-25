'use client';

import CoverForm from '@/components/forms/CoverForm';
import CompanyGoalForm from '@/components/forms/CompanyGoalForm';
import DeptGoalForm from '@/components/forms/DeptGoalForm';
import PersonalGoalForm from '@/components/forms/PersonalGoalForm';
import CommitmentForm from '@/components/forms/CommitmentForm';
import GradeForm from '@/components/forms/GradeForm';
import PromotionForm from '@/components/forms/PromotionForm';
import BonusForm from '@/components/forms/BonusForm';
import { FormData } from '@/lib/types';

const noop = () => {};

const SECTIONS = [
  { id: 'cover', label: 'カバー' },
  { id: 'group', label: 'グループ目標' },
  { id: 'company', label: '会社目標' },
  { id: 'dept', label: '部署目標' },
  { id: 'personal', label: '個人目標' },
  { id: 'commitment', label: 'ギャランティ' },
  { id: 'grade', label: 'グレード表' },
  { id: 'promotion', label: '昇格・昇給' },
  { id: 'bonus', label: 'ボーナス評価' },
];

export default function ShareView({ data }: { data: FormData }) {
  const cover = data.cover;

  return (
    <>
      <div className="scene-bg share-scene-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <header
          className="site-header share-top-header"
          style={{
            padding: '28px 48px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--glass-dark)',
              backdropFilter: 'var(--glass-blur-lg)',
              WebkitBackdropFilter: 'var(--glass-blur-lg)',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://app.instyle.group/_shared/static/logo.svg"
                alt="INSTYLE GROUP"
                style={{ height: 10, marginBottom: 10, filter: 'brightness(0) invert(1)', opacity: 0.45 }}
              />
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-text-inv)',
                  letterSpacing: '-.02em',
                  marginBottom: 4,
                }}
              >
                目標設定シート（閲覧）
                <span style={{ fontSize: '.875rem', fontWeight: 400, opacity: 0.6, marginLeft: 10 }}>
                  {cover.period || ''}
                </span>
              </h1>
              <p style={{ fontSize: '.8125rem', color: 'rgba(243,241,238,.55)' }}>
                {cover.company || '所属法人 未入力'}　／　{cover.name || '氏名 未入力'}　／　グレード {cover.grade || '—'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: '.6875rem',
                  color: 'rgba(243,241,238,.85)',
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(243,241,238,.20)',
                  borderRadius: 999,
                  padding: '4px 12px',
                  letterSpacing: '.05em',
                }}
              >
                READ ONLY
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="share-print-btn"
                style={{
                  fontSize: '.75rem',
                  fontWeight: 500,
                  color: 'rgba(243,241,238,.85)',
                  background: 'rgba(255,255,255,.10)',
                  border: '1px solid rgba(243,241,238,.30)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  letterSpacing: '.02em',
                }}
              >
                PDFで書き出す
              </button>
            </div>
          </div>
        </header>

        <nav
          className="share-anchor-bar"
          aria-label="セクション内ナビゲーション"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            background: 'rgba(32,33,26,.86)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '8px 24px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'thin',
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              margin: '0 auto',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  fontSize: '.75rem',
                  fontWeight: 500,
                  color: 'rgba(243,241,238,.72)',
                  textDecoration: 'none',
                  padding: '5px 12px',
                  borderRadius: 999,
                  letterSpacing: '.02em',
                  transition: 'all 160ms cubic-bezier(.4,0,.2,1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.10)';
                  e.currentTarget.style.color = 'rgba(243,241,238,1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(243,241,238,.72)';
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <main className="share-view" style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>
          <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
            <Section id="cover"><CoverForm data={data.cover} onChange={noop} /></Section>
            <Section id="group"><CompanyGoalForm data={data.group} onChange={noop} title="01｜グループ目標 記入シート" labelPrefix="グループ" /></Section>
            <Section id="company">
              <CompanyGoalForm
                data={data.company}
                onChange={noop}
                title="02｜会社目標 記入シート"
                labelPrefix="会社"
                parentStrategicFocus={data.group.strategicFocus}
                parentLabelPrefix="グループ"
              />
            </Section>
            <Section id="dept"><DeptGoalForm data={data.dept} onChange={noop} companyStrategicFocus={data.company.strategicFocus} /></Section>
            <Section id="personal"><PersonalGoalForm data={data.personal} onChange={noop} /></Section>
            <Section id="commitment"><CommitmentForm data={data.personal} grade={data.cover.grade} onChange={noop} /></Section>
            <Section id="grade"><GradeForm selectedGrade={data.cover.grade} expectations={data.gradeExpectations} onChange={noop} /></Section>
            <Section id="promotion"><PromotionForm data={data.promotion} onChange={noop} /></Section>
            <Section id="bonus"><BonusForm data={data.bonus} onChange={noop} /></Section>
          </fieldset>
        </main>
      </div>
    </>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="glass-panel share-section"
      style={{ marginBottom: 20, scrollMarginTop: 64 }}
    >
      {children}
    </section>
  );
}

export function ShareError({ message }: { message: string }) {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
      <div className="glass-panel">
        <h1 style={{ fontSize: '1.25rem', marginBottom: 12 }}>シェアリンクを開けませんでした</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>{message}</p>
      </div>
    </main>
  );
}
