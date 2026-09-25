
"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">

    
      <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.4em] text-red-500">
              ABOUT ZAA
            </p>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              WE TURN
              <br />
              YOUR IDEAS
              <br />
              <span className="text-red-500">INTO STYLE.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
              ZAA is a creative T-shirt printing and design brand based in
              Singjamei Kshetri Leikai, Lane 5, Imphal, Manipur.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-red-600 px-7 py-3 font-bold transition hover:bg-red-500"
            >
              Get In Touch →
            </Link>
          </div>

          
          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
            <div className="absolute h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-8xl font-black tracking-tighter md:text-9xl">
                <span className="text-red-600">Z</span>AA
              </h2>

              <p className="mt-4 text-sm uppercase tracking-[0.5em] text-gray-500">
                Design • Print • Wear
              </p>
            </div>
          </div>
        </div>
      </section>

     
      <section className="border-t border-white/10 px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs font-bold tracking-[0.4em] text-red-500">
            01 — WHO WE ARE
          </p>

          <div className="grid gap-12 lg:grid-cols-2">
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              CREATIVE
              <br />
              <span className="text-gray-500">IDEAS.</span>
              <br />
              QUALITY
              <br />
              PRINTING.
            </h2>

            <div className="space-y-6 text-gray-400">
              <p className="text-xl leading-8 text-white">
                ZAA is a local creative printing and design brand focused on
                customized T-shirts, DTF printing, screen printing, and
                innovative design solutions.
              </p>

              <p className="leading-7">
                We work with individuals, businesses, teams, organizations,
                events, and anyone who wants something unique.
              </p>

              <p className="leading-7">
                You bring the idea — we help turn it into a creative design
                that stands out.
              </p>
            </div>
          </div>
        </div>
      </section>

     
      <section className="bg-zinc-950 px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
                02 — WHAT WE DO
              </p>

              <h2 className="text-4xl font-black md:text-6xl">
                OUR SERVICES
              </h2>
            </div>

            <p className="max-w-md text-gray-500">
              From customized T-shirts to creative graphics, we help bring
              your ideas to life.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <ServiceCard
              number="01"
              icon="🖨"
              title="DTF Printing"
              description="Detailed and colorful custom printing for T-shirts and apparel."
              featured
            />

            
            <ServiceCard
              number="02"
              icon="🖌"
              title="Screen Printing"
              description="Reliable screen printing for suitable designs and bulk orders."
            />

           
            <ServiceCard
              number="03"
              icon="✎"
              title="Custom Design"
              description="Creative designs developed from your ideas, references, or concepts."
            />

            
            <ServiceCard
              number="04"
              icon="👕"
              title="Sublimation Printing"
              description="Extremely vibrant and durable printing for polyester and light-colored fabrics."
            />

           
            <ServiceCard
              number="05"
              icon="▱"
              title="Poster & Banner Design"
              description="We create innovative poster and banner designs. Physical banner and poster printing is not currently offered."
            />

            
            <ServiceCard
              number="06"
              icon="◇"
              title="Logo & Branding"
              description="Creative logo and branding designs for businesses, teams, organizations, events, and personal projects."
            />
          </div>
        </div>
      </section>

      
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
              03 — OUR APPROACH
            </p>

            <h2 className="text-5xl font-black leading-tight md:text-7xl">
              YOUR IDEA.
              <br />
              <span className="text-red-500">OUR CREATIVITY.</span>
            </h2>

            <div className="mt-8 space-y-5 text-gray-400">
              <p>
                You don't need to have a perfect design before coming to ZAA.
                You can bring a rough idea, reference image, text, concept,
                or simply tell us what you have in mind.
              </p>

              <p>
                We can help develop that idea into a creative and attractive
                design ready for your printing needs.
              </p>
            </div>
          </div>

         
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10">
            <div className="mb-12 flex h-24 w-24 items-center justify-center rounded-2xl bg-red-600 text-5xl font-black">
              Z
            </div>

            <div className="space-y-3 text-4xl font-black md:text-5xl">
              <p>CREATE<span className="text-red-500">.</span></p>
              <p>DESIGN<span className="text-red-500">.</span></p>
              <p>PRINT<span className="text-red-500">.</span></p>
              <p>WEAR<span className="text-red-500">.</span></p>
            </div>
          </div>
        </div>
      </section>

    
      <section className="bg-white px-6 py-24 text-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-600">
            04 — WHY ZAA
          </p>

          <h2 className="text-5xl font-black md:text-7xl">
            WHY CHOOSE ZAA?
          </h2>

          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2">

            <WhyItem
              number="01"
              title="Innovative Ideas"
              text="We focus on creative concepts and designs that make your project different."
            />

            <WhyItem
              number="02"
              title="Custom Designs"
              text="Designs are created according to your requirements, ideas, style, and purpose."
            />

            <WhyItem
              number="03"
              title="Quality Printing"
              text="We use high-quality materials and advanced printing techniques to ensure durability and vibrancy."
            />

            <WhyItem
              number="04"
              title="Local & Personal"
              text="We are a local creative brand serving customers in Imphal, Manipur."
            />
          </div>
        </div>
      </section>

      
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-zinc-950 p-8 md:p-16">
          <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
            05 — OUR VISION
          </p>

          <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            BUILDING A CREATIVE
            <br />
            <span className="text-gray-500">
              PRINTING BRAND IN MANIPUR.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl leading-8 text-gray-400">
            Our vision is to grow ZAA into a trusted creative printing and
            design brand in Manipur by combining quality printing, innovative
            ideas, and modern design.
          </p>
        </div>
      </section>

      
      <section className="border-t border-white/10 px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">

          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
              VISIT US
            </p>

            <h2 className="text-5xl font-black md:text-7xl">
              COME
              <br />
              VISIT
              <br />
              <span className="text-red-500">ZAA.</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10">
            <div className="mb-6 text-4xl text-red-500">⌖</div>

            <h3 className="text-3xl font-black">ZAA</h3>

            <p className="mt-5 leading-8 text-gray-400">
              Singjamei Kshetri Leikai
              <br />
              Lane 5
              <br />
              Imphal, Manipur
            </p>
          </div>
        </div>
      </section>

      
      <section className="relative overflow-hidden bg-red-600 px-6 py-24 text-center md:px-12">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <p className="text-sm font-bold tracking-[0.4em]">
            READY TO CREATE?
          </p>

          <h2 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            HAVE AN IDEA?
            <br />
            LET'S MAKE IT REAL.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-red-100">
            Tell us what you have in mind and let ZAA turn your idea into
            something you can wear.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-black px-8 py-4 font-bold transition hover:bg-zinc-900"
          >
            Contact ZAA →
          </Link>
        </div>
      </section>

    </main>
  );
}




function ServiceCard({
  number,
  icon,
  title,
  description,
  featured = false,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`group rounded-3xl border p-7 transition duration-300 hover:-translate-y-2 ${
        featured
          ? "border-red-600 bg-red-600"
          : "border-white/10 bg-black hover:border-red-600/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold ${
            featured ? "text-red-100" : "text-red-500"
          }`}
        >
          {number}
        </span>

        <span className="text-3xl">{icon}</span>
      </div>

      <h3 className="mt-10 text-2xl font-black">{title}</h3>

      <p
        className={`mt-4 text-sm leading-7 ${
          featured ? "text-red-100" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}




function WhyItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-t-2 border-black pt-6">
      <span className="text-sm font-bold text-red-600">{number}</span>

      <h3 className="mt-4 text-2xl font-black">{title}</h3>

      <p className="mt-3 max-w-md leading-7 text-gray-600">{text}</p>
    </div>
  );
}

