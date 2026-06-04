/* ui.jsx — shared shell components */

function useIsMobile(bp = 640) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth <= bp);
  React.useEffect(() => {
    const on = () => setM(window.innerWidth <= bp);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

function DecodeText({ text, className, style, perChar=42 }) {
  const [out, setOut] = React.useState(text);
  React.useEffect(()=>{
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pool = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const isStruct = (c)=> !/[a-z0-9]/i.test(c);
    let raf; const start = performance.now();
    const tick = (now)=>{
      const revealed = Math.floor((now - start) / perChar);
      let s = '', done = true;
      for (let i=0;i<text.length;i++){
        const ch = text[i];
        if (i < revealed || isStruct(ch)) { s += ch; }
        else { s += pool[Math.floor(Math.random()*pool.length)]; done = false; }
      }
      setOut(s);
      if (!done) raf = requestAnimationFrame(tick); else setOut(text);
    };
    setOut(text.split('').map((c)=> isStruct(c)?c:pool[Math.floor(Math.random()*pool.length)]).join(''));
    raf = requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  }, []);
  return <div className={className} style={style}>{out}</div>;
}

function Logo({ go }) {
  return (
    <div className="logo" onClick={()=>go('home')}>
      <Mascot head size={42} anim={true} />
      <div style={{lineHeight:1.05}}>
        <div className="word">Broken<b>Robot</b></div>
        <DecodeText className="tld" text="// brokenrobot.xyz" />
      </div>
    </div>
  );
}

function Header({ page, go, theme, toggleTheme }) {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Logo go={go} />
        <nav className="nav">
          {NAV.map(n => (
            <a key={n.id} className={`${page===n.id || (n.id==='blog'&&page==='article') ? 'active':''} ${n.id==='home'?'hide-sm':''}`}
               onClick={()=>go(n.id)}>{n.label}</a>
          ))}
          <a className="hide-sm" onClick={()=>go('404')} title="It's broken on purpose">404</a>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle light / dark"
                  aria-label="Toggle theme" style={{marginLeft:8}}>
            {theme==='dark' ? <IconSun size={18}/> : <IconMoon size={18}/>}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Social({ size=18, gap=14, labeled=false }) {
  const items = [
    { I:IconGithub,   label:'GitHub' },
    { I:IconBluesky,  label:'Bluesky' },
    { I:IconMastodon, label:'Mastodon' },
    { I:IconRss,      label:'RSS' },
  ];
  if (labeled) {
    return (
      <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
        {items.map(({I,label})=>(
          <a key={label} className="btn btn-ghost" title={label} aria-label={label}>
            <I size={size}/>{label}
          </a>
        ))}
      </div>
    );
  }
  return (
    <div style={{display:'flex', gap, alignItems:'center'}}>
      {items.map(({I,label})=>(
        <a key={label} className="icon-btn" title={label} aria-label={label}
           style={{width:38,height:38}}><I size={size}/></a>
      ))}
    </div>
  );
}

function Footer({ go }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="grid">
          <div style={{maxWidth:300}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
              <Mascot head size={36} anim={true}/>
              <span style={{fontFamily:'var(--ff-display)', fontWeight:700}}>Broken Robot</span>
            </div>
            <p className="muted" style={{fontSize:14.5, lineHeight:1.6, margin:0}}>
              A calm, ad-free corner of the web for writing about software. No trackers,
              no spyware, no marketing department. Just a human and a slightly broken robot.
            </p>
          </div>
          <div>
            <div className="col-title">Writing</div>
            <div className="links">
              <a onClick={()=>go('blog')}>All posts</a>
              <a onClick={()=>go('blog')}>Tags</a>
              <a onClick={()=>go('about')}>About me</a>
              <a onClick={()=>go('about')}>About this site</a>
            </div>
          </div>
          <div>
            <div className="col-title">Elsewhere</div>
            <div className="links">
              <a>{AUTHOR.github}</a>
              <a>{AUTHOR.bluesky}</a>
              <a>{AUTHOR.linkedin}</a>
              <a>RSS feed</a>
            </div>
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {AUTHOR.name} · built with care, held together with tape</span>
          <span>↑ no cookies were harmed</span>
        </div>
      </div>
    </footer>
  );
}

function HeroPH({ label, ratio='16/9', radius=14, style }) {
  return (
    <div className="hero-ph" style={{aspectRatio:ratio, borderRadius:radius, ...style}}>
      <span className="label">▦ {label}</span>
    </div>
  );
}

function PostCard({ post, go }) {
  return (
    <article className="card" onClick={()=>go('article', post.slug)}>
      <HeroPH label={post.hero.split(' — ')[0]} radius={0} style={{borderRadius:0, borderLeft:0, borderRight:0, borderTop:0}}/>
      <div className="body">
        <div className="taglist" style={{marginBottom:2}}>
          {post.tags.slice(0,2).map(t=> <span key={t} className="tag">{t}</span>)}
        </div>
        <h3>{post.title}</h3>
        <p className="excerpt">{post.excerpt}</p>
        <div className="meta">
          <span>{fmtDate(post.date)}</span>
          <span className="dot"></span>
          <span style={{display:'inline-flex',alignItems:'center',gap:5}}><IconClock size={13}/>{post.readingTime} min</span>
        </div>
      </div>
    </article>
  );
}

Object.assign(window, { Logo, Header, Social, Footer, HeroPH, PostCard, useIsMobile });
