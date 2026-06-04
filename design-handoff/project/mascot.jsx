/* mascot.jsx — the Broken Robot, redrawn to the approved character sheet.
   A friendly rounded robot: bold outline, crooked amber-tipped antenna,
   one round eye + one X eye, open smile w/ tongue, headphone ears, amber
   chest button, gray stubby limbs, a crack on the head.

   props:
     pose : 'neutral' | 'wave' | 'confused' | 'sit404'
     head : true  -> head-only (favicon / logo / inline use)
     size, anim, className
*/

function Mascot({ pose='neutral', head=false, size=120, anim=true, className='' }) {
  const cls = `mascot ${anim ? 'anim' : ''} ${className}`;
  const ink   = 'var(--text)';
  const body  = 'var(--surface)';
  const limb  = 'color-mix(in srgb, var(--text) 30%, var(--surface))';
  const accent= 'var(--accent)';
  const sw = 3.6;
  const is404 = pose === 'sit404';
  const confused = pose === 'confused';

  /* ---- shared head pieces (user-space coords; centerX = 100) ---- */
  const Antenna = (
    <g className="m-antenna">
      <path d="M100 47 L105 31 L114 22" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="115" cy="19" r="6.6" fill={accent} stroke={ink} strokeWidth="2.2"/>
    </g>
  );
  const Smoke = (
    <g className="m-smoke">
      <circle cx="122" cy="14" r="4.5" fill={limb}/>
      <circle cx="129" cy="7"  r="5.5" fill={limb}/>
      <circle cx="124" cy="0"  r="6.5" fill={limb}/>
    </g>
  );
  const Ears = (
    <g>
      <rect x="35" y="72" width="16" height="30" rx="8" fill={limb} stroke={ink} strokeWidth={sw}/>
      <rect x="149" y="72" width="16" height="30" rx="8" fill={limb} stroke={ink} strokeWidth={sw}/>
    </g>
  );
  const HeadShell = <rect x="49" y="46" width="102" height="78" rx="30" fill={body} stroke={ink} strokeWidth={sw}/>;
  const Crack = <path d="M134 56 L128 64 L135 69 L129 78" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>;

  const EyeRound = (
    <g className="m-eye">
      <circle cx="80" cy="83" r="10" fill={ink}/>
      <circle cx="75.6" cy="79" r="3.1" fill={body}/>
    </g>
  );
  const EyeX = (
    <g stroke={ink} strokeWidth={sw} strokeLinecap="round">
      <path d="M116 78 L128 90"/><path d="M128 78 L116 90"/>
    </g>
  );
  const MouthHappy = (
    <g>
      <path d="M82 101 Q100 117 118 101 Z" fill={body}/>
      <ellipse cx="100" cy="110" rx="8" ry="4.4" fill="#e2886e"/>
      <path d="M82 101 Q100 117 118 101" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  );
  const MouthSoft = <path d="M84 104 Q100 113 116 104" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round"/>;
  const MouthWavy = <path d="M84 107 Q92 100 100 107 Q108 114 116 107" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>;
  const Screen404 = (
    <g>
      <rect x="62" y="63" width="76" height="44" rx="13" fill="color-mix(in srgb, var(--text) 9%, var(--surface))" stroke={ink} strokeWidth="2.6"/>
      <text x="100" y="93" textAnchor="middle" fontFamily="var(--ff-mono)" fontWeight="700" fontSize="25" fill={ink}>404</text>
    </g>
  );
  const Mouth = confused ? MouthWavy : (pose==='wave' ? MouthHappy : MouthSoft);
  const Face = is404
    ? Screen404
    : <g>{EyeRound}{EyeX}{Mouth}{Crack}</g>;

  const ChestBtn = (
    <g>
      <circle cx="100" cy="154" r="9" fill="none" stroke={accent} strokeWidth="3.4"/>
      <circle cx="100" cy="154" r="3" fill={accent}/>
    </g>
  );

  /* ---------------- HEAD-ONLY (favicon / logo / inline) ---------------- */
  if (head) {
    return (
      <svg className={cls} width={size} height={size} viewBox="30 4 140 128" fill="none"
           role="img" aria-label="Broken Robot mascot">
        <g className="m-body" style={{transformOrigin:'100px 120px'}}>
          {Antenna}{Ears}{HeadShell}{EyeRound}{EyeX}{MouthSoft}{Crack}
        </g>
      </svg>
    );
  }

  /* ---------------- FULL BODY ---------------- */
  const downArmL = <rect x="52" y="130" width="15" height="44" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw} transform="rotate(7 59 132)"/>;
  const downArmR = <rect x="133" y="130" width="15" height="44" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw} transform="rotate(-7 140 132)"/>;
  const legs = <g>
    <rect x="82" y="178" width="15" height="32" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw}/>
    <rect x="103" y="178" width="15" height="32" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw}/>
  </g>;
  const bodyShell = <rect x="66" y="122" width="68" height="58" rx="22" fill={body} stroke={ink} strokeWidth={sw}/>;
  const Head = (tilt=0) => (
    <g transform={`rotate(${tilt} 100 88)`}>{Antenna}{Ears}{HeadShell}{Face}</g>
  );
  const shadow = (cy=216) => <ellipse cx="100" cy={cy} rx="50" ry="7" fill="var(--text)" opacity="0.1"/>;

  let scene;
  if (pose === 'wave') {
    scene = <>
      {shadow()}{legs}{bodyShell}{ChestBtn}{downArmL}
      {Head(-3)}
      <g transform="rotate(20 142 130)">
        <rect x="136" y="84" width="15" height="50" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw}/>
        <circle cx="143.5" cy="82" r="9" fill={limb} stroke={ink} strokeWidth={sw}/>
      </g>
    </>;
  } else if (pose === 'confused') {
    scene = <>
      {shadow()}{legs}{bodyShell}{ChestBtn}
      {/* left arm down + drooping wire */}
      {downArmL}
      <path d="M58 176 Q49 192 58 200 Q65 205 56 212" fill="none" stroke={limb} strokeWidth="3.4" strokeLinecap="round"/>
      {/* right arm out + sparking wire */}
      <rect x="133" y="136" width="15" height="40" rx="7.5" fill={limb} stroke={ink} strokeWidth={sw} transform="rotate(18 140 138)"/>
      <path d="M150 174 Q164 180 159 196" fill="none" stroke={limb} strokeWidth="3.4" strokeLinecap="round"/>
      <text className="m-spark" x="156" y="204" fontSize="15" fill={accent} fontFamily="var(--ff-mono)">✳</text>
      {Head(0)}
      {Smoke}
      <text className="m-q" x="38" y="46" fontSize="26" fontWeight="700" fill={ink} fontFamily="var(--ff-display)">?</text>
      <text className="m-q" x="24" y="70" fontSize="18" fontWeight="700" fill="var(--muted)" fontFamily="var(--ff-display)">?</text>
    </>;
  } else if (is404) {
    scene = <>
      {shadow(214)}
      {/* folded legs */}
      <rect x="56" y="192" width="46" height="17" rx="8.5" fill={limb} stroke={ink} strokeWidth={sw} transform="rotate(-7 79 200)"/>
      <rect x="98" y="192" width="46" height="17" rx="8.5" fill={limb} stroke={ink} strokeWidth={sw} transform="rotate(7 121 200)"/>
      {/* tangled wires */}
      <path d="M60 200 Q40 206 50 218 Q58 226 42 228" fill="none" stroke={limb} strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M140 200 Q160 206 150 218 Q143 225 156 228" fill="none" stroke={limb} strokeWidth="3.2" strokeLinecap="round"/>
      <text className="m-spark" x="36" y="226" fontSize="14" fill={accent} fontFamily="var(--ff-mono)">✳</text>
      <rect x="66" y="126" width="68" height="56" rx="22" fill={body} stroke={ink} strokeWidth={sw}/>
      {ChestBtn}
      <rect x="54" y="140" width="14" height="40" rx="7" fill={limb} stroke={ink} strokeWidth={sw}/>
      <rect x="132" y="140" width="14" height="40" rx="7" fill={limb} stroke={ink} strokeWidth={sw}/>
      {Head(2)}
      {Smoke}
    </>;
  } else { /* neutral */
    scene = <>
      {shadow()}{legs}{bodyShell}{ChestBtn}{downArmL}{downArmR}{Head(0)}
    </>;
  }

  return (
    <svg className={cls} width={size} height={size * (224/200)} viewBox="0 0 200 224" fill="none"
         role="img" aria-label="Broken Robot mascot">
      <g className="m-body" style={{transformOrigin:'100px 200px'}}>{scene}</g>
    </svg>
  );
}

window.Mascot = Mascot;
