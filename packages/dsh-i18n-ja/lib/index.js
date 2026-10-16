// Host loader entry for the dsh-i18n-ja plugin — runs in the DSH host process.
// Pure browser plugin: the host half intentionally has no behavior; the
// 日本語 language + dictionary registration lives in the browser half (lib/client.js).

/** Apply the host half (no-op for a pure browser plugin). */
function apply(_ctx) {}

export { apply };
