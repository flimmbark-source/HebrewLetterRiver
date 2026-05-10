/**
 * Developer-facing error screen for Pack Scene resolution problems
 * (invalid_blueprint or invalid_resolved_scene). Rendered only when
 * import.meta.env.DEV is true; production paths fall back to
 * PackSceneNotAvailable so end users never see the raw errors.
 */
export default function PackSceneDevError({ status, onExit }) {
  const errors = Array.isArray(status?.errors) ? status.errors : [];
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#fff5f5] px-5 py-10 text-left text-[#5b1d1d]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Pack Scene resolver error (dev only)</h1>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl bg-[#5b1d1d] px-3 py-1.5 text-sm font-bold text-white"
          >
            Back
          </button>
        </div>
        <p className="mb-4 text-sm font-semibold">Status: {status?.status || 'unknown'}</p>
        {errors.length === 0 ? (
          <p className="text-sm">No structured errors were attached to this status.</p>
        ) : (
          <ul className="space-y-2">
            {errors.map((err, idx) => (
              <li key={idx} className="rounded-xl border border-[#e0b4b4] bg-white px-3 py-2 text-sm">
                <div className="font-mono text-xs font-bold text-[#a02828]">{err.code}</div>
                {err.beatId ? (
                  <div className="font-mono text-xs text-[#7b3737]">beat: {err.beatId}</div>
                ) : null}
                <div className="mt-1">{err.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
