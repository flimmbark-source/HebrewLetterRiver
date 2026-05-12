import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * Shown to the user when a Pack Scene cannot be resolved for the current
 * language pair (missing target realization or missing app strings).
 * Uses the i18n t() function so the message is localized when possible,
 * with a neutral English fallback. No silent language fallback for the
 * scene itself — the message simply states the scene is unavailable.
 */
export default function PackSceneNotAvailable({ status, onExit }) {
  const { t } = useLocalization();
  const message = t(
    'packScene.unavailable.message',
    'Practice in Context is not available for this language yet.'
  );
  const backLabel = t('packScene.unavailable.back', 'Back');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#fbf4e4] px-5 text-center">
      <div className="max-w-md">
        <p className="text-lg font-bold text-[#183d2e]">{message}</p>
        {status?.missingLineIds?.length ? (
          <p className="mt-2 text-xs font-medium text-[#7b8077]">
            {t('packScene.unavailable.missingLinesCount', '{{count}} line(s) not yet translated.', {
              count: status.missingLineIds.length,
            })}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onExit}
          className="mt-4 inline-flex items-center rounded-2xl bg-[#2f6b4c] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
