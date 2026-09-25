
"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-24 text-white sm:px-8">

      
      <div className="pointer-events-none fixed left-0 top-20 h-80 w-80 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">

        
        <div className="mb-12 text-center">

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
            Get In Touch
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Contact <span className="text-red-600">ZAA</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Have a T-shirt design, printing requirement, or custom order?
            Contact ZAA and let's create something unique.
          </p>

        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Contact Information
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Let's Talk
            </h2>

            <div className="mt-8 space-y-4">

              
              <a
                href="tel:+91 6009570225"
                className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-1 hover:border-red-700 hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/40 text-xl transition group-hover:bg-red-600">
                  📱
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Mobile
                  </p>

                  <p className="mt-1 font-bold text-white">
                    +91 6009570225
                  </p>
                </div>

                <span className="ml-auto text-zinc-700 group-hover:text-red-500">
                  →
                </span>
              </a>

              
              <a
                href="https://wa.me/+916009570225"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-1 hover:border-green-700 hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-950/30 text-xl transition group-hover:bg-green-600">
                  💬
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    WhatsApp
                  </p>

                  <p className="mt-1 font-bold text-white">
                    Chat with ZAA
                  </p>
                </div>

                <span className="ml-auto text-zinc-700 group-hover:text-green-500">
                  ↗
                </span>
              </a>

                
              <a
                href="https://www.instagram.com/zaartists26/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-1 hover:border-pink-700 hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-950/30 text-xl transition group-hover:bg-pink-600">
                  📸
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Instagram
                  </p>

                  <p className="mt-1 font-bold text-white">
                    Follow ZAA
                  </p>
                </div>

                <span className="ml-auto text-zinc-700 group-hover:text-pink-500">
                  ↗
                </span>
              </a>

              
              <a
                href="mailto:zaartists26@gmail.com"
                className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-1 hover:border-red-700 hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-xl transition group-hover:bg-red-600">
                  ✉️
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Email
                  </p>

                  <p className="mt-1 font-bold text-white">
                    zaartists26@gmail.com
                  </p>
                </div>

                <span className="ml-auto text-zinc-700 group-hover:text-red-500">
                  →
                </span>
              </a>

            </div>
          </section>


          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Visit Us
            </p>

            <h2 className="mt-2 text-2xl font-black">
              ZAA Studio
            </h2>

           
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/40 text-2xl">
                📍
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                Address
              </p>

              <p className="mt-2 text-lg font-bold leading-7">
                Singjamei Kshetri Leikai
                <br />
                Lane 5
                <br />
                Imphal, Manipur
              </p>

            </div>

          
            <div className="mt-4 grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xl">👕</p>
                <p className="mt-3 text-sm font-bold">
                  T-Shirt Printing
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xl">🎨</p>
                <p className="mt-3 text-sm font-bold">
                  Custom Design
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xl">🖨️</p>
                <p className="mt-3 text-sm font-bold">
                  DTF Printing
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xl">🖌️</p>
                <p className="mt-3 text-sm font-bold">
                  Screen Printing
                </p>
              </div>

            </div>

          </section>

        </div>

        
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-red-900/40 bg-gradient-to-r from-red-950/50 to-zinc-950 p-6 sm:p-8">

          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                Ready to Create?
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Start your custom T-shirt project.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Contact us directly through WhatsApp.
              </p>
            </div>

            <a
              href="https://wa.me/+916009570225"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Chat on WhatsApp →
            </a>

          </div>

        </section>

        
        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center">

          <div className="text-2xl font-black">
            <span className="text-red-600">Z</span>
            <span>AA</span>
          </div>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">
            Zero Authority Artists
          </p>

          <p className="mt-4 text-xs text-zinc-800">
            © 2026 ZAA. All rights reserved.
          </p>

        </footer>

      </div>
    </main>
  );
}

