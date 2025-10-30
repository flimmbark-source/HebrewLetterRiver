import React from 'react';

export default function LearnView() {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 shadow-lg shadow-slate-950/40">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Learn</h2>
        <p className="text-sm text-slate-400">
          Dive into curated lessons to master each Hebrew letter. Fresh learning modules will appear here soon!
        </p>
      </header>
      <p className="text-sm text-slate-300">
        Until then, keep exploring the river and check back regularly for guided practice sessions, pronunciation tips, and
        cultural insights.
      </p>
    </section>
  );
}
