/* icons.jsx — small functional UI icons (stroke-based, currentColor) */

function Ico({ d, size=18, fill=false, vb=24, sw=1.8, children }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill?'currentColor':'none'}
         stroke={fill?'none':'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" style={{display:'block'}}>
      {d ? <path d={d} /> : children}
    </svg>
  );
}

const IconSun    = (p)=> <Ico {...p}><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></Ico>;
const IconMoon   = (p)=> <Ico {...p} d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" />;
const IconArrow  = (p)=> <Ico {...p} d="M5 12h13M13 6l6 6-6 6" />;
const IconClock  = (p)=> <Ico {...p}><circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3 2"/></Ico>;
const IconRss    = (p)=> <Ico {...p}><path d="M5 11a8 8 0 0 1 8 8M5 6a13 13 0 0 1 13 13"/><circle cx="5.5" cy="18.5" r="1.4" fill="currentColor" stroke="none"/></Ico>;
const IconSearch = (p)=> <Ico {...p}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></Ico>;
const IconGithub = (p)=> <Ico {...p} fill vb={24} d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>;
const IconBluesky= (p)=> <Ico {...p} fill d="M12 10.8C10.9 8.6 7.9 4.9 5.2 4.2 3.6 3.8 3 4.5 3 6.1c0 1.5.9 6.3 1.4 7.1.7 1.2 2 1.4 3.2 1.2-2.1.4-2.6 1.6-1.4 2.8 2.2 2.3 3.2-.6 3.5-1.4.1-.3.2-.5.3-.5s.2.2.3.5c.3.8 1.3 3.7 3.5 1.4 1.2-1.2.7-2.4-1.4-2.8 1.2.2 2.5 0 3.2-1.2.5-.8 1.4-5.6 1.4-7.1 0-1.6-.6-2.3-2.2-1.9-2.7.7-5.7 4.4-6.8 6.6Z"/>;
const IconMastodon=(p)=> <Ico {...p} fill d="M21 14.2c-.3 1.5-2.6 3.1-5.2 3.4-1.4.2-2.7.3-4.1.2-2.3-.1-4.1-.6-4.1-.6 0 .2 0 .4.1.6.3 1.1 1.9 1.2 3.4 1.3 1.5 0 2.9-.4 2.9-.4v1.8s-1.1.6-3 .7c-1.1.1-2.4 0-3.9-.4-3.3-.9-3.8-4.3-3.9-7.8 0-1 0-2 0-2.8.1-3.4 2.3-4.4 2.3-4.4C6 5.6 8 5.4 10 5.4h.1c2 0 4 .2 5.5.9 0 0 2.2 1 2.3 4.4 0 0 0 2.5-.9 3.5Z"/>;
const IconHash   = (p)=> <Ico {...p} d="M9 4 7 20M17 4l-2 16M5 9h15M4 15h15"/>;
const IconNoAds  = (p)=> <Ico {...p}><circle cx="12" cy="12" r="8.4"/><path d="M6.1 6.1l11.8 11.8"/></Ico>;
const IconNoTrack= (p)=> <Ico {...p}><path d="M3.2 12s3.4-5.6 8.8-5.6c1.3 0 2.5.3 3.5.8M20.8 12s-3.4 5.6-8.8 5.6c-1.3 0-2.5-.3-3.5-.8"/><circle cx="12" cy="12" r="2.6"/><path d="M4 4l16 16"/></Ico>;
const IconShield = (p)=> <Ico {...p} d="M12 3l7 2.7v5c0 4.5-3 7.7-7 9.3-4-1.6-7-4.8-7-9.3v-5L12 3Z"/>;

Object.assign(window, { IconSun, IconMoon, IconArrow, IconClock, IconRss, IconSearch, IconGithub, IconBluesky, IconMastodon, IconHash, IconNoAds, IconNoTrack, IconShield });
