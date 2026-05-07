// Warmup message generator — innocuous, varied, looks like real conversation
const subjects = [
  "Quick question", "Following up", "Thoughts on this?", "Re: our chat",
  "Heads up", "Idea for next week", "Catching up", "Quick check-in",
  "Coffee soon?", "Reading list", "Project update", "Friday note",
];

const openers = [
  "Hope you're doing well!", "Wanted to share something.", "Thinking of you today.",
  "Random thought —", "Saw this and thought of you.", "Following up on what we discussed.",
];

const bodies = [
  "Just wanted to check in and see how things are going on your end. Things have been busy here but in a good way.",
  "Came across an interesting article today about productivity habits. Worth a read when you have a moment.",
  "Hope the week is treating you well. Let me know if there's anything I can help with.",
  "Quick update on the project — making good progress, will share more details soon.",
  "Heard about an interesting talk happening next month. Might be worth attending together.",
  "Been meaning to write — hope all is well. Let's catch up properly soon.",
];

const closers = [
  "Talk soon,", "Cheers,", "Best,", "Take care,", "Thanks,", "Warm regards,",
];

const replies = [
  "Thanks for sending this over! Really appreciate it.",
  "Got it — will take a look and circle back.",
  "Great point. Let me think on it.",
  "Appreciate the update. Sounds good.",
  "Noted, thanks for the heads up.",
  "Interesting — let's discuss next time we chat.",
];

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function generateWarmupEmail() {
  return {
    subject: pick(subjects),
    body: `${pick(openers)}\n\n${pick(bodies)}\n\n${pick(closers)}`,
  };
}

export function generateWarmupReply(originalSubject: string) {
  return {
    subject: originalSubject.startsWith("Re:") ? originalSubject : `Re: ${originalSubject}`,
    body: `${pick(replies)}\n\n${pick(closers)}`,
  };
}
