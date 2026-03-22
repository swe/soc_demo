/** localStorage key — must match ThemeProvider `storageKey` default */
export const THEME_STORAGE_KEY = 'theme'

/**
 * Blocking theme init for root layout (beforeInteractive).
 * Keeps first paint in sync with ThemeProvider + localStorage.
 */
export const THEME_INIT_SCRIPT = `(function(){
try{
var k='${THEME_STORAGE_KEY}';
var d=document.documentElement;
var t=localStorage.getItem(k);
if(!t)t='system';
var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;
var resolved=t==='system'?(dark?'dark':'light'):t;
d.classList.remove('light','dark');
d.classList.add(resolved);
d.style.colorScheme=resolved==='dark'?'dark':'light';
}catch(e){}
})();`
