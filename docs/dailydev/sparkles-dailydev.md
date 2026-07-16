# Vibe coding is dead. I built my app on specs instead.

![The home screen, where every idea is a star](../screenshots/constellation.png)

Google Keep is where my ideas go to die. No folder, no labels, no system. Just a heap of 400 something notes in no particular order: a video hook, a plot twist, a line of dialogue, a villain's motivation scribbled at 2 a.m., and, for reasons lost to history, a grocery list.

Here's the thing nobody warns you about capturing everything: **capture was never my problem.** I'm elite at it. What I'm catastrophically bad at is everything *after*. Coming back to it. Remembering it exists. Noticing that the idea I had in March was secretly the missing half of the idea I had in July.

My notes app wasn't a garden. It was a graveyard.

So I built the app I actually needed. It's called **Sparkles**, and instead of another bottomless list, it turns your ideas into a night sky: **every thought is a star, every connection is a thread, and your mind becomes a sky you can walk through.**

## The problem isn't capture. It's connection.

When you dump thoughts into a linear notes app, two quiet tragedies happen:

1. **They fall off the bottom.** Out of sight, out of mind.
2. **They never touch each other.** A notes app treats every thought as a lonely island. But ideas aren't islands. Their whole value is in the *lines between them*.

A list can't show you that the joke you wrote on Tuesday belongs in the scene you sketched last month. That connective tissue, the exact part your brain is *worst* at holding onto, is the part every notes app cheerfully throws in the bin.

## The part I actually care about: I built this on purpose, not on vibes

Here's the fork in the road where I could've taken the easy path, and didn't.

**Vibe coding** — open an AI, describe what you want, accept whatever it hands back, poke it by feel until it roughly works — is a genuine superpower for a weekend prototype. But it has a bill that always comes due: **there is no source of truth.** Features drift. You forget *why* anything works. The AI happily bulldozes last week's decision because nobody wrote that decision down. You end up with an app that runs but doesn't *mean* anything.

For an app about **intention**, that felt like a betrayal of the whole point. So I used **Spec Driven Development (SDD)** instead.

SDD flips the order everyone's used to. **The spec is the source of truth and the code is just a projection of it:**

> **constitution → spec → plan → tasks → implement**

- **A constitution.** The app's non-negotiable principles, written first. *Local first, always. Your data is yours. Calm by default. AI is offered, never forced.* Every later decision has to bow to these.
- **A spec for every feature.** The *what* and the *why* in plain English, with acceptance criteria.
- **A plan.** The *how* — data model, architecture, trade-offs, each traced back to a line in the spec.
- **Tasks.** The plan chopped into ordered, checkable steps.
- **Then, and only then, the actual code.**

Here's a real moment where this saved me. The spec for "Capture" had one ironclad line: *capturing an idea must never wait on the network.* That single sentence, born from the "local first" principle in the constitution, forced an entire architecture decision — a local database as the source of truth, with sync as an optional layer bolted on top. If I'd been vibe coding, I'd have wired capture to a cloud API on autopilot and quietly gutted the soul of the app. The spec caught it before I wrote one line of code.

### But didn't you use AI anyway?

Constantly. I built this with a *ton* of AI help. The difference is entirely in *what the AI was building from.*

Vibe coding hands the AI a vague wish and a prayer. SDD hands it a **blueprint**. Give the AI a constitution and a spec to work against and it stops being a slot machine you keep yanking and becomes an actual collaborator that knows exactly what you're making — one you can *check*, because "done" was defined before the work started.

### The stack

The app runs on **React Native with Expo**, so I could write it once and ship to iPhone, Android, and web from a single codebase. It fits a **local first** app like a glove — an on-device SQLite database sits right there in the stack, so "your ideas never leave your phone" was the default instead of a battle. Design went through **Google Stitch**, **Antigravity** (Gemini), and finally **Claude Design**, which was the real game changer. Then **Claude Code**, wired through **MCP** on **Claude Opus 4.8**, turned those screens into a working app.

### Prompts are cheap. Intentions are expensive.

Writing a spec feels slower for roughly a day. Then it pays you back for the entire life of the project, because every prompt after that is *aimed*. The AI is still doing ninety percent of the typing. It's just no longer allowed to *guess what you meant*.

So if you take one thing from this: **vibe your throwaway prototypes to your heart's content — that's what they're for. But the moment something starts to matter, stop vibing and start specifying.** Intention is the one thing the machine cannot generate for you.

## Try it, and read the specs yourself

Sparkles is **open source.** Clone it, get it running locally in about a minute, and turn a few of your own scattered thoughts into stars.

### 👉 [github.com/iamntg/Sparkles](https://github.com/iamntg/Sparkles)

And if you're curious what "spec driven" looks like in the wild, open [`docs/specs/`](https://github.com/iamntg/Sparkles/tree/main/docs/specs). Every feature's constitution, spec, plan, and tasks are sitting there in the open. That folder *is* the app's intention, written down where you can read it.

- ⭐ **Star the repo** if the idea speaks to you.
- 🐛 **Open an issue** with what broke or confused you.
- 🌌 **Tell me how your ideas connected.** The surprising links are the entire point.

<!-- daily.dev tags (pick up to 4): #vibecoding #ai #react-native #productivity -->
