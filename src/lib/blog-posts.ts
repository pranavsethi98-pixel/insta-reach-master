export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number; // minutes
  publishedAt: string;
  featured?: boolean;
  content: string; // HTML-like markdown rendered directly
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-cold-emails-land-in-spam",
    title: "Why Your Cold Emails Land in Spam (And the 7-Step Fix)",
    description: "Most senders blame the algorithm. The real culprit is almost always one of seven fixable problems in your sending setup. Here's the diagnostic and the exact fix for each.",
    category: "Deliverability",
    readTime: 8,
    publishedAt: "2026-05-01",
    featured: true,
    content: `
<p>You sent 500 emails yesterday. Twelve people replied. But your open rate is 2%. Something is wrong upstream.</p>

<p>Before you rewrite your subject lines or blame Google's filters, check these seven things first. In our experience analyzing thousands of cold email setups, one of these is almost always the problem.</p>

<h2>1. Your DNS records are incomplete or wrong</h2>

<p>SPF, DKIM, and DMARC are not optional extras. They're the three-part handshake that email servers use to decide if you're legitimate. Skip any one of them and your emails are automatically suspect.</p>

<p>SPF tells the world which servers are allowed to send mail for your domain. DKIM cryptographically signs each email so receiving servers can verify it wasn't tampered with in transit. DMARC tells servers what to do when SPF or DKIM fails.</p>

<p>Go to MXToolbox right now and run a check on your domain. If anything comes back red, fix it before you send another email.</p>

<h2>2. You're using a brand-new domain</h2>

<p>Google and Microsoft assign a reputation score to every domain. New domains have zero history, which means zero trust. If you started sending 100+ emails per day on a domain you registered last week, you're going to spam. Every time.</p>

<p>The fix is warmup. Warmup is the process of gradually increasing your sending volume over 4 to 6 weeks while generating positive engagement signals (opens, replies, moves-to-inbox). This builds the domain's reputation score before you hit it with real volume.</p>

<h2>3. You're sending too much too fast</h2>

<p>Even a warmed domain has limits. The generally accepted rule is no more than 50 cold emails per mailbox per day. Some senders push to 80 or 100, but the risk increases sharply above 50.</p>

<p>If you need to send more, add more mailboxes. Five mailboxes sending 40 emails each is 200 sends per day with low risk. One mailbox sending 200 is a burning domain.</p>

<h2>4. Your subject line or body contains spam triggers</h2>

<p>Certain words and patterns are reliably associated with spam. Not because of the words themselves, but because spammers have historically overused them. Filters learn from patterns at scale.</p>

<p>Common triggers include: "Free", "Limited time", "Act now", "Click here", "100%", "Guarantee", excessive punctuation, and all-caps words. But the list is much longer and more nuanced than any single blog post can cover. Run every email through a spam word checker before sending.</p>

<h2>5. Your tracking domain is shared with bad senders</h2>

<p>Most cold email tools insert tracking links using a shared domain like "trk.tool.io". If another sender on that same domain has a poor reputation, your emails inherit it. This is one of the most overlooked deliverability problems in the industry.</p>

<p>The fix: set up a custom tracking domain on your own URL. Most tools support this. It takes 20 minutes and isolates your reputation completely.</p>

<h2>6. You're hitting spam traps</h2>

<p>Spam traps are email addresses that exist specifically to catch senders with bad list hygiene. They come in two forms: pristine addresses (never valid, so anyone sending to them bought a list) and recycled addresses (previously valid, then deactivated).</p>

<p>Hitting even a small number of spam traps signals to mailbox providers that your list hygiene is poor. This tanks your sender score.</p>

<p>Always verify your leads list before importing it into any campaign. A good verifier removes invalid addresses, catch-alls, and known spam traps.</p>

<h2>7. Your sending IP has a bad history</h2>

<p>If you're using a shared sending infrastructure (most email tools do this), you're sharing an IP with every other customer on that platform. If one bad actor on that IP sends spam, your deliverability suffers.</p>

<p>The most reliable fix is to use your own email accounts (Google Workspace or Microsoft 365) rather than a shared relay. These domains carry Google's and Microsoft's own IP reputation, which is excellent by default.</p>

<h2>The diagnostic checklist</h2>

<p>Before your next send, check these things in order:</p>

<ol>
<li>Run MXToolbox on your domain. Fix any red flags.</li>
<li>Check that your domain is at least 4 weeks old and has been warmed properly.</li>
<li>Verify you're sending no more than 40-50 emails per mailbox per day.</li>
<li>Run your email through a spam word checker.</li>
<li>Confirm you have a custom tracking domain set up.</li>
<li>Verify your leads list with a tool before importing.</li>
<li>Use Google Workspace or Microsoft 365 accounts, not a shared relay.</li>
</ol>

<p>Fix these seven things and your spam rate will drop. In most cases, dramatically.</p>
    `,
  },
  {
    slug: "cold-email-subject-lines-that-work",
    title: "Cold Email Subject Lines That Actually Get Opens (50 Real Examples)",
    description: "Most subject line advice is wrong. Here's what actually drives opens based on analysis of millions of cold emails, plus 50 real examples you can steal today.",
    category: "Copywriting",
    readTime: 9,
    publishedAt: "2026-05-03",
    featured: true,
    content: `
<p>The average cold email subject line advice is: be personalized, be short, ask a question. This advice is fine. It's also what everyone else is doing.</p>

<p>Here's what actually moves the open rate needle, based on sending patterns across millions of cold emails.</p>

<h2>The only thing a subject line needs to do</h2>

<p>A subject line has one job: get the email opened. Not liked. Not clicked. Just opened. Keep this in mind when you're writing them, because most people overcomplicate it by trying to make the subject line do too much.</p>

<p>You're not closing a deal in the subject line. You're earning 30 seconds of someone's attention.</p>

<h2>What actually correlates with opens</h2>

<p>Short beats long. Subject lines under 40 characters consistently outperform longer ones in cold email. This is different from newsletter data, where longer subjects sometimes perform better. In cold outbound, the recipient's mental model is "is this spam or not" and they make that call in under two seconds.</p>

<p>Specificity beats cleverness. "3 ideas for [Company]'s paid ads" outperforms "Transform your marketing strategy" by a wide margin. Specific subject lines signal that the email is actually about this person, not blasted to thousands.</p>

<p>Lowercase beats title case. Formal capitalization reads like marketing. Lowercase reads like a human. This sounds minor. In practice it moves the needle 10-20% in most setups.</p>

<p>Questions outperform statements. A question creates a small cognitive gap. Humans are wired to want to close gaps. The brain nudges you to open the email to get the answer.</p>

<h2>The formats that work</h2>

<p>Here are the patterns we see perform consistently:</p>

<p><strong>Direct question:</strong> Invites a response in the reader's head before they even open.</p>
<p><strong>Specific observation:</strong> Shows you actually looked at their business.</p>
<p><strong>Soft intro:</strong> Disarms. No pitch signal at all.</p>
<p><strong>Mutual connection reference:</strong> Almost always opens. (Only use this if the connection is real.)</p>
<p><strong>Compliment on specific thing:</strong> Feels genuine when specific. Feels gross when generic.</p>

<h2>50 subject lines you can swipe</h2>

<p>These are organized by type. Use them as starting points, not copy-paste templates. The best subject line for your offer and ICP is one you've adapted, not one you've copied wholesale.</p>

<p><strong>Direct questions (high intent):</strong></p>
<ul>
<li>quick question about [company]'s sales process</li>
<li>how are you handling [specific pain point]?</li>
<li>is [problem they have] still a challenge?</li>
<li>have you tried [specific approach] for [goal]?</li>
<li>who handles [function] at [company]?</li>
<li>still using [competitor]?</li>
<li>open to a 12-minute call?</li>
<li>worth a conversation?</li>
</ul>

<p><strong>Specific observation (shows research):</strong></p>
<ul>
<li>saw [company] just expanded into [market]</li>
<li>noticed you're hiring [role] - idea for you</li>
<li>loved your post on [specific topic]</li>
<li>[company] and [result they could want]</li>
<li>thought of you when I saw [relevant thing]</li>
<li>[specific number] idea for [company]'s [channel]</li>
<li>re: your [recent content or announcement]</li>
</ul>

<p><strong>Intriguing but not clickbait:</strong></p>
<ul>
<li>not another sales email (but kind of)</li>
<li>this took me 10 minutes to put together</li>
<li>something I noticed about [company]</li>
<li>quick thought on [relevant topic]</li>
<li>one thing that might help [company]</li>
<li>weird request</li>
<li>honest question</li>
<li>small idea, big potential</li>
</ul>

<p><strong>Social proof embedded:</strong></p>
<ul>
<li>how [similar company] got [result] in 60 days</li>
<li>[result] for [company in their space]</li>
<li>what [company] did differently in Q3</li>
<li>case study: [relevant outcome]</li>
</ul>

<p><strong>Soft intros:</strong></p>
<ul>
<li>intro - [your name]</li>
<li>[mutual name] suggested I reach out</li>
<li>following up on [conference / event]</li>
<li>we haven't met yet</li>
<li>[your company] + [their company]?</li>
</ul>

<p><strong>For follow-ups:</strong></p>
<ul>
<li>still relevant?</li>
<li>the right person to ask?</li>
<li>missed this one</li>
<li>last try</li>
<li>circling back</li>
<li>quick follow-up</li>
<li>did this get buried?</li>
</ul>

<h2>What to stop doing immediately</h2>

<p>Stop using all-caps anywhere in the subject line. Stop using emojis in cold email subject lines (newsletters are different). Stop writing subject lines that are actually mini-pitches. Stop using phrases like "I wanted to reach out" or "I hope this finds you well" in the subject itself.</p>

<p>And A/B test. Every list, every ICP, every offer performs differently. What works in SaaS sales doesn't always transfer to agency outreach. Run two variants on your next campaign and let the data tell you which direction to go.</p>
    `,
  },
  {
    slug: "warmup-timeline-guide",
    title: "The Email Warmup Timeline: Week by Week to 100 Sends per Day",
    description: "A practical, numbers-driven warmup schedule that takes a cold domain from zero to 100 daily sends without triggering spam filters or burning your reputation.",
    category: "Deliverability",
    readTime: 7,
    publishedAt: "2026-05-06",
    content: `
<p>Domain warmup is not complicated. But most senders either skip it entirely or do it wrong. Here's the exact schedule we use for new domains, built from experience ramping hundreds of mailboxes.</p>

<h2>Why warmup matters</h2>

<p>When a domain sends its first email, mailbox providers like Gmail and Outlook have no data on it. No history, no reputation, no signals. In the absence of data, they default to caution. Emails from unknown senders go to spam or get deferred.</p>

<p>Warmup is the process of building that reputation from scratch by sending small volumes of email that generate positive signals: opens, replies, moves from spam to inbox. Over time, these signals teach providers that your domain sends mail that people want.</p>

<p>Skip this process and your cold campaign will underperform from day one. Worse, if you burn the domain in the first week, you've wasted the registration and the associated setup work.</p>

<h2>The week-by-week schedule</h2>

<p>This schedule applies to a single mailbox connected to a freshly registered domain. If you're warming multiple mailboxes on the same domain, run them in parallel but keep the per-mailbox numbers.</p>

<p><strong>Week 1: 5-10 sends per day</strong></p>
<p>Start with 5 sends on day one. Increase by 1-2 per day. Keep your content natural and conversational. These should be warmup emails between your mailboxes (or through a warmup network), not real cold outreach.</p>

<p><strong>Week 2: 15-25 sends per day</strong></p>
<p>You can start mixing in real cold emails at the low end. Keep the ratio at roughly 80% warmup emails, 20% real outreach. The goal this week is to establish a baseline reputation. Watch your placement data carefully.</p>

<p><strong>Week 3: 30-50 sends per day</strong></p>
<p>Start shifting toward real sends. You can push to 50/50 warmup vs. outreach by the end of this week. Domain reputation should be building. Open rates on warmup emails should be high (warmup networks auto-open).</p>

<p><strong>Week 4: 60-80 sends per day</strong></p>
<p>You're in real territory now. Keep warmup running in the background (10-15 emails per day is enough for maintenance). The bulk of your sends can now be real cold outreach.</p>

<p><strong>Week 5+: Up to 100 sends per day</strong></p>
<p>This is the sustainable ceiling for most cold email setups. You can push higher, but the risk/reward math changes above 100. If you need more volume, add mailboxes instead of increasing per-mailbox limits.</p>

<h2>Signals to watch during warmup</h2>

<p>Check these weekly, not daily. Micro-fluctuations are normal and not worth optimizing around.</p>

<p><strong>Inbox placement rate:</strong> What percentage of your test emails land in the inbox vs. spam? Anything above 85% is healthy. Below 70% means something in your setup is wrong.</p>

<p><strong>Spam folder rate:</strong> If warmup network emails start landing in spam at high rates, pause sending and investigate your DNS records and sending patterns.</p>

<p><strong>Reply rate on real sends:</strong> This is the ultimate signal. If your copy and offer are solid but replies are low, it's usually a deliverability problem upstream.</p>

<h2>Common warmup mistakes</h2>

<p>Sending too fast in week one is the most common mistake. Senders get impatient and jump to 50+ sends immediately. This almost always triggers spam filters and can permanently damage a domain.</p>

<p>Using warmup content that looks nothing like your real emails is a subtler problem. If your warmup emails are generic conversation starters but your real cold emails have heavy formatting and multiple links, the transition can confuse filters. Keep warmup content tonally similar to your real outreach.</p>

<p>Turning off warmup after the ramp period is a mistake. Warmup is not a one-time event. Keep a low-level warmup running indefinitely to maintain reputation signals. 10-15 emails per day costs almost nothing and protects your investment.</p>

<h2>Warmup with multiple mailboxes on one domain</h2>

<p>If you're setting up multiple Google Workspace mailboxes under one domain (e.g., james@yourdomain.com and sarah@yourdomain.com), warm them in parallel but stagger the start dates by a week. This distributes the reputation-building across the mailboxes and avoids any single mailbox looking like it's suddenly handling all the domain's sending volume.</p>

<p>Done right, warmup is boring and mechanical. That's a good sign. Boring warmup that follows the schedule produces healthy domains that send reliably for months without deliverability issues.</p>
    `,
  },
  {
    slug: "how-many-mailboxes-do-you-need",
    title: "How Many Mailboxes Do You Actually Need for Cold Email?",
    description: "The math behind scaling cold email volume safely. How to calculate your mailbox requirements before you buy a single domain.",
    category: "Strategy",
    readTime: 6,
    publishedAt: "2026-05-08",
    content: `
<p>Most cold email senders start with one mailbox and wonder why their volume is capped. Others spin up 50 mailboxes immediately and waste money on infrastructure they don't need. Here's how to calculate what you actually need.</p>

<h2>The math starts with your monthly target</h2>

<p>Start with how many cold emails you want to send per month. Be specific. "A lot" is not a number. 10,000 per month is a number.</p>

<p>Then work backwards:</p>
<ul>
<li>Maximum sends per mailbox per day: 40 (conservative) to 50 (moderate risk)</li>
<li>Sending days per month: 20 (weekdays only, which is recommended for B2B)</li>
<li>Sends per mailbox per month: 40 x 20 = 800</li>
</ul>

<p>So: target monthly volume divided by 800 = mailboxes needed.</p>

<p>10,000 sends per month / 800 = 12.5, so you need 13 mailboxes. Round up. You want headroom for off days, technical issues, and any mailbox that needs a cooldown period.</p>

<h2>Why 40 per day, not more?</h2>

<p>Google Workspace has a hard limit of 2,000 emails per day per account. But that number is for transactional volume, not cold outreach. In practice, cold email senders who push past 50 per day on a single account start seeing deliverability degradation within weeks. The spam complaint rate creeps up. Placement rates drop.</p>

<p>40 per day is the number most deliverability practitioners treat as the comfortable ceiling. Some senders run at 50 for months without issues. Very few maintain clean placement above that.</p>

<h2>Domain math</h2>

<p>You should never send cold email from your primary company domain. When (not if) something goes wrong with deliverability, you don't want it affecting your core business email.</p>

<p>Use secondary domains. Register variations of your main domain (getcompanyname.com, companyname.io, trycompanyname.com) and set up your cold email mailboxes there.</p>

<p>The general rule: 2 to 3 mailboxes per domain. More than that and you risk the domain's reputation suffering if any single mailbox runs into problems. Three mailboxes per domain at 40 sends each is 120 sends per domain per day.</p>

<p>So for 13 mailboxes, you'd need approximately 5 domains.</p>

<h2>A worked example</h2>

<p>Let's say you're an agency running outbound for three clients. Each client wants 5,000 sends per month.</p>

<ul>
<li>Total monthly volume: 15,000</li>
<li>Mailboxes needed: 15,000 / 800 = 18.75, so 19 mailboxes (round up to 21 for buffer)</li>
<li>Domains needed: 21 / 3 = 7 domains</li>
<li>Monthly tool cost at $6/mailbox: ~$126 in Google Workspace fees</li>
</ul>

<p>This is the real infrastructure cost of cold outbound. Add domain registration (~$12/year per domain), your email tool subscription, and any lead database costs.</p>

<h2>When to add mailboxes</h2>

<p>Add mailboxes when your current setup hits its volume ceiling and you need more sends. Do not add mailboxes to compensate for poor deliverability. If your placement rate is poor, more mailboxes just spread the problem wider without fixing it.</p>

<p>Also add mailboxes when you're testing new audiences or offers. Running experiments in an isolated mailbox keeps any deliverability issues contained. If the test burns, you lose one mailbox, not your whole infrastructure.</p>

<h2>The rotating pool approach</h2>

<p>Once you have more than 5 or 6 mailboxes, set them up as a rotating pool in your email tool. Instead of assigning specific mailboxes to specific campaigns, the tool distributes sends across the pool automatically. This spreads volume evenly, prevents any single mailbox from hitting daily limits, and makes scaling up or down simple.</p>

<p>Start small, measure daily. Add mailboxes when you need volume, not when you're hoping they'll solve a deliverability problem. That's the approach that scales without burning.</p>
    `,
  },
  {
    slug: "cold-email-sequence-structure",
    title: "The Cold Email Sequence That Gets Replies: Structure, Timing, and Copy",
    description: "How to structure a multi-step cold email sequence that actually converts. The right number of touches, timing between steps, and what to say in each one.",
    category: "Copywriting",
    readTime: 10,
    publishedAt: "2026-05-10",
    featured: true,
    content: `
<p>Most cold email sequences are too long, too pushy, or repeat the same pitch with different words. Here's how to build one that respects the prospect's time and consistently generates replies.</p>

<h2>How many touches?</h2>

<p>The data on this is fairly consistent across studies and practitioner reports: the sweet spot is 4 to 6 emails. More than that and you start burning goodwill. Fewer than 4 and you leave replies on the table.</p>

<p>Most replies happen on emails 2, 3, and 4, not email 1. If you stop after the first no-response, you're cutting off before the majority of your conversions.</p>

<h2>The timing</h2>

<p>Here's a schedule that works for most B2B outbound:</p>

<ul>
<li>Email 1: Day 0 (the intro)</li>
<li>Email 2: Day 3-4 (first follow-up)</li>
<li>Email 3: Day 7-9 (second follow-up)</li>
<li>Email 4: Day 14-18 (value-add or case study)</li>
<li>Email 5: Day 28-35 (the breakup)</li>
</ul>

<p>The gaps between emails should widen over time. Sending three emails in three days signals desperation. The gap between email 4 and 5 is deliberately long because you want to give prospects real time to get back to you before you close the loop.</p>

<h2>Email 1: The intro</h2>

<p>The first email has one job: get a reply, any reply. Not necessarily a "yes, I'm interested." A "not the right person" or "please remove me" is still useful because it tells you something and keeps the conversation moving.</p>

<p>Keep it short. Three to five sentences. One clear ask at the end. No attachments, no formatting, no long company bio.</p>

<p>The structure: observation about them or their company, relevant connection to what you do, and a soft question or ask. That's it.</p>

<p>Example of what works:</p>
<p><em>"Saw that [Company] is hiring four AEs right now. That usually means outbound is scaling fast. We help teams like yours build the sending infrastructure before bottlenecks slow the ramp. Worth a quick call?"</em></p>

<h2>Email 2: The follow-up</h2>

<p>Do not start your follow-up with "just following up." Literally everyone's first instinct is to write this. Delete it.</p>

<p>Add something new. A different angle, a quick stat, a question you didn't ask in email 1. Your follow-up is not a reminder that you exist. It's a second attempt to find the right hook.</p>

<p>Keep it even shorter than email 1. Three sentences is enough. The prospect already has context from the first email, so you don't need to re-establish everything.</p>

<h2>Email 3: A different angle</h2>

<p>If they haven't responded to two emails about the same value prop, try a different one. What else does your product or service solve? Who else at the company might care? Is there a timing hook (upcoming quarter end, new product launch, recent hiring)?</p>

<p>The goal here is to see if a different framing unlocks a response. Some prospects aren't interested in the first angle but are very interested in the second.</p>

<h2>Email 4: Social proof or case study</h2>

<p>By email 4, you've established yourself as persistent but not annoying (assuming your timing was right). Now you can bring in evidence. A customer result, a specific number, a one-paragraph case study.</p>

<p>Keep it specific and relevant. "We helped a B2B SaaS company increase their reply rate by 3x" is better than a generic testimonial. Make the comparison easy for the prospect: if they're in the same situation as the customer in your case study, the outcome applies to them.</p>

<h2>Email 5: The breakup</h2>

<p>The final email is counterintuitively one of the highest-performing ones in any sequence. Why? Because it's the only email that isn't asking for something. It's actually letting go.</p>

<p>A good breakup email looks something like:</p>

<p><em>"I'll leave you alone after this one. If timing ever changes and [problem] becomes a priority, I'm at [email]. Good luck with [something specific about their company]."</em></p>

<p>This email generates replies because it removes pressure. Suddenly the prospect doesn't feel sold to. They feel like a normal person who got a reasonable note from another normal person.</p>

<h2>What to do when someone does reply</h2>

<p>Remove them from the sequence immediately. Nothing damages trust faster than someone replying to email 3 and then getting email 4 anyway. Most tools handle this automatically with reply detection, but verify that yours does.</p>

<p>If they reply negatively, thank them and remove them. If they reply positively, respond within the hour when possible. The window on a warm lead from cold email is short.</p>
    `,
  },
  {
    slug: "spf-dkim-dmarc-setup-guide",
    title: "SPF, DKIM, and DMARC: Set Up All Three in 15 Minutes",
    description: "A step-by-step guide to setting up the three DNS records every cold email sender needs. With screenshots, common errors, and how to verify everything works.",
    category: "Technical",
    readTime: 8,
    publishedAt: "2026-05-12",
    content: `
<p>If you're sending cold email and haven't set up SPF, DKIM, and DMARC, your emails are getting filtered before most people ever see them. Here's how to set all three up correctly in about 15 minutes.</p>

<h2>What each record actually does</h2>

<p><strong>SPF (Sender Policy Framework)</strong> is a DNS record that lists which mail servers are allowed to send email on behalf of your domain. When someone receives an email from you, their mail server checks your SPF record and asks: "Is this server on the approved list?" If it's not, the email is flagged.</p>

<p><strong>DKIM (DomainKeys Identified Mail)</strong> adds a cryptographic signature to every outgoing email. The signature is tied to your domain and can be verified by the receiving mail server. It proves the email actually came from your domain and wasn't modified in transit.</p>

<p><strong>DMARC (Domain-based Message Authentication, Reporting, and Conformance)</strong> tells receiving mail servers what to do when SPF or DKIM checks fail. It also sends you reports about who's sending email on your behalf, which is useful for catching unauthorized use.</p>

<p>You need all three. SPF alone is not enough. DKIM alone is not enough. Each one covers gaps the others have.</p>

<h2>Step 1: Set up SPF</h2>

<p>Log in to wherever your DNS is managed. This is usually your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.) or a dedicated DNS provider.</p>

<p>Create a new TXT record with the host "@" (which represents your root domain).</p>

<p>The value depends on where you're sending from:</p>
<ul>
<li>If you're using Google Workspace: <code>v=spf1 include:_spf.google.com ~all</code></li>
<li>If you're using Microsoft 365: <code>v=spf1 include:spf.protection.outlook.com ~all</code></li>
<li>If you're using both: <code>v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all</code></li>
</ul>

<p>The <code>~all</code> at the end is a "soft fail" directive. It tells receiving servers to accept email from other sources but mark it as suspect. Use <code>-all</code> (hard fail) once you're confident your SPF record is complete and correct.</p>

<p>One critical rule: you can only have one SPF record per domain. If you already have one and need to add another mail provider, edit the existing record and add the new include statement. Creating a second SPF record breaks both.</p>

<h2>Step 2: Set up DKIM</h2>

<p>DKIM setup happens in two places: your email provider generates the key, and you add it to your DNS.</p>

<p><strong>For Google Workspace:</strong></p>
<ol>
<li>Go to Google Admin Console</li>
<li>Navigate to Apps, then Google Workspace, then Gmail</li>
<li>Click "Authenticate email"</li>
<li>Select your domain and click "Generate new record"</li>
<li>Copy the TXT record that Google provides</li>
</ol>

<p>In your DNS manager, create a new TXT record with the host Google specifies (usually "google._domainkey") and the value they provide. It looks like a long string of random characters.</p>

<p><strong>For Microsoft 365:</strong> Go to the Microsoft 365 Defender portal, then Email and Collaboration, then Policies and Rules, then Threat Policies, then DKIM. Click on your domain and enable DKIM signing.</p>

<p>After adding the DNS record, go back to your email provider and enable DKIM signing. There's usually a button or toggle for this.</p>

<h2>Step 3: Set up DMARC</h2>

<p>Create a new TXT record with the host "_dmarc" (the underscore is important).</p>

<p>Start with a permissive policy while you're getting set up:</p>
<code>v=DMARC1; p=none; rua=mailto:youremail@yourdomain.com</code>

<p>The "p=none" means "don't reject anything yet, just report." The "rua" address is where you'll receive DMARC aggregate reports. Use an email address you actually check.</p>

<p>After a week or two of receiving reports and confirming everything looks clean, tighten the policy:</p>
<code>v=DMARC1; p=quarantine; rua=mailto:youremail@yourdomain.com</code>

<p>Eventually move to <code>p=reject</code> which tells receiving servers to outright reject emails that fail authentication. This gives your domain the strongest protection and the best reputation signals.</p>

<h2>Verify everything is working</h2>

<p>DNS changes can take up to 48 hours to propagate, though most take less than an hour. After waiting for propagation, verify your records:</p>

<ul>
<li>MXToolbox SPF Lookup: checks your SPF record is valid and parses correctly</li>
<li>MXToolbox DKIM Lookup: verify your DKIM record is accessible</li>
<li>MXToolbox DMARC Lookup: confirm your DMARC policy is set correctly</li>
</ul>

<p>You can also send a test email to mail-tester.com to get a score and see exactly what's passing and failing.</p>

<h2>Common mistakes</h2>

<p>Two SPF records breaks everything. Keep it to one.</p>

<p>Incorrect DKIM host name. Google specifies "google._domainkey" but some DNS providers require you to format it differently. If the lookup fails, try adding your domain to the end: "google._domainkey.yourdomain.com".</p>

<p>Not enabling DKIM signing in the email provider. Adding the DNS record is half the job. You also need to turn on signing in Google Admin or Microsoft 365.</p>

<p>Setting DMARC to "reject" before verifying everything works. Start with "none," monitor the reports, confirm your legitimate sends are passing, then tighten.</p>

<p>Set these up once and they run forever in the background. It's 15 minutes now that saves hours of deliverability debugging later.</p>
    `,
  },
  {
    slug: "cold-email-personalization-at-scale",
    title: "Cold Email Personalization at Scale: What Actually Works and What Reads as Robotic",
    description: "Personalization that's actually personal versus personalization that's just a first name in a template. Here's how to tell the difference and build sequences that feel human.",
    category: "Copywriting",
    readTime: 8,
    publishedAt: "2026-05-14",
    content: `
<p>Personalization has become a buzzword in cold email to the point where it's almost meaningless. Inserting someone's first name and company into a template is not personalization. It's mail merge. And prospects can tell the difference immediately.</p>

<p>Real personalization is about relevance. It signals to the recipient that you actually looked at their situation and thought about whether what you're offering makes sense for them specifically. Here's how to do that at scale without spending 20 minutes per lead.</p>

<h2>The two types of personalization</h2>

<p>There's line-level personalization and segment-level personalization. Both matter. They do different jobs.</p>

<p><strong>Line-level personalization</strong> is the first one or two sentences of an email, sometimes called the "first line" or "icebreaker." It's unique to each prospect and references something specific about them: a piece of content they published, a company announcement, a job they're hiring for, something on their LinkedIn.</p>

<p><strong>Segment-level personalization</strong> is about writing different versions of your email for different audience segments. The same email that works for a VP of Sales at a 200-person SaaS company won't resonate with a founder at a 10-person agency. Rewrite the core pitch for each meaningful segment.</p>

<p>Most senders do a bad job at both. They use a generic template and add a first name. The fix is to invest in one of these types, not both at once when starting out.</p>

<h2>How to do first-line personalization without losing a day</h2>

<p>The key insight is that most personalization can be researched in batches. You don't need to open 200 individual LinkedIn profiles one by one.</p>

<p>Here's a workflow that takes about 30 minutes per 50 leads:</p>

<p>Build your list in a spreadsheet with columns for company name, contact name, title, and a "first line" column. Then batch-process by looking at each company's LinkedIn page, website, or recent news. Look for one specific, recent thing: a funding announcement, a hiring surge in a particular department, a new product launch, a piece of content they published.</p>

<p>Write the first line in the spreadsheet. One sentence. Reference the thing you found. Keep it observation-based, not complimentary. "Saw [Company] just raised a Series A" is better than "Congrats on the amazing round." The first sounds like a peer paying attention. The second sounds like a bot fishing for engagement.</p>

<h2>The specificity spectrum</h2>

<p>Think of personalization as existing on a spectrum from generic to ultra-specific.</p>

<p><strong>Generic (don't do this):</strong> "I see you work in sales at a SaaS company."</p>
<p><strong>Industry-level (acceptable for volume):</strong> "Most [industry] teams I talk to are dealing with [common problem]."</p>
<p><strong>Company-level (good):</strong> "[Company] is one of the few [industry] companies that [specific observation]."</p>
<p><strong>Role-level (very good):</strong> "As a [their title], you're probably the one dealing with [specific challenge]."</p>
<p><strong>Individual-level (best):</strong> "Read your piece on [specific topic] last week."</p>

<p>Most senders should aim for company-level and role-level personalization as their baseline, with individual-level reserved for their highest-value prospects.</p>

<h2>What signals to use</h2>

<p>LinkedIn posts and articles: if someone publishes on LinkedIn, they want to be read. Referencing their content is genuine and shows you actually looked.</p>

<p>Company news and announcements: funding, product launches, new hires in relevant departments, office expansions, acquisitions. These are all signals of company state that your offer might be relevant to.</p>

<p>Job postings: a company hiring four AEs is scaling sales. A company hiring a Head of Marketing is investing in marketing. Job postings reveal priorities and pain points in ways no other data source matches.</p>

<p>Recent customers or case studies: if the prospect's company or someone from their network appears in a relevant case study, that's a strong personalization hook.</p>

<h2>The mistake that kills personalization's effectiveness</h2>

<p>Using personalization as a trick rather than a signal of relevance. Prospects can tell when you've referenced something but the rest of the email has nothing to do with it. Pseudo-personalization ("Loved your company's website!") followed by a generic pitch feels worse than no personalization at all. It signals that you did the work of pretending to care without doing the work of actually caring.</p>

<p>The test: could your personalization line plausibly appear in an email from a colleague or trusted contact? If yes, it's real. If not, the prospect will feel it and disengage.</p>

<h2>AI-assisted personalization</h2>

<p>AI can help generate first-line drafts at scale if you feed it the right inputs. Give an AI tool the company name, the contact's role, and one relevant data point, and ask it to write a one-sentence observation in a specific tone.</p>

<p>The output will need editing roughly 30-40% of the time. But even accounting for the editing, AI-assisted personalization can produce 10x the volume of fully manual work.</p>

<p>The catch: AI personalization tends to sound slightly formal or stiff. The fix is to edit toward the cadence you'd actually use in a text message or a Slack message. Short, direct, no padding.</p>
    `,
  },
  {
    slug: "cold-email-reply-rate-benchmarks",
    title: "Cold Email Reply Rate Benchmarks: What Good Actually Looks Like",
    description: "Industry benchmarks for cold email reply rates, broken down by outreach type, industry, and sequence length. With honest context on what the numbers mean.",
    category: "Strategy",
    readTime: 6,
    publishedAt: "2026-05-15",
    content: `
<p>Reply rate benchmarks are widely quoted and rarely contextualized. "3% is good" tells you nothing without knowing the industry, audience, offer, and sequence structure that produced the number. Here's what the numbers actually mean and how to use them to evaluate your own campaigns.</p>

<h2>The numbers</h2>

<p>Across a broad sample of B2B cold email campaigns, here are realistic benchmarks:</p>

<ul>
<li><strong>Average reply rate across all cold email:</strong> 2 to 5 percent</li>
<li><strong>Good reply rate for a well-executed campaign:</strong> 5 to 10 percent</li>
<li><strong>Excellent reply rate (strong offer, high personalization):</strong> 10 to 20 percent</li>
<li><strong>Elite tier (niche audience, product-market fit, perfect timing):</strong> 20 percent plus</li>
</ul>

<p>These are reply rates, not positive reply rates. All replies count: interest, not interested, wrong person, unsubscribes. Positive (interested) replies typically run at 20 to 40 percent of total replies, depending on how targeted the list was.</p>

<h2>What makes reply rates vary so much</h2>

<p>The gap between 2% and 20% is not primarily about subject lines or email copy. It's mostly about these factors:</p>

<p><strong>Audience specificity.</strong> A list of 200 highly targeted prospects who match your ICP closely will almost always outperform a list of 2,000 loosely matched contacts. Going narrower and more relevant consistently outperforms going wide.</p>

<p><strong>Offer relevance.</strong> Your product or service has to solve a real, immediate problem for the people you're emailing. If the timing is wrong or the problem isn't painful enough, even a perfect email gets a polite ignore.</p>

<p><strong>Sequence length and follow-up.</strong> Single-email campaigns massively underperform five-email sequences. A significant portion of replies come from follow-up emails, not the initial send. If you're measuring reply rate on email 1 only, your numbers look artificially low.</p>

<p><strong>Deliverability.</strong> This is the variable most senders underestimate. If 40% of your emails are landing in spam, your effective send volume is 60% of what you think it is. A 5% reply rate from a properly landing campaign might be a 10% reply rate if you fixed the deliverability first.</p>

<h2>How to actually use benchmarks</h2>

<p>Benchmarks are most useful for identifying outliers. If your reply rate is 0.5%, something is structurally wrong: deliverability, list quality, or offer relevance. If it's 15%, you have something worth scaling.</p>

<p>Don't benchmark against "the industry." Benchmark against your own previous campaigns. A campaign that produces 6% with 200 sends tells you something. Running the same campaign again with a better subject line tells you something incremental. Comparing your 6% to someone else's 12% without knowing their context tells you almost nothing.</p>

<h2>Open rates are increasingly unreliable</h2>

<p>Apple's Mail Privacy Protection (MPP) inflates open rates by pre-loading tracking pixels, making it appear emails are opened when they may not be. Gmail has similar tracking-blocking behavior in some configurations.</p>

<p>Reply rate is a much cleaner signal than open rate because it requires actual human engagement. Focus your optimization work on reply rate, not open rate.</p>

<h2>Industry benchmarks</h2>

<p>These vary considerably by sector. As a rough guide:</p>

<ul>
<li><strong>Agencies and consulting firms:</strong> 4 to 8%</li>
<li><strong>SaaS (early stage):</strong> 5 to 12%</li>
<li><strong>SaaS (mature, lower-urgency category):</strong> 2 to 5%</li>
<li><strong>Recruiting and staffing:</strong> 8 to 15%</li>
<li><strong>Financial services:</strong> 2 to 4%</li>
<li><strong>Marketing services:</strong> 3 to 7%</li>
</ul>

<p>The sectors with higher natural reply rates tend to be ones where the problem is immediate and the buyer is in active-search mode. If you're selling a solution to a problem the prospect actively thinks about every week, your reply rate will reflect that.</p>

<h2>What to do if your reply rate is low</h2>

<p>Before changing your copy, check deliverability. Use a tool to run a placement test and see where your emails are actually landing. Fix any spam issues first.</p>

<p>Then look at list quality. Are you actually emailing the right person at the right company? A CTO doesn't want to hear about your sales automation tool. A VP of Sales does.</p>

<p>Only after deliverability and targeting are solid should you start testing subject lines and email copy. Most senders invert this order and optimize the window dressing while the foundation is broken.</p>
    `,
  },
  {
    slug: "best-time-to-send-cold-emails",
    title: "The Best Time to Send Cold Emails (Based on Real Data)",
    description: "Does timing actually matter for cold email? Here's what the data says and how to set up your sending windows to hit inboxes when prospects are most likely to engage.",
    category: "Strategy",
    readTime: 5,
    publishedAt: "2026-05-16",
    content: `
<p>Timing is the cold email variable that generates the most confident claims and the weakest data. Everyone has a strong opinion. Here's what actually holds up under scrutiny.</p>

<h2>Does timing matter?</h2>

<p>Yes, but less than you think. And significantly less than list quality, offer relevance, and copy quality. Sending at the "optimal" time with a mediocre list and average copy will not outperform sending at a suboptimal time with a great list and strong copy.</p>

<p>That said, timing is a free variable. Once your fundamentals are in order, sending at better times is low-effort upside with no downside.</p>

<h2>What the data shows</h2>

<p>The most consistently cited findings from large-scale studies on B2B email engagement:</p>

<p><strong>Days:</strong> Tuesday, Wednesday, and Thursday outperform Monday and Friday. Monday mornings are competitive (inbox is flooded from the weekend). Friday afternoons are when people are mentally checked out. The middle of the week, during working hours, is the safest window.</p>

<p><strong>Times:</strong> Two windows consistently see higher engagement: early morning (7am to 9am, before meetings start) and mid-morning (10am to 11am, after the first wave of email sorting). Early afternoon (1pm to 2pm, right after lunch) is a secondary window that works in some studies but not others.</p>

<p><strong>Timezone:</strong> Always send in the recipient's timezone, not yours. An email that arrives at 7am in New York arrives at 4am in London. Invest in getting your list's timezone data right or use a tool that handles this automatically.</p>

<h2>The problem with "best time" lists</h2>

<p>Published "best time to send" studies almost always have two problems. First, they're measuring opens, not replies. Timing's effect on opens and its effect on replies may be different. Second, they're usually based on newsletter or marketing email data, not cold outreach. The two have very different audience relationships.</p>

<p>Cold email recipients are not subscribers who expect your content. They're strangers with no existing relationship with you. The variables that drive engagement are different.</p>

<h2>The practical setup</h2>

<p>Here's the sending window configuration most practitioners use as a default:</p>

<ul>
<li>Days: Monday through Friday</li>
<li>Hours: 7am to 11am in the recipient's local timezone</li>
<li>Exclusions: major public holidays in the prospect's country</li>
</ul>

<p>Within this window, use randomized send times rather than sending all emails at exactly 9:00am. Randomized timing looks more human and avoids your entire send batch competing for attention at the exact same moment.</p>

<h2>Avoid the weekend, almost always</h2>

<p>The one consistent finding that holds across nearly every study: weekends underperform weekdays significantly for B2B cold email. The exception is if your ICP is known to be highly engaged with email on weekends (some founder audiences, some agency owners). For most B2B outreach, just avoid weekends.</p>

<h2>Testing timing for your specific audience</h2>

<p>The most reliable data on timing for your audience is your own data. After you have a few hundred sends worth of history, look at your reply and open data by day of week and time of day. Most email tools let you pull this report.</p>

<p>If you see a clear pattern, shift your sending window toward it. If you don't see a clear pattern, the default Tuesday-Thursday, 7am-11am window is as good as anything else.</p>
    `,
  },
  {
    slug: "ab-testing-cold-email",
    title: "A/B Testing Cold Email: The Only Variables Worth Testing",
    description: "Most cold email A/B tests waste time on the wrong variables. Here's what to test, in what order, and how to run tests that produce actionable results.",
    category: "Strategy",
    readTime: 7,
    publishedAt: "2026-05-17",
    content: `
<p>A/B testing is one of the most misapplied practices in cold email. Senders run tests with too few sends, on the wrong variables, with too short a time window, and then make sweeping conclusions from the results. Here's how to do it right.</p>

<h2>What to test first</h2>

<p>Test in order of expected impact. Changing your offer (the thing you're asking for) will have more impact than changing your subject line. Changing your subject line will have more impact than changing your send time.</p>

<p>The hierarchy:</p>

<ol>
<li>The offer or CTA (what you're asking for)</li>
<li>The core value proposition (what you lead with)</li>
<li>The audience segment (who you're targeting)</li>
<li>The email length (short vs. medium)</li>
<li>The subject line</li>
<li>The first line</li>
<li>Send timing</li>
</ol>

<p>Most people start at the bottom of this list and wonder why testing never seems to move the needle much.</p>

<h2>Sample sizes that actually mean something</h2>

<p>To detect a meaningful difference between two variants (say, 5% reply rate vs. 8% reply rate) with reasonable statistical confidence, you need a minimum of 200 sends per variant. For detecting smaller differences, you need 400 to 500 per variant.</p>

<p>This is why testing on a list of 50 sends per variant is nearly useless. Even if one variant "wins," the difference could easily be noise. You're not getting signal, you're getting randomness.</p>

<p>If your list is small, run your test over a longer period rather than rushing to results. Split the test over two weeks if necessary to hit your sample size.</p>

<h2>Testing subject lines properly</h2>

<p>Subject line tests are the most common and often the most misrun. The rules:</p>

<p>Change one thing at a time. If you change the subject line and also change the first line of the email, you can't know which one drove the result.</p>

<p>Wait for statistical significance. A 3% vs. 4% difference on 100 sends is not meaningful. Run the test until you've hit your sample size minimum.</p>

<p>Measure reply rate, not just open rate. If one subject line gets 30% more opens but the same reply rate, it's not a better subject line for your goal. Opens are a step in the funnel, not the outcome.</p>

<p>Test categories of subject lines, not just variants. "Question vs. statement" is a more useful test than "version A vs. version B." You're trying to find patterns that generalize, not just pick a winner for this one campaign.</p>

<h2>Testing CTA and offer</h2>

<p>The ask at the end of your email has one of the highest impacts on reply rate of any element. Common tests:</p>

<ul>
<li>"15-minute call" vs. "quick 10-minute chat"</li>
<li>"Would it make sense to connect?" vs. "Worth a 10-minute call this week?"</li>
<li>Direct ask (book a demo) vs. soft ask (just curious if this is relevant)</li>
<li>Specific time offer ("Free Tuesday at 2pm?") vs. open ask</li>
</ul>

<p>In general, softer asks and lower-commitment requests tend to generate higher reply rates in cold email. But the right ask for your product depends on your sales process and your audience. This is worth testing directly.</p>

<h2>Length tests</h2>

<p>Short emails (3 to 5 sentences) vs. medium emails (5 to 8 sentences) is a perennial debate. The honest answer: short almost always wins on reply rate, but medium sometimes wins on positive reply quality. The prospect who replies to a short email might do so with "what is this?" while the one who reads a slightly longer email might reply with "I'm interested in learning more."</p>

<p>Test this for your audience, because the answer really does vary by ICP. Enterprise buyers often expect a bit more context before replying. SMB buyers often prefer short.</p>

<h2>Running a clean test</h2>

<p>Split your list randomly, not by segment. If you send variant A to all your tech contacts and variant B to all your finance contacts, you can't separate the effect of the variant from the effect of the audience difference.</p>

<p>Run both variants in the same time window. Monday morning and Friday afternoon perform differently. If one variant runs Monday and one runs Friday, you're measuring timing, not the variant.</p>

<p>Give each test a minimum run of two weeks. Cold email responses are not immediate. Some prospects reply to emails that sat unread for four days. Cutting a test after three days loses these delayed replies and skews results toward the variant that generated faster opens.</p>
    `,
  },
  {
    slug: "build-cold-email-lead-list",
    title: "How to Build a Cold Email Lead List That Actually Converts",
    description: "The difference between a lead list that generates replies and one that burns your domains. How to source, qualify, verify, and segment leads for cold outbound.",
    category: "Strategy",
    readTime: 8,
    publishedAt: "2026-05-18",
    content: `
<p>The quality of your lead list determines the ceiling of your campaign performance. Even perfect copy and flawless deliverability can't compensate for a list full of wrong-fit contacts. Here's how to build one that converts.</p>

<h2>Define the ICP before building anything</h2>

<p>ICP stands for Ideal Customer Profile. It's the description of the company and contact that would get the most value from what you offer and is most likely to buy. If you can't articulate this in one paragraph, you're not ready to build a list yet.</p>

<p>A good ICP definition answers: What industry? What company size (employees, revenue)? What geography? What tech stack or existing tools? What job titles? What stage of business? What problem do they have right now?</p>

<p>The more specific your ICP, the better your list will perform. "B2B companies with 10 to 200 employees where the founder is also in charge of sales" is a better ICP definition than "small businesses."</p>

<h2>Where to source leads</h2>

<p><strong>LinkedIn Sales Navigator</strong> is the most commonly used source for B2B leads. It allows filtering by company size, industry, title, geography, and signals like recent job changes and company growth. The leads you pull are relatively fresh and have verified job information. The downside is that email addresses are not included and need to be found separately.</p>

<p><strong>Apollo.io and ZoomInfo</strong> provide both contact data and email addresses in one place. The email quality varies, with Apollo generally doing better on smaller companies and ZoomInfo on enterprise. Always verify emails from these sources before sending.</p>

<p><strong>Lead scraping tools</strong> like Clay, Phantombuster, and custom scrapers can pull leads from specific sources like job boards, review sites, directories, and public databases. These are powerful for building hyper-targeted lists but require more technical setup.</p>

<p><strong>Intent data tools</strong> like Bombora and G2 can tell you which companies are actively researching topics related to your product. This is higher-quality targeting because you're reaching people in active research mode rather than cold prospects.</p>

<h2>How to verify your list</h2>

<p>Every list should be verified before it enters a campaign. Unverified lists have high bounce rates. High bounce rates damage your sender reputation. Enough bounces and your domain is flagged.</p>

<p>Email verification tools (ZeroBounce, NeverBounce, Millionverifier) check each address against known MX records and flag addresses as valid, invalid, catch-all, or risky. Remove invalid addresses before sending. Be cautious with catch-all addresses, which accept all mail for a domain but may not deliver to a real inbox.</p>

<p>A typical list might be 80% valid, 10% invalid, and 10% catch-all. Remove the invalids. Send to the catch-alls but monitor bounce rates closely.</p>

<h2>Segmentation for performance</h2>

<p>Once your list is built and verified, segment it before adding to campaigns. The goal is to ensure that each email feels relevant to the recipient, which means you need different copy for different segments.</p>

<p>Common segmentation variables: job title, company size, industry, tech stack (if relevant), and geography. Build separate campaign sequences for each meaningful segment. Yes, this is more work upfront. The reply rate improvement makes it worth it.</p>

<h2>List size and volume</h2>

<p>There's no universally correct list size. But there are useful rules. For a brand-new offer being tested, 200 to 500 contacts is enough to get meaningful signal on whether the campaign works before scaling. For a proven offer being scaled, the list should be as large as you can source while maintaining quality.</p>

<p>The temptation is to chase list size at the expense of quality. A list of 200 well-qualified, verified contacts from your ICP will consistently outperform a list of 2,000 loosely matched contacts. Focus on quality first, then scale.</p>

<h2>List maintenance</h2>

<p>Lists go stale. People change jobs, get promoted, leave companies, and retire. A list that was 80% accurate when you built it three months ago might be 70% accurate today. Refresh your lead sources regularly and re-verify before every major campaign relaunch.</p>
    `,
  },
  {
    slug: "cold-email-vs-linkedin-outreach",
    title: "Cold Email vs. LinkedIn Outreach: Which One Should You Use?",
    description: "When to use cold email, when to use LinkedIn, and when to use both. A tactical breakdown for different stages, audiences, and goals.",
    category: "Strategy",
    readTime: 7,
    publishedAt: "2026-05-19",
    content: `
<p>Cold email and LinkedIn outreach are complements, not competitors. But choosing where to put your effort depends on your audience, your offer, and your current pipeline situation. Here's how to think through it.</p>

<h2>Where each channel wins</h2>

<p><strong>Cold email wins when:</strong></p>
<ul>
<li>You need volume. Email scales to thousands of contacts per month with the right infrastructure. LinkedIn is capped and rate-limited much more aggressively.</li>
<li>Your audience is email-forward. Finance, legal, operations, and most traditional industries respond better to email than LinkedIn.</li>
<li>You have a long sequence. LinkedIn's connection-based model makes multi-touch sequences awkward. Email handles 5-step sequences naturally.</li>
<li>You want detailed tracking. Email gives you opens, clicks, bounces, and replies in granular detail. LinkedIn's native analytics are limited.</li>
</ul>

<p><strong>LinkedIn wins when:</strong></p>
<ul>
<li>Your audience is highly active on the platform. Tech founders, VC-backed startups, sales and marketing professionals, and recruiters are all power users.</li>
<li>You want to warm up a contact before emailing. A connection request followed by a comment on their post followed by an email is a warm cold email. It outperforms a cold email to a stranger.</li>
<li>Email addresses are hard to find. Some senior executives are well-protected at the email level but are reachable via LinkedIn.</li>
<li>Your offer is higher-touch or higher-ticket. The higher the ACV, the more relationship-based the sales process needs to be. LinkedIn facilitates relationship-building in a way email doesn't.</li>
</ul>

<h2>The combined approach</h2>

<p>The highest-performing outbound programs usually use both channels in a coordinated way. Here's a sequence that works:</p>

<ol>
<li>Connect on LinkedIn with a short, non-pitchy note</li>
<li>If they accept, comment on or engage with one of their posts</li>
<li>Send a LinkedIn message referencing something specific</li>
<li>If no response, follow up via email with a reference to the LinkedIn connection</li>
</ol>

<p>The LinkedIn touchpoint makes the email feel less cold. You're no longer a stranger when your email arrives. The email makes the LinkedIn message feel more persistent without being annoying.</p>

<h2>The LinkedIn volume problem</h2>

<p>LinkedIn has become increasingly aggressive about limiting outreach volume. Connection request limits, message limits, and profile view limits mean you can't run high-volume outreach through the platform without hitting walls.</p>

<p>At scale, email is the primary channel and LinkedIn is a supplemental signal. The economics don't work the other way around unless your volume targets are modest.</p>

<h2>When to choose one or the other</h2>

<p>If you're testing a new offer, start with email. It's faster to iterate on, more scalable, and gives you cleaner data on what's working.</p>

<p>If you're going after a small list of dream accounts (less than 50 targets), LinkedIn-first makes sense because the relationship-building is worth the time investment at that scale.</p>

<p>If your offer is to a LinkedIn-native audience (social media managers, content creators, growth marketers), LinkedIn outperforms email meaningfully. If your offer is to an email-native audience (financial services, law firms, traditional industries), email outperforms LinkedIn meaningfully.</p>

<h2>The channel isn't the problem</h2>

<p>Most conversations about cold email vs. LinkedIn are actually about offer-market fit, not channel performance. If your offer isn't resonating, switching channels won't fix it. If your targeting is off, a better channel won't save the campaign.</p>

<p>Get the fundamentals right first: clear ICP, relevant offer, clean messaging, verified list. Then use whichever channel puts your message in front of the right person most efficiently. That's the framework.</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category === category);
}

export const CATEGORIES = [...new Set(BLOG_POSTS.map((p) => p.category))];
