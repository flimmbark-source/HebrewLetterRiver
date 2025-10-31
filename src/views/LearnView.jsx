import React from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';

export default function LearnView() {
  const { t } = useLocalization();

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 shadow-lg shadow-slate-950/40">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{t('learn.title')}</h2>
        <p className="text-sm text-slate-400">{t('learn.intro')}</p>
      </header>
      <p className="text-sm text-slate-300">{t('learn.body')}</p>
    </section>
  );
}
