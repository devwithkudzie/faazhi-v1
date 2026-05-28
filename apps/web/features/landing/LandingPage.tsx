"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  PenLine, ScanLine, Sparkles, ShieldCheck, ArrowRight, GraduationCap, UserCog,
  CheckCircle2, ClipboardCheck, BarChart3,
} from "lucide-react";
import { Logo } from "@/shared/components/layout/Logo";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/shared/providers/AuthProvider";

const Index = () => {
  const { loginAs, user } = useAuth();
  const router = useRouter();

  const enterAs = async (id: string, dest: string) => {
    await loginAs(id);
    router.push(dest);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-foreground/80">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#demo" className="hover:text-foreground">Demo</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href={user.role === "student" ? "/subjects" : "/admin"}>
                  Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link href="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary-soft))_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Cambridge 9618 · Specimen-style papers
            </div>
            <h1 className="mt-5 font-serif-paper text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-foreground">
              Write on the paper.<br />
              <span className="text-primary">Mark like you would.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              PaperMark digitises Cambridge Computer Science exam papers so candidates write
              directly in the answer spaces — and teachers mark with pen-style annotations,
              guided by the mark scheme and AI-assisted suggestions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3" id="demo">
              <Button size="lg" onClick={() => void enterAs("u-student-1", "/subjects")} className="gap-2">
                <GraduationCap className="h-5 w-5" /> Enter as Student
              </Button>
              <Button size="lg" variant="outline" onClick={() => void enterAs("u-admin", "/admin")} className="gap-2">
                <UserCog className="h-5 w-5" /> Enter as Admin
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/signin">Sign in with email</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo accounts pre-loaded · No setup required
            </p>
          </div>

          {/* Hero visual: mock paper sheet */}
          <div className="relative">
            <div className="paper-sheet rounded-md p-6 sm:p-8 rotate-[-1deg] shadow-xl">
              <div className="flex items-start justify-between text-[10px] text-foreground/70 uppercase tracking-wider">
                <div>Cambridge 9618 · Computer Science</div>
                <div>Paper 2 · Specimen</div>
              </div>
              <div className="mt-6 font-serif-paper">
                <p className="text-sm font-semibold">1 (b)</p>
                <p className="text-sm mt-1">
                  Identify one logic error if the loop runs <em>FOR i ← 1 TO 4</em> instead of <em>FOR i ← 1 TO 5</em>.
                </p>
                <p className="text-xs text-foreground/60 mt-1">[2]</p>
              </div>
              <div className="mt-3 paper-lines h-[112px] relative">
                <span className="answer-input absolute left-0 top-0 leading-[28px]">
                  Numbers[5] is missed, so largest could be wrong if it&rsquo;s the last value.
                </span>
                <span className="absolute -right-2 top-0 text-3xl marker-tick rotate-12">✓</span>
                <span className="absolute right-2 bottom-1 text-sm marker-comment">good — 2/2</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="rounded bg-success/10 text-success px-2 py-0.5 font-medium">+2 marks</span>
                <span className="rounded bg-primary-soft text-primary px-2 py-0.5">AI: matched MP1, MP2</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 paper-sheet rounded-md p-4 w-44 rotate-[3deg] hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-foreground/60">Mark Scheme</div>
              <ul className="mt-1 text-xs space-y-1">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /> Last element missed</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /> Output may be wrong</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h2 className="font-serif-paper text-3xl font-semibold">Built for real exam workflow</h2>
            <p className="mt-3 text-muted-foreground">
              Every interaction mirrors how candidates and examiners actually work with Cambridge papers.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: PenLine, title: "Write in the answer space", body: "Lined answer areas, working boxes, trace tables and pseudocode boxes — exactly where they appear on paper." },
              { icon: ScanLine, title: "Pen-style marking", body: "Tick, cross, circle, highlight, and pin margin notes directly on top of the candidate's script." },
              { icon: Sparkles, title: "AI-assisted first pass", body: "Suggested marks, matched mark points, missing keywords and confidence — teacher always has final say." },
              { icon: ShieldCheck, title: "Positive marking", body: "Whole marks only, aligned to the question's mark scheme. No deductions unless required." },
              { icon: ClipboardCheck, title: "Question tree navigation", body: "Jump to any sub-question with progress and mark totals at a glance." },
              { icon: BarChart3, title: "Live analytics", body: "Score distributions, weak topics, marking turnaround — visible on day one." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-5">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif-paper text-3xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", title: "Candidate sits the paper", body: "Opens a paper, writes directly in the answer spaces, flags questions, and submits when done." },
            { n: "02", title: "AI does a first pass", body: "Each answer is compared against mark scheme points, with confidence and any missing keywords highlighted." },
            { n: "03", title: "Examiner confirms", body: "Teacher reviews the script in a 3-panel marking workspace and accepts or overrides every mark." },
          ].map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs text-accent font-mono">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif-paper text-2xl font-semibold">Try the demo workspace</h3>
            <p className="mt-1 text-primary-foreground/80 text-sm">Two seeded papers, six attempts, marked scripts and AI suggestions ready to explore.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" variant="secondary" onClick={() => enterAs("u-student-1", "/student")}>
              Student demo
            </Button>
            <Button size="lg" variant="secondary" onClick={() => enterAs("u-admin", "/admin")}>
              Admin demo
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        PaperMark 9618 — Demo prototype · Original Cambridge-style content for illustrative purposes only.
      </footer>
    </div>
  );
};

export default Index;
