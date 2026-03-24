import React, { useMemo } from 'react';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

const topAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIzHWOoiXw0a1BU87o2LewTUl8n-_HZC92abDxxI91uQwUGpDDtDgWHkTor7IjvjQUcxU7G-n8vr_x7LsbbX6UCGbzaOGQiMHvD0X0hLDyDkwxenmzAxbV13d80mSxIEbzburnmpLQI0pGLrCNFySYaPuV-i4du-NITzYGpCAUfJ6_xI-xPhTpvL3foKAaOrn9l0TeZ1FkLoJDs6MmFvm0sYR4IaDSqzapogXZiRaJ6Vtk8P5f_5-7mlXebxZLoP1TEu4n2VyOKKDq';
const profileAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUTTlpXlJpi8-Vk87830ZwbM-fJhAO47D9hfkSQBnl1p6Hww4mSE_bzbvN9Lo8f8AP1eAwPAqFpy2-nXYjelbRyeF54cpnDvycpZF4V4Du0VLJgPluxjp1YcYvn6LeyVAr3h_1RmgSaMdo5jWg7MuGmxVf3aIkbz--_Jua05GJSwIZdmTNceXvxlptxvlMNY-9jXF_7nXHTWBwfpUCxVA4eP_2i57C-XXLDQdA8yho5MU09xFBPqi371uT-Sw_Gn1IxrmfmWVw000q';

function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
    >
      {children}
    </span>
  );
}

export default function HomeView() {
  const { player, starLevelSize } = useProgress();
  const { setShowPlayModal } = useGame();
  const { languageId, appLanguageId, languageOptions } = useLanguage();
  const { t } = useLocalization();

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const progressPct = starsPerLevel > 0 ? Math.round(Math.min((levelProgress / starsPerLevel) * 100, 100)) : 0;

  const appLanguage = useMemo(
    () => languageOptions.find((option) => option.id === appLanguageId),
    [languageOptions, appLanguageId]
  );

  const practiceLanguage = useMemo(
    () => languageOptions.find((option) => option.id === languageId),
    [languageOptions, languageId]
  );

  return (
    <div className="relative min-h-screen bg-[#fef7ff] text-[#1d1a22]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#fef7ff]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#1b6b4f] bg-[#e7e0eb]">
            <img alt="User Profile" src={topAvatar} className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1b6b4f]">Level {level} • {totalStarsEarned.toLocaleString()} XP</span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#1b6b4f]/10">
          <Icon className="text-[#1b6b4f]" filled>local_fire_department</Icon>
        </button>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 pb-48 pt-24">
        <section>
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#1b6b4f]/5 bg-white p-8 text-center shadow-sm">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#f9f1fd]">
              <img alt="Avatar Large" className="h-20 w-20 rounded-full object-cover" src={profileAvatar} />
              <button className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white bg-[#1b6b4f] p-2 text-white shadow-lg">
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Alex River</h1>
              <p className="text-sm text-[#4a6365]">Learning since January 2024</p>
            </div>
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#1b6b4f]">
                <span>LEVEL {level}</span>
                <span>{levelProgress.toLocaleString()} / {starsPerLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#a7f3d0]">
                <div className="h-full rounded-full bg-[#1b6b4f]" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold">Language Learning</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-full bg-[#f9f1fd] p-6 transition-colors hover:bg-[#ede6f1]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="text-[#1b6b4f]">language</Icon>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#4a6365]">App Language</p>
                  <p className="text-lg font-bold">{appLanguage ? getFormattedLanguageName(appLanguage, t) : 'English (US)'}</p>
                </div>
              </div>
              <Icon className="text-[#6f7973]">expand_more</Icon>
            </div>

            <div className="flex items-center justify-between rounded-full bg-[#f9f1fd] p-6 transition-colors hover:bg-[#ede6f1]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-2xl shadow-sm">🇮🇱</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#4a6365]">I'm Learning</p>
                  <p className="text-lg font-bold">{practiceLanguage ? getFormattedLanguageName(practiceLanguage, t) : 'Hebrew'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#1b6b4f]/10 px-3 py-1 text-[10px] font-black text-[#1b6b4f]">ACTIVE</span>
                <Icon className="text-[#6f7973]">swap_horiz</Icon>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <Icon className="text-3xl text-[#855315]" filled>bolt</Icon>
            <div>
              <h3 className="leading-tight font-bold">Daily Goal</h3>
              <p className="text-sm text-[#4a6365]">15 mins / day</p>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <Icon className="text-3xl text-[#1b6b4f]" filled>notifications</Icon>
            <div>
              <h3 className="leading-tight font-bold">Reminders</h3>
              <p className="text-sm text-[#4a6365]">8:00 PM Daily</p>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button
            onClick={() => setShowPlayModal(true)}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#1b6b4f] to-[#1b6b4f]/80 py-5 text-lg font-bold text-white shadow-lg shadow-[#1b6b4f]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Start learning
            <Icon>arrow_forward</Icon>
          </button>
          <p className="mt-6 px-8 text-center text-xs leading-relaxed text-[#4a6365]">
            Your progress is automatically synced with your cloud account.
            {' '}
            <a className="font-bold text-[#1b6b4f] underline underline-offset-4" href="#">Privacy Policy</a>
          </p>
        </section>
      </main>
    </div>
  );
}
