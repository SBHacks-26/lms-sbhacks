"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Keep hero highlights fixed so the tone stays intentional
const highlightCards = [
  {
    title: "Honest submissions",
    copy: "Courses nudge students to hand in their own work, with clear checkpoints so nothing feels hidden.",
    tone: "purple",
  },
  {
    title: "Calm tracking",
    copy: "You see status, timing, and follow ups without noise, so you focus on real teaching.",
    tone: "blue",
  },
  {
    title: "Fair reviews",
    copy: "Simple flows let instructors confirm understanding before any grade is final, which feels fair.",
    tone: "red",
  },
];

// Simple three-step path to keep orientation clear
const steps = [
  "Create homework and share it with the class, this keeps everyone aligned.",
  "Students submit on time, and we surface anything that seems off.",
  "If we flag something, guide the student through a short follow up.",
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white text-foreground">
      <section className="border-b border-border bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-start">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-xs font-semibold text-primary">
              GradeMeIn LMS
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Keep coursework honest and straightforward for everyone
              </h1>
              <p className="text-lg text-muted-foreground">
                GradeMeIn keeps classes tidy: you assign work, students submit, and we tell you when something needs a closer look.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="h-12 bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90" variant="default">
                <Link href="/teacher">Enter as Teacher</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-muted">
                <Link href="/student">Enter as Student</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Active courses</p>
                <p className="mono-emph text-3xl font-semibold text-foreground">12</p>
                <p className="text-xs text-foreground">Rosters stay synced</p>
              </div>
              <div className="border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">On-time submissions</p>
                <p className="mono-emph text-3xl font-semibold text-secondary">94%</p>
                <p className="text-xs text-foreground">New this week</p>
              </div>
              <div className="border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Follow-ups queued</p>
                <p className="mono-emph text-3xl font-semibold text-destructive">3</p>
                <p className="text-xs text-foreground">Needs instructor review</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="border border-border bg-card p-6 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Today</p>
                  <p className="text-lg font-semibold text-foreground">Course activity</p>
                </div>
                <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Live</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Homework 3: Cellular Energy</p>
                    <p className="text-xs text-muted-foreground">Most students submitted on time, good pace</p>
                  </div>
                  <span className="mono-emph bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Steady</span>
                </div>

                <div className="flex items-center justify-between border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Essay draft: Reconstruction era</p>
                    <p className="text-xs text-muted-foreground">A few responses need confirmation, so check them</p>
                  </div>
                  <span className="mono-emph bg-destructive px-3 py-1 text-xs font-semibold text-white">Review</span>
                </div>

                <div className="flex items-center justify-between border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Audio reflection: Week 5</p>
                    <p className="text-xs text-muted-foreground">Transcripts stay stored for reference</p>
                  </div>
                  <span className="mono-emph bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {highlightCards.map((item) => (
            <div
              key={item.title}
              className="border border-border bg-white p-6 shadow-sm"
            >
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span
                  className={`h-2 w-10 ${
                    item.tone === "purple"
                      ? "bg-primary"
                      : item.tone === "blue"
                        ? "bg-secondary"
                        : "bg-destructive"
                  }`}
                />
                Focused delivery
              </div>
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border border-border bg-foreground px-8 py-10 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-wide text-accent">How it works</p>
              <h2 className="text-3xl font-semibold leading-tight">Simple steps to keep work honest</h2>
              <p className="text-sm text-white/80">
                GradeMeIn keeps flows clear so instructors spot issues fast, and students stay accountable without feeling policed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                asChild
                className="h-12 bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/teacher">Get started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-muted"
              >
                <Link href="/student">View as student</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className="border border-border bg-slate-900 p-5 text-white"
              >
                <div className="flex items-center justify-between text-sm text-accent">
                  <span>Step {index + 1}</span>
                  <span className="bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">Focused</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/90">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
