/**
 * Inline, render-blocking theme bootstrap for BaseLayout's <head> so the first
 * paint already uses the right theme. A saved choice wins; otherwise the
 * operating system preference decides. Without JS the page stays dark.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem("mk-theme")}catch(e){}if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.setAttribute("data-theme",t)})();`;
