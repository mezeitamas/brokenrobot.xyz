/* pages.jsx — Home · Blog · Article · About · 404 */

/* ---------- shared bits ---------- */
function Greeting({ compact }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        <span className="mono">// status: mostly operational</span>
      </div>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, letterSpacing: '-.03em',
        fontSize: compact ? 'clamp(30px,6vw,52px)' : 'clamp(31px,5.4vw,64px)',
        lineHeight: 1.05, margin: '0 0 22px' }}>
        Hey — I&rsquo;m Tamas.<br />
        <span style={{ color: 'var(--muted)' }}>I write about </span>
        <span style={{ color: 'var(--accent-ink)' }}>building software</span>
        <span style={{ color: 'var(--muted)' }}> with humans &amp; agents.</span>
      </h1>
      <p className="muted" style={{ fontSize: 18.5, lineHeight: 1.6, maxWidth: 560, margin: '0 0 26px' }} data-comment-anchor="15fc2c874d-p-18-7">
        I&rsquo;m a <strong style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>solutions architect</strong>. Welcome to my little
        corner of the web, where I share my professional experiences, thoughts, adventures,
        and projects with the world — ad-free, tracker-free, and occasionally held together with tape.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <button className="btn btn-primary" onClick={() => window.__go('blog')}>Read all posts <IconArrow size={17} /></button>
        <button className="btn btn-ghost" onClick={() => window.__go('about')}>About me</button>
      </div>
    </div>);

}

function SectionPosts({ go, title = 'Recent posts', posts }) {
  return (
    <section className="wrap" style={{ marginTop: 84 }} data-comment-anchor="2b7e77ce34-section-33-5">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}><span className="mono">// posts</span></div>
          <h2>{title}</h2>
        </div>
        <a className="btn btn-ghost" onClick={() => go('blog')}>All posts <IconArrow size={16} /></a>
      </div>
      <div className="grid-cards">
        {posts.map((p) => <PostCard key={p.slug} post={p} go={go} />)}
      </div>
    </section>);

}

function PostRow({ post, go }) {
  const mob = useIsMobile();
  if (mob) {
    return (
      <div onClick={() => go('article', post.slug)}
      style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
        <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 9 }}>
          <span>{fmtDate(post.date)}</span><span style={{ opacity: .5 }}>·</span>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><IconClock size={12} />{post.readingTime}m</span>
        </div>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, fontSize: 19,
          letterSpacing: '-.01em', margin: '0 0 8px', lineHeight: 1.28 }}>{post.title}</h3>
        <p className="muted" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{post.excerpt}</p>
        <div className="taglist" style={{ marginTop: 12 }}>
          {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>);

  }
  return (
    <div onClick={() => go('article', post.slug)}
    style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
    onMouseEnter={(e) => e.currentTarget.querySelector('.rt').style.color = 'var(--accent-ink)'}
    onMouseLeave={(e) => e.currentTarget.querySelector('.rt').style.color = 'var(--text)'}>
      <h3 className="rt" style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, fontSize: 22,
        letterSpacing: '-.01em', margin: '0 0 7px', lineHeight: 1.25, transition: 'color .15s' }}>{post.title}</h3>
      <div className="mono" style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 11, alignItems: 'center', marginBottom: 11 }}>
        <span>{fmtDate(post.date)}</span><span style={{ opacity: .5 }}>·</span>
        <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><IconClock size={13} />{post.readingTime}m</span>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{post.excerpt}</p>
      <div className="taglist" style={{ marginTop: 12 }}>
        {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>);

}

/* ============================ HOME ============================ */
const BOT_QUIPS = [
  'have you tried turning me off and on again?',
  "i'm not broken, i'm feature-incomplete",
  'works on my machine \u00af\\_(\u30c4)_/\u00af',
  'running on caffeine and undefined',
  'it compiled, so we shipped it',
  'error: personality module not found',
  '99 little bugs in the code\u2026',
];

function Home({ go, layout, heroPose }) {
  const recent = POSTS.slice(0, 3);
  const mob = useIsMobile();
  const [quip] = React.useState(() => BOT_QUIPS[Math.floor(Math.random() * BOT_QUIPS.length)]);

  if (layout === 'centered') {
    return (
      <main>
        <section className="wrap" style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 8, maxWidth: 760 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Mascot pose={heroPose} size={mob ? 160 : 210} />
          </div>
          <div style={{ display: 'inline-block', textAlign: 'left' }}><Greeting compact /></div>
        </section>
        <SectionPosts go={go} posts={recent} />
      </main>);

  }

  if (layout === 'editorial') {
    return (
      <main>
        <section className="wrap" style={{ paddingTop: mob ? 36 : 60, position: 'relative' }}>
          <div style={mob
            ? { display: 'flex', justifyContent: 'center', marginBottom: 12 }
            : { position: 'absolute', right: 20, top: 8, opacity: .98 }}>
            <Mascot pose={heroPose} size={mob ? 120 : 168} />
          </div>
          <div className="tape-strip" style={{ marginBottom: 24 }}>personal blog · since 2023</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, letterSpacing: '-.035em',
            fontSize: 'clamp(36px,8vw,92px)', lineHeight: .98, margin: '0 0 28px', maxWidth: 920 }}>
            Notes on building<br />software with<br /><span style={{ color: 'var(--accent-ink)' }}>humans &amp; agents.</span>
          </h1>
          <p className="muted" style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 600, margin: '0 0 8px' }}>
            I&rsquo;m Tamas — a <strong style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>solutions architect</strong>. Code reviews,
            conventions, cloud, agents, and the messy parts in between. Ad-free and tracker-free, always.
          </p>
        </section>
        <section className="wrap" style={{ marginTop: 54 }}>
          <div className="section-head"><h2>Writing</h2>
            <a className="btn btn-ghost" onClick={() => go('blog')}>All posts <IconArrow size={16} /></a></div>
          <div>{POSTS.slice(0, 3).map((p) => <PostRow key={p.slug} post={p} go={go} />)}</div>
        </section>
      </main>);

  }

  /* default: 'hello' — big mascot beside greeting */
  return (
    <main>
      <section className="wrap" style={{ position: 'relative', minHeight: mob ? 'auto' : 'calc(100vh - 71px)', display: 'flex', alignItems: 'center', paddingTop: mob ? 36 : 24, paddingBottom: mob ? 8 : 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.15fr .85fr', gap: mob ? 30 : 48, alignItems: 'center', width: '100%' }} data-comment-anchor="a8ad05c6e3-div-119-9">
          <Greeting />
          <image-slot
            id="hero-image"
            shape="rounded"
            radius="24"
            placeholder="Drop an image"
            style={{ order: mob ? -1 : 0, width: '100%', height: mob ? 250 : 330 }}>
          </image-slot>
        </div>
        {!mob &&
        <button onClick={() => window.scrollTo({ top: window.innerHeight - 60, behavior: 'smooth' })}
          className="scroll-cue mono"
          aria-label="Scroll to recent posts"
          style={{ position: 'absolute', left: '50%', bottom: 20, transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)',
            fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          <span>scroll for posts</span>
          <span className="ar" style={{ display: 'block' }}>
            <span style={{ display: 'block', transform: 'rotate(90deg)' }}><IconArrow size={18} /></span>
          </span>
        </button>
        }
      </section>
      <SectionPosts go={go} posts={recent} />
    </main>);

}

/* ============================ BLOG ============================ */
function Blog({ go }) {
  return (
    <main className="wrap" style={{ paddingTop: 56 }}>
      <div style={{ maxWidth: 720, marginBottom: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}><span className="mono">// the grand archive</span></div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(36px,5vw,56px)',
          letterSpacing: '-.03em', lineHeight: 1.02, margin: '0 0 16px' }}>Everything I&rsquo;ve written.</h1>
        <p className="muted" style={{ fontSize: 18, lineHeight: 1.6, margin: 0 }}>
          {POSTS.length} posts and counting. Mostly long-form, mostly about people and the software they make together.
        </p>
      </div>
      <div style={{ marginTop: 28 }}>
        {POSTS.map((p) => <PostRow key={p.slug} post={p} go={go} />)}
      </div>
    </main>);

}

/* ============================ ARTICLE ============================ */
function CodeBlock({ block }) {
  return (
    <pre>
      <div className="code-head">
        <span className="dot" style={{ background: '#ff5f57' }}></span>
        <span className="dot" style={{ background: '#febc2e' }}></span>
        <span className="dot" style={{ background: '#28c840' }}></span>
        <span className="fn">{block.fn}</span>
        <span className="copy">copy</span>
      </div>
      <code>{block.lines.map((l, i) =>
        <div key={i}>{l.tok ? <span className={'tok-' + l.tok}>{l.c}</span> : l.c || '\u00a0'}</div>
        )}</code>
    </pre>);

}

function Prose({ body }) {
  return (
    <div className="prose">
      {body.map((b, i) => {
        if (b.t === 'p') return <p key={i}>{b.c}</p>;
        if (b.t === 'h2') return <h2 key={i} id={'h-' + i}>{b.c}</h2>;
        if (b.t === 'h3') return <h3 key={i}>{b.c}</h3>;
        if (b.t === 'code') return <CodeBlock key={i} block={b} />;
        if (b.t === 'callout') return (
          <div key={i} style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb,var(--accent) 30%,var(--border))',
            borderRadius: 12, padding: '18px 22px', fontFamily: 'var(--ff-display)', fontSize: 16.5, lineHeight: 1.55,
            display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}><Mascot head size={42} anim={false} /></span>
            <span>{b.c}</span>
          </div>);

        return null;
      })}
    </div>);

}

function ArticleMeta({ post }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'var(--ff-mono)', fontSize: 13.5, color: 'var(--muted)' }}>
      <span>{fmtDate(post.date)}</span><span className="card-dot" style={{ opacity: .5 }}>·</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconClock size={14} />{post.readingTime} min read</span>
      <span style={{ opacity: .5 }}>·</span><span>by {AUTHOR.name}</span>
    </div>);

}

function Article({ go, slug, layout }) {
  const post = POSTS.find((p) => p.slug === slug) || POSTS[4];
  const mob = useIsMobile();
  const toc = ARTICLE_BODY.map((b, i) => b.t === 'h2' ? { i, c: b.c } : null).filter(Boolean);
  const Title = ({ size }) =>
  <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, letterSpacing: '-.025em',
    fontSize: size || 'clamp(32px,4.4vw,50px)', lineHeight: 1.06, margin: '0 0 18px' }}>{post.title}</h1>;


  if (layout === 'minimal') {
    return (
      <main className="wrap narrow" style={{ paddingTop: 64 }}>
        <a onClick={() => go('blog')} className="mono" style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>← all posts</a>
        <div className="taglist" style={{ margin: '26px 0 18px' }}>{post.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        <Title />
        <hr className="divider" style={{ margin: '22px 0' }} />
        <div style={{ marginBottom: 40 }}><ArticleMeta post={post} /></div>
        <Prose body={ARTICLE_BODY} />
        <ArticleFooter go={go} post={post} />
      </main>);

  }

  if (layout === 'sidemeta') {
    return (
      <main className="wrap" style={{ paddingTop: 56, maxWidth: 1080 }}>
        <a onClick={() => go('blog')} className="mono" style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>← all posts</a>
        <div style={{ maxWidth: 820, margin: '22px 0 8px' }}>
          <div className="taglist" style={{ marginBottom: 16 }}>{post.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          <Title />
          <p className="muted" style={{ fontFamily: 'var(--ff-prose)', fontSize: 21, lineHeight: 1.5, margin: '0 0 20px' }}>{post.excerpt}</p>
          <ArticleMeta post={post} />
        </div>
        <HeroPH label={post.hero} ratio={mob ? '16/9' : '21/9'} style={{ margin: mob ? '24px 0 34px' : '30px 0 46px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '200px 1fr', gap: mob ? 0 : 54, alignItems: 'start' }}>
          {!mob &&
          <aside style={{ position: 'sticky', top: 96 }} className="toc-aside">
            <div className="col-title" style={{ marginBottom: 14 }}>On this page</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {toc.map((h) => <a key={h.i} href={'#h-' + h.i} className="muted" style={{ fontSize: 14, lineHeight: 1.4, textDecoration: 'none' }}>{h.c}</a>)}
            </div>
          </aside>
          }
          <div style={{ maxWidth: 680 }}><Prose body={ARTICLE_BODY} /><ArticleFooter go={go} post={post} /></div>
        </div>
      </main>);

  }

  /* default: classic centered column with hero */
  return (
    <main className="wrap narrow" style={{ paddingTop: 48 }}>
      <a onClick={() => go('blog')} className="mono" style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>← all posts</a>
      <div style={{ textAlign: 'center', margin: '26px 0 30px' }}>
        <div className="taglist" style={{ justifyContent: 'center', marginBottom: 18 }}>{post.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        <Title />
        <div style={{ display: 'flex', justifyContent: 'center' }}><ArticleMeta post={post} /></div>
      </div>
      <HeroPH label={post.hero} ratio="16/9" style={{ margin: '0 0 44px' }} />
      <Prose body={ARTICLE_BODY} />
      <ArticleFooter go={go} post={post} />
    </main>);

}

function ArticleFooter({ go, post }) {
  const next = POSTS[(POSTS.findIndex((p) => p.slug === post.slug) + 1) % POSTS.length];
  return (
    <div style={{ marginTop: 56 }}>
      <div onClick={() => go('article', next.slug)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>next up →</div>
          <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, fontSize: 19 }}>{next.title}</div>
        </div>
        <button className="icon-btn" style={{ width: 46, height: 46 }}><IconArrow /></button>
      </div>
    </div>);

}

/* ============================ ABOUT ============================ */
function About({ go }) {
  const mob = useIsMobile();
  return (
    <main className="wrap" style={{ paddingTop: mob ? 40 : 56, maxWidth: 760 }}>
      <div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}><span className="mono">// the human behind the machine</span></div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(34px,4.6vw,52px)',
            letterSpacing: '-.03em', lineHeight: 1.03, margin: '0 0 22px' }}>Hi, I&rsquo;m Tamas.</h1>
          <div className="prose" style={{ fontSize: 19 }}>
            <p>Hello there — my name is Tamas Mezei, and I work as a <strong>software engineer &amp;
              architect</strong> in Zurich, Switzerland. I&rsquo;ve spent a good chunk of my career
              in large, distributed teams — the kind where a code review can cross three time zones
              before lunch.</p>
            <p>From my early days tinkering with computers and programming languages to years of
              professional experience, I&rsquo;ve come to appreciate the power of software to transform
              lives and businesses. As the web and cloud have become ever more ubiquitous, I&rsquo;ve
              focused on mastering these technologies and exploring their potential to create
              scalable, secure, and user-friendly solutions.</p>
            <p>Through this website I hope to showcase my work, but also to contribute to the wider
              software community — writing about the <strong>human side of software</strong>: how we
              review each other&rsquo;s work, how we write down the conventions we actually agree on,
              and how teams quietly learn to feel helpless (and how they can un-learn it).</p>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => go('blog')}>Read all posts <IconArrow size={16} /></button>
            <Social labeled />
          </div>
        </div>
      </div>

      <section style={{ marginTop: mob ? 48 : 72 }}>
        <div className="section-head"><h2 style={{ fontSize: 28 }}>About this website</h2></div>
        <div className="prose" style={{ fontSize: 19, maxWidth: 720 }}>
          <p>I like to think of this website as my own little digital playground. The current
            version is a <strong>minimum viable product</strong> — an initial step towards my
            ultimate vision. I aim to keep a minimalistic approach and only introduce new features
            or modifications when they&rsquo;re truly necessary.</p>
          <p>The source code is available on <a href="https://github.com/mezeitamas/brokenrobot.xyz" target="_blank" rel="noopener">GitHub</a>.
            Please don&rsquo;t hesitate to open an issue if you encounter a bug or typo, or if you
            have any suggestions to offer.</p>
          <p>I&rsquo;ll be documenting any improvements or modifications through blog posts published
            here on the site.</p>
          <p>It&rsquo;s deliberately small and quiet. <strong>No ads, no affiliate links, no
            tracking.</strong> Just writing, and a robot that&rsquo;s a little bit broken — which
            feels about right for software.</p>
        </div>
      </section>
    </main>);

}

/* ============================ 404 ============================ */
function NotFound({ go }) {
  const mob = useIsMobile();
  return (
    <main className="wrap" style={{ paddingTop: 40, minHeight: '62vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Mascot pose="sit404" size={mob ? 190 : 250} />
        </div>
        <div className="mono" style={{ fontSize: 13, color: 'var(--accent-ink)', marginBottom: 14 }}>
          ERROR 404 · page not found (or it ran away)
        </div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(40px,8vw,80px)',
          letterSpacing: '-.03em', lineHeight: 1, margin: '0 0 18px' }}>
          Well, this is<br />a bit broken.
        </h1>
        <p className="muted" style={{ fontSize: 18.5, lineHeight: 1.6, margin: '0 0 28px' }}>
          The robot tried to fetch that page and dropped a bolt somewhere. The page might
          have moved, or it may never have existed. Either way — not your fault.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => go('home')}>Take me home <IconArrow size={16} /></button>
          <button className="btn btn-ghost" onClick={() => go('blog')}>Browse the writing</button>
        </div>
      </div>
    </main>);

}

Object.assign(window, { Home, Blog, Article, About, NotFound });