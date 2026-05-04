/**
 * Reference content for the inline blocking script in BaseLayout.astro <head>.
 * The actual script is duplicated inline in the layout so it runs before paint
 * (no module overhead). Keep this file in sync if the bootstrap logic changes.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("mk-theme");if(t!=="dark"&&t!=="light"){t="dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;
