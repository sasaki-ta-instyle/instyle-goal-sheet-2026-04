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

export default function ShareView({ data }: { data: FormData }) {
  const cover = data.cover;

  return (
    <>
      <div className="scene-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <header
          className="site-header"
          style={{
            padding: '32px 48px 28px',
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
          </div>
        </header>

        <main className="share-view" style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>
          <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
            <Section><CoverForm data={data.cover} onChange={noop} /></Section>
            <Section><CompanyGoalForm data={data.group} onChange={noop} title="01｜グループ目標 記入シート" labelPrefix="グループ" /></Section>
            <Section>
              <CompanyGoalForm
                data={data.company}
                onChange={noop}
                title="02｜会社目標 記入シート"
                labelPrefix="会社"
                parentStrategicFocus={data.group.strategicFocus}
                parentLabelPrefix="グループ"
              />
            </Section>
            <Section><DeptGoalForm data={data.dept} onChange={noop} companyStrategicFocus={data.company.strategicFocus} /></Section>
            <Section><PersonalGoalForm data={data.personal} onChange={noop} /></Section>
            <Section><CommitmentForm data={data.personal} grade={data.cover.grade} onChange={noop} /></Section>
            <Section><GradeForm selectedGrade={data.cover.grade} expectations={data.gradeExpectations} onChange={noop} /></Section>
            <Section><PromotionForm data={data.promotion} onChange={noop} /></Section>
            <Section><BonusForm data={data.bonus} onChange={noop} /></Section>
          </fieldset>
        </main>
      </div>
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="glass-panel" style={{ marginBottom: 20 }}>{children}</div>;
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
