/* data.jsx — real content pulled from github.com/mezeitamas/brokenrobot.xyz */

const AUTHOR = {
  name: 'Tamas Mezei',
  role: 'Solutions architect',
  bluesky: '@brokenrobot.xyz',
  github: 'github.com/mezeitamas',
  linkedin: 'in/mezeitamas',
  mastodon: '@brokenrobot_xyz@mastodon.social',
};

const POSTS = [
  {
    slug: 'learned-helplessness-in-software-teams',
    title: 'Learned helplessness in software teams: Symptoms, causes, and the path to empowerment',
    excerpt: 'How learned helplessness creeps into development teams in large organizations, the telltale symptoms to watch for, how poor leadership teaches teams to feel helpless, and — most importantly — what leaders can do to break the cycle.',
    date: '2025-12-08', readingTime: 14,
    tags: ['leadership', 'teams', 'management', 'culture'],
    hero: 'photo — a single chair in an empty meeting room',
  },
  {
    slug: 'the-renaissance-of-written-coding-conventions',
    title: 'The renaissance of written coding conventions: Because AI reads manuals, too',
    excerpt: 'Coding conventions are having a renaissance. AI agents code with us now, and they learn what we teach. Time to dust off the manual — because AI reads manuals, too.',
    date: '2025-10-12', readingTime: 9,
    tags: ['coding conventions', 'ai', 'frontend'],
    hero: 'photo — an old typewriter manual, dust motes in light',
  },
  {
    slug: 'beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions',
    title: 'Beyond tabs and spaces: Finding a balance in coding conventions',
    excerpt: 'An informal journey for software architects and tech leads on taming coding standards and aligning them with what really matters.',
    date: '2025-04-16', readingTime: 18,
    tags: ['coding conventions', 'architecture', 'tech lead'],
    hero: 'photo — a balance scale, tabs on one side, spaces on the other',
  },
  {
    slug: 'the-power-of-coding-conventions-in-large-distributed-teams',
    title: 'The power of coding conventions in large, distributed teams',
    excerpt: 'When developers, architects, and stakeholders span time zones and continents, well-defined conventions aren\u2019t just "nice to have" — they can make or break a project\u2019s success.',
    date: '2025-04-03', readingTime: 11,
    tags: ['coding conventions', 'teamwork', 'scale'],
    hero: 'photo — a world map with glowing connection lines',
  },
  {
    slug: 'the-human-side-of-code-reviews-in-large-teams',
    title: 'The human side of code reviews in large teams',
    excerpt: 'Software development is not just about writing code — it is a collaboration. At the heart of every code review is a conversation between people with different backgrounds, experiences, and perspectives.',
    date: '2025-03-10', readingTime: 8,
    tags: ['code reviews', 'teamwork', 'collaboration'],
    hero: 'photo — two people looking at one screen, warm light',
  },
  {
    slug: 'url-redirect-with-amazon-cloudfront-and-amazon-route-53',
    title: 'URL redirect with Amazon CloudFront and Amazon Route 53',
    excerpt: 'How to implement a consistent, SEO-friendly URL structure — favouring the www subdomain over the apex domain — using URL redirection with Amazon CloudFront and Route 53.',
    date: '2023-07-14', readingTime: 11,
    tags: ['aws', 'cloudfront', 'route53'],
    hero: 'diagram — request routing from apex to www',
  },
  {
    slug: 'advanced-static-website-hosting-with-amazon-s3-and-cloudfront',
    title: 'Advanced static website hosting with Amazon S3 and CloudFront',
    excerpt: 'A deep dive into hosting a static website on Amazon S3 using CloudFront. A secure, reliable, scalable, cost-effective and performant solution.',
    date: '2023-05-29', readingTime: 22,
    tags: ['aws', 's3', 'cloudfront', 'hosting'],
    hero: 'diagram — S3 + CloudFront target architecture',
  },
  {
    slug: 'hosting-a-static-website-on-amazon-s3',
    title: 'Hosting a static website on Amazon S3',
    excerpt: 'Hosting a simple static website on AWS can be daunting at first, but it\u2019s quite straightforward. We walk through doing it with only S3 and the AWS Management Console.',
    date: '2023-05-04', readingTime: 7,
    tags: ['aws', 's3', 'hosting'],
    hero: 'diagram — a single S3 bucket serving the web',
  },
  {
    slug: 'hello-world',
    title: 'Hello, World!',
    excerpt: 'As a software engineer, I can\u2019t think of a better way to start my blog than with the classic "Hello, World!" — the first program so many of us ever write.',
    date: '2023-05-01', readingTime: 3,
    tags: ['helloworld'],
    hero: 'photo — a freshly opened laptop, cursor blinking',
  },
];

// full body for the demo article (the human-side post), lightly structured
const ARTICLE_BODY = [
  { t:'p', c:'Software development is not just about writing code — it is a collaboration. In large teams working on complex projects, code reviews are meant to be a process of knowledge sharing, quality assurance, and professional growth. At the heart of every code review is a conversation between individuals with different backgrounds, experiences, and perspectives.' },
  { t:'p', c:'Ideally, this conversation should be constructive and goal-oriented. In reality, however, it can become a process filled with miscommunication, assumptions, and even personal friction. Despite the best intentions, reviews often become a source of frustration, tension, and inefficiency.' },
  { t:'callout', c:'Please don\u2019t expect a tidy list of solutions here. I only aim to raise awareness of the human side of code reviews — adapt anything that resonates to your own team\u2019s context.' },
  { t:'h2', c:'The impact of vague requirements' },
  { t:'p', c:'The foundation of a successful code review starts long before the code is written. When requirements lack clarity, developers are forced to make assumptions. These assumptions then manifest in the code, making it difficult for reviewers to determine whether the change actually fulfills its intended purpose.' },
  { t:'p', c:'Poorly defined requirements create a ripple effect, leading to prolonged review cycles, endless back-and-forth discussions, and occasional frustration from both sides.' },
  { t:'h2', c:'The subjective nature of "common sense"' },
  { t:'p', c:'A phrase often heard in development discussions is: "It\u2019s just common sense." However, what counts as common sense is shaped by cultural background, professional environment, and unique work experiences. One developer may see an approach as self-evidently correct, while another views it as flawed.' },
  { t:'code', fn:'review-comment.txt', lines:[
      {tok:'com', c:'// what the author hears:'},
      {tok:'str', c:'"this is wrong."'},
      {tok:'',   c:''},
      {tok:'com', c:'// what the reviewer meant:'},
      {tok:'str', c:'"i\u2019d reach for a map here so we skip the O(n\u00b2) lookup —'},
      {tok:'str', c:' but happy to hear why you went this way."'},
    ] },
  { t:'h2', c:'The emotional weight of reviews' },
  { t:'p', c:'Developers take pride in their work. Writing code is a creative act involving problem-solving, design choices, and personal craftsmanship. When changes receive heavy criticism, it can feel like an attack on one\u2019s skills rather than a critique of the code itself.' },
  { t:'p', c:'Recognizing these issues is the first step in transforming the code review process into something more constructive and less stressful. When we understand the human aspect of this workflow, we can begin moving toward more empathetic, supportive, and effective collaboration.' },
];

const NAV = [
  { id:'home', label:'Home' },
  { id:'blog', label:'Writing' },
  { id:'about', label:'About' },
];

function fmtDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

Object.assign(window, { AUTHOR, POSTS, ARTICLE_BODY, NAV, fmtDate });
