/* app.jsx — routing, theme, tweaks, mount */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "page": "home",
  "slug": "the-human-side-of-code-reviews-in-large-teams",
  "theme": "light",
  "accent": "#f59e0b",
  "heroPose": "wave",
  "homeLayout": "hello",
  "articleLayout": "classic"
}/*EDITMODE-END*/;

// accent -> AA-safe ink color per theme (links / accent text)
const ACCENT_INK = {
  '#f59e0b': { light:'#b45309', dark:'#fbbf24' },
  '#14b8a6': { light:'#0f766e', dark:'#2dd4bf' },
  '#fb7185': { light:'#be123c', dark:'#fda4af' },
  '#a78bfa': { light:'#6d28d9', dark:'#c4b5fd' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const page = t.page, theme = t.theme;

  const go = React.useCallback((p, slug) => {
    if (slug) setTweak({ page:p, slug });
    else setTweak('page', p);
    window.scrollTo({ top:0, behavior:'instant' in window ? 'instant' : 'auto' });
  }, [setTweak]);
  React.useEffect(()=>{ window.__go = go; }, [go]);

  // apply theme + accent to the document
  React.useEffect(()=>{
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    const ink = (ACCENT_INK[t.accent] || ACCENT_INK['#f59e0b'])[theme];
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-ink', ink);
    root.style.setProperty('--avatar-filter', theme==='dark' ? 'invert(1) hue-rotate(180deg) brightness(.92) contrast(1.05)' : 'none');
  }, [theme, t.accent]);

  // reading progress on articles
  const [prog, setProg] = React.useState(0);
  React.useEffect(()=>{
    if (page!=='article') return;
    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      setProg(h>0 ? Math.min(100, (window.scrollY/h)*100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    return ()=> window.removeEventListener('scroll', onScroll);
  }, [page, t.slug, t.articleLayout]);

  const common = { go };

  return (
    <>
      {page==='article' && <div className="progress" style={{width: prog+'%'}}></div>}
      <Header page={page} go={go} theme={theme}
              toggleTheme={()=>setTweak('theme', theme==='dark'?'light':'dark')} />

      {page==='home'    && <Home {...common} layout={t.homeLayout} heroPose={t.heroPose} />}
      {page==='blog'    && <Blog go={go} />}
      {page==='article' && <Article go={go} slug={t.slug} layout={t.articleLayout} />}
      {page==='about'   && <About {...common} />}
      {page==='404'     && <NotFound {...common} />}

      <Footer go={go} />

      <TweaksPanel>
        <TweakSection label="View" />
        <TweakSelect label="Page" value={t.page}
          options={[
            {value:'home',label:'Home'},{value:'blog',label:'Writing (index)'},
            {value:'article',label:'Article'},{value:'about',label:'About'},{value:'404',label:'404 page'}]}
          onChange={(v)=>go(v)} />

        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme} options={['light','dark']}
          onChange={(v)=>setTweak('theme', v)} />
        <TweakColor label="Accent" value={t.accent}
          options={['#f59e0b','#14b8a6','#fb7185','#a78bfa']}
          onChange={(v)=>setTweak('accent', v)} />

        <TweakSection label="Mascot" />
        <TweakRadio label="Hero pose" value={t.heroPose}
          options={['neutral','wave','confused']}
          onChange={(v)=>{ setTweak('heroPose', v); if(page!=='home') go('home'); }} />

        <TweakSection label="Home layout" />
        <TweakRadio label="Layout" value={t.homeLayout} options={['hello','centered','editorial']}
          onChange={(v)=>{ setTweak('homeLayout', v); if(page!=='home') go('home'); }} />

        <TweakSection label="Article layout" />
        <TweakRadio label="Layout" value={t.articleLayout} options={['classic','sidemeta','minimal']}
          onChange={(v)=>{ setTweak('articleLayout', v); if(page!=='article') go('article', t.slug); }} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
