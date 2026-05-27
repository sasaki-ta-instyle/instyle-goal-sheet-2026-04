'use client';

import { useEffect, useState } from 'react';
import CoverForm from '@/components/forms/CoverForm';
import CompanyGoalForm from '@/components/forms/CompanyGoalForm';
import DeptGoalForm from '@/components/forms/DeptGoalForm';
import PersonalGoalForm from '@/components/forms/PersonalGoalForm';
import CommitmentForm from '@/components/forms/CommitmentForm';
import GradeForm from '@/components/forms/GradeForm';
import PromotionForm from '@/components/forms/PromotionForm';
import BonusForm from '@/components/forms/BonusForm';
import { FormData } from '@/lib/types';
import { baseFromPathname, buildShortShareUrl } from '@/lib/share-codec';

const noop = () => {};

const SECTIONS = [
  { id: 'top', label: 'トップ' },
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
  const [activeId, setActiveId] = useState<string>('top');
  const [comment, setComment] = useState<string>(data.personal.supervisorComment ?? '');
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [publishedCopied, setPublishedCopied] = useState(false);
  const [publishError, setPublishError] = useState('');

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError('');
    setPublishedCopied(false);
    try {
      const next: FormData = {
        ...data,
        personal: { ...data.personal, supervisorComment: comment },
        finalized: true,
      };
      const base = baseFromPathname(window.location.pathname);
      const res = await fetch(`${base}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { token } = (await res.json()) as { token?: string };
      if (!token) throw new Error('no token');
      const url = buildShortShareUrl(window.location.origin, window.location.pathname, token);
      setPublishedUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setPublishedCopied(true);
        setTimeout(() => setPublishedCopied(false), 2400);
      } catch {}
    } catch (e) {
      console.error(e);
      setPublishError('新URLの発行に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const prev = document.title;
    const name = (cover.name ?? '').trim();
    document.title = name
      ? `${name} | 目標設定シート | INSTYLE GROUP`
      : '目標設定シート | INSTYLE GROUP';
    return () => { document.title = prev; };
  }, [cover.name]);

  // 入力欄に書かれた URL を抽出して、欄の直下に「↗ URL」リンクを別タブで開く形で添える。
  // fieldset disabled 内の input/textarea はリンクにできないので、外側に補助リンクを生やす。
  useEffect(() => {
    const root = document.querySelector('.share-view');
    if (!root) return;
    root.querySelectorAll('.share-url-links').forEach(el => el.remove());
    const urlPattern = /https?:\/\/[^\s)」』、,】\]]+/g;
    const controls = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    controls.forEach(el => {
      const val = el.value;
      if (!val) return;
      const matches = val.match(urlPattern);
      if (!matches || matches.length === 0) return;
      const unique = Array.from(new Set(matches));
      const wrapper = document.createElement('div');
      wrapper.className = 'share-url-links';
      wrapper.style.cssText = 'margin-top: 4px; display: flex; flex-direction: column; gap: 2px;';
      unique.forEach(raw => {
        const url = raw.replace(/[.,;:!?'")\]}>]+$/, '');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const label = url.length > 56 ? url.slice(0, 56) + '…' : url;
        a.textContent = `↗ ${label}`;
        a.style.cssText = 'font-size: .7rem; color: var(--color-info); text-decoration: underline; word-break: break-all; line-height: 1.5;';
        wrapper.appendChild(a);
      });
      el.parentNode?.insertBefore(wrapper, el.nextSibling);
    });
  }, [data]);

  useEffect(() => {
    const targets = SECTIONS
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // ビューポート上 80px（sticky アンカーバー分）から、画面真ん中 + 少し下までを観察領域に。
    // 可視中の要素のうち最上部にあるものを「現在地」とする。
    const observer = new IntersectionObserver(
      entries => {
        setActiveId(prev => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .map(e => e.target.id);
          if (visible.length === 0) return prev;
          // SECTIONS の順序で先頭にあるものを返す（上から走査）
          return SECTIONS.find(s => visible.includes(s.id))?.id ?? prev;
        });
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: 0,
      }
    );
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="scene-bg share-scene-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <header
          id="top"
          className="site-header share-top-header"
          style={{
            padding: '28px 48px 22px',
            position: 'relative',
            overflow: 'hidden',
            scrollMarginTop: 0,
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
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {SECTIONS.map(s => {
              const active = s.id === activeId;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={active ? 'true' : undefined}
                  style={{
                    fontSize: '.75rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'rgba(243,241,238,1)' : 'rgba(243,241,238,.55)',
                    background: active ? 'rgba(255,255,255,.14)' : 'transparent',
                    textDecoration: 'none',
                    padding: '5px 12px',
                    borderRadius: 999,
                    letterSpacing: '.02em',
                    transition: 'all 200ms cubic-bezier(.4,0,.2,1)',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,.08)';
                      e.currentTarget.style.color = 'rgba(243,241,238,.92)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(243,241,238,.55)';
                    }
                  }}
                >
                  {s.label}
                </a>
              );
            })}
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

          {!data.finalized && (
          <section
            id="supervisor-comment"
            className="glass-panel"
            style={{ marginTop: 28, scrollMarginTop: 64 }}
          >
            <p className="section-title">上長コメントを追記して、新URLでオーナーに展開</p>
            <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
              本人の入力内容を確認したうえで、下のテキストエリアに上長コメントを記入してください。
              「コメント付き新URLを発行」を押すと、コメントを含めた新しいシェア用URLが発行され、自動でクリップボードにコピーされます。
              そのURLをそのままオーナーに展開してください。
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="期初の期待・SL の合意・ギャランティへの所感・コメントなど"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '.8125rem',
                lineHeight: 1.7,
                fontFamily: 'inherit',
                background: 'rgba(255,255,255,.78)',
                border: '1px solid var(--glass-border-w)',
                borderRadius: 'var(--r)',
                resize: 'none',
                minHeight: 120,
                fieldSizing: 'content',
                color: 'var(--color-text)',
              } as React.CSSProperties}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing || !comment.trim()}
                className="btn btn-primary"
                style={{ fontSize: '.8125rem' }}
              >
                {publishing
                  ? '発行中…'
                  : publishedCopied
                    ? '✓ 新URLをコピーしました'
                    : publishedUrl
                      ? '🔗 もう一度発行＆コピー'
                      : '🔗 コメント付き新URLを発行'}
              </button>
              {publishError && (
                <span style={{ fontSize: '.75rem', color: 'var(--color-error)' }}>{publishError}</span>
              )}
            </div>
            {publishedUrl && (
              <div style={{
                marginTop: 14,
                padding: '14px 16px',
                background: 'rgba(123,183,133,.14)',
                border: '1px solid rgba(123,183,133,.30)',
                borderRadius: 'var(--r)',
                display: 'grid',
                gap: 10,
              }}>
                <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  ✓ コメント付き新URLを発行しました。このまま Slack/メールでオーナーに送付してください。
                </div>
                <code
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--color-text-muted)',
                    wordBreak: 'break-all',
                    background: 'rgba(255,255,255,.65)',
                    padding: '8px 10px',
                    borderRadius: 'var(--r-sm)',
                    lineHeight: 1.5,
                  }}
                >
                  {publishedUrl}
                </code>
                <div style={{ display: 'flex', gap: 14, fontSize: '.75rem' }}>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-info)', textDecoration: 'underline' }}
                  >
                    新規タブで見え方を確認 →
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(publishedUrl);
                        setPublishedCopied(true);
                        setTimeout(() => setPublishedCopied(false), 2400);
                      } catch {}
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-info)',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontSize: '.75rem',
                    }}
                  >
                    もう一度コピー
                  </button>
                </div>
              </div>
            )}
          </section>
          )}
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
