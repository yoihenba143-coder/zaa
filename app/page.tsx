"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const products = [
  {
    name: "Classic Custom T-Shirt",
    category: "CUSTOM T-SHIRT",
    price: "₹399",
    image: "/image/tshirt.jpg",
  },
  {
    name: "DTF Printed T-Shirt",
    category: "DTF PRINTING",
    price: "₹499",
    image: "/image/dtf.jpg",
  },
  {
    name: "Screen Printed T-Shirt",
    category: "SCREEN PRINTING",
    price: "₹349",
    image: "/image/screen.jpg",
  },
  {
    name: "Oversized Custom Tee",
    category: "OVERSIZED",
    price: "₹599",
    image: "/image/oversized.jpg",
  },
  {
    name: "ZAA Signature Collection",
    category: "Acid wash T-shirt Premium",
    price: "₹799",
    image: "/image/sign.jpg",
  },
];

import { getAllProducts } from "@/app/lib/products";

export default function HomePage() {
  const [productList, setProductList] = useState(products);
  const [currentProduct, setCurrentProduct] = useState(0);

  const loadProducts = () => {
    const all = getAllProducts();
    if (all && all.length > 0) {
      const formatted = all.map((p) => ({
        name: p.name,
        category: p.category || "T-SHIRT",
        price: `₹${p.price}`,
        image: p.image || "/image/zaa.jpg",
      }));
      setProductList(formatted);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();
    window.addEventListener("zaa-products-updated", handleUpdate);
    return () => {
      window.removeEventListener("zaa-products-updated", handleUpdate);
    };
  }, []);
  
  useEffect(() => {
    if (productList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % productList.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [productList.length]);

  const nextProduct = () => {
    if (productList.length === 0) return;
    setCurrentProduct((prev) => (prev + 1) % productList.length);
  };

  const previousProduct = () => {
    if (productList.length === 0) return;
    setCurrentProduct(
      (prev) => (prev - 1 + productList.length) % productList.length
    );
  };

  const activeProduct = productList[currentProduct] || productList[0] || products[0];

  return (
    <main className="min-h-screen bg-black text-white">

      

      <section className="relative min-h-[90vh] overflow-hidden">

        <Image
          src="/image/zaa.jpg"
          alt="ZAA T-shirt Printing and Design"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-6 py-20 md:px-12 lg:px-20">

          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-2 backdrop-blur">

              <span className="h-2 w-2 rounded-full bg-red-600" />

              <span className="text-xs font-bold tracking-[0.3em] text-gray-300">
                IMPHAL • MANIPUR
              </span>

            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-7xl md:text-8xl">

              CUSTOM
              <br />

              <span className="bg-gradient-to-r from-red-600 via-red-500 to-white bg-clip-text text-transparent">
                PRINTING
              </span>

            </h1>

            <p className="mt-8 max-w-xl text-base text-gray-400 sm:text-lg">

              High quality DTF printing, screen printing and custom apparel
              made in Imphal. Premium cotton fabrics engineered for durability,
              streetwear aesthetics and vibrant long-lasting prints.

            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/products"
                className="rounded-full bg-red-600 px-8 py-4 font-bold tracking-wide transition hover:bg-red-700"
              >
                EXPLORE COLLECTION →
              </Link>

              <Link
                href="/contact"
                className="rounded-full border border-white/20 px-8 py-4 font-bold tracking-wide transition hover:bg-white hover:text-black"
              >
                CUSTOM INQUIRY
              </Link>

            </div>

          </div>

        </div>

        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-12 lg:px-20">

          <div className="mx-auto flex max-w-7xl items-center justify-between">

            <p className="text-xs font-bold tracking-[0.3em] text-gray-500">
              DESIGN • PRINT • WEAR
            </p>

            <p className="text-xs text-gray-500">
              SCROLL TO EXPLORE ↓
            </p>

          </div>

        </div>

      </section>


      

      <section className="border-t border-white/10 bg-zinc-950 px-6 py-28 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          

          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
                FEATURED DROPS
              </p>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                OUR COLLECTION
              </h2>

            </div>

            <Link
              href="/products"
              className="text-sm font-bold tracking-widest text-red-500 hover:text-red-400"
            >
              VIEW ALL PRODUCTS →
            </Link>

          </div>


         

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">

            <div className="grid min-h-[420px] md:grid-cols-2">

              

              <div className="relative h-[350px] md:h-[500px]">

                <Image
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              </div>


              

              <div className="flex flex-col justify-center p-8 md:p-14">

                <p className="text-xs font-bold tracking-[0.35em] text-red-500">

                  {activeProduct.category}

                </p>

                <h3 className="mt-5 text-4xl font-black md:text-6xl">

                  {activeProduct.name}

                </h3>

                <p className="mt-6 max-w-md leading-7 text-gray-500">

                  Premium custom printing made for your style.
                  Choose your design, size and color and create
                  something unique with ZAA.

                </p>


                

                <div className="mt-8 flex flex-wrap items-center gap-6">

                  <span className="text-3xl font-black">

                    {activeProduct.price}

                  </span>

                  <Link
                    href="/products"
                    className="rounded-full bg-red-600 px-7 py-3 font-bold transition hover:bg-red-500"
                  >
                    VIEW PRODUCT →
                  </Link>

                </div>

              </div>

            </div>


            

            <button
              onClick={previousProduct}
              aria-label="Previous product"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white backdrop-blur transition hover:bg-red-600"
            >
              ←
            </button>


           

            <button
              onClick={nextProduct}
              aria-label="Next product"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white backdrop-blur transition hover:bg-red-600"
            >
              →
            </button>


           

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">

              {products.map((_, index) => (

                <button
                  key={index}
                  onClick={() => setCurrentProduct(index)}
                  aria-label={`Product ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    currentProduct === index
                      ? "w-8 bg-red-600"
                      : "w-2 bg-white/40"
                  }`}
                />

              ))}

            </div>

          </div>


          

          <Link
            href="/products"
            className="mt-6 inline-block text-sm font-bold text-gray-400 hover:text-white md:hidden"
          >
            VIEW ALL PRODUCTS →
          </Link>

        </div>

      </section>


      

      <section className="border-b border-white/10 px-6 py-24 md:px-12 lg:px-20">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-end">

          <div>

            <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
              ZAA — CREATIVE PRINTING
            </p>

            <h2 className="text-4xl font-black leading-tight md:text-6xl">

              YOUR IDEA.

              <br />

              <span className="text-gray-500">
                YOUR STYLE.
              </span>

            </h2>

          </div>

          <p className="max-w-xl text-lg leading-8 text-gray-400">

            ZAA helps turn your ideas into wearable designs. Whether you
            have a complete design or just an idea, we can help create
            something unique for you.

          </p>

        </div>

      </section>


      

      <section className="bg-zinc-950 px-6 py-24 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
                WHAT WE DO
              </p>

              <h2 className="text-5xl font-black md:text-7xl">
                SERVICES
              </h2>

            </div>

            <p className="max-w-md text-gray-500">

              Printing and creative design solutions for individuals,
              businesses, teams, events, and organizations.

            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <Service
              number="01"
              icon="🖨"
              title="DTF Printing"
              text="Detailed and colorful custom printing for T-shirts and apparel."
              featured
            />

            <Service
              number="02"
              icon="🎨"
              title="Screen Printing"
              text="Reliable screen printing for suitable designs and bulk orders."
            />

            <Service
              number="03"
              icon="✎"
              title="Custom Design"
              text="Creative designs developed from your ideas, references, or concepts."
            />

            <Service
              number="04"
              icon="👕"
              title="Sublimation Printing"
              text="Extremely vibrant and durable printing for polyester and light-colored fabrics."
            />

          </div>

        </div>

      </section>


      

      <section className="px-6 py-24 md:px-12 lg:px-20">

        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
              HAVE AN IDEA?
            </p>

            <h2 className="text-5xl font-black leading-tight md:text-7xl">

              DON'T HAVE
              <br />

              A DESIGN?
              <br />

              <span className="text-red-600">
                NO PROBLEM.
              </span>

            </h2>

            <p className="mt-8 max-w-xl leading-8 text-gray-400">

              You can bring us a rough idea, reference image, text,
              concept, or simply explain what you want. We can help
              develop your idea into a creative design.

            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3 font-bold text-black transition hover:bg-red-600 hover:text-white"
            >
              Start Your Design →
            </Link>

          </div>


          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-10">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

            <div className="relative">

              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-600 text-5xl font-black">
                Z
              </div>

              <div className="mt-14 space-y-3 text-4xl font-black md:text-5xl">

                <p>
                  CREATE<span className="text-red-600">.</span>
                </p>

                <p>
                  DESIGN<span className="text-red-600">.</span>
                </p>

                <p>
                  PRINT<span className="text-red-600">.</span>
                </p>

                <p>
                  WEAR<span className="text-red-600">.</span>
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


    

      <section className="bg-white px-6 py-24 text-black md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-600">
                OUR WORK
              </p>

              <h2 className="text-5xl font-black md:text-7xl">

                MADE TO
                <br />

                STAND OUT.

              </h2>

            </div>

            <Link
              href="/products"
              className="font-bold underline underline-offset-8"
            >
              View All Designs →
            </Link>

          </div>


          <div className="mt-14 grid gap-5 md:grid-cols-3">

            <div className="group aspect-square overflow-hidden rounded-3xl bg-gray-100">

              <div className="flex h-full items-center justify-center transition duration-500 group-hover:scale-105">

                <span className="text-7xl font-black">

                  <span className="text-red-600">
                    Z
                  </span>

                  AA

                </span>

              </div>

            </div>


            <div className="group aspect-square overflow-hidden rounded-3xl bg-black text-white">

              <div className="flex h-full flex-col items-center justify-center transition duration-500 group-hover:scale-105">

                <span className="text-6xl font-black">
                  CUSTOM
                </span>

                <span className="mt-2 text-sm tracking-[0.4em] text-gray-500">
                  PRINTING
                </span>

              </div>

            </div>


            <div className="group aspect-square overflow-hidden rounded-3xl bg-red-600 text-white">

              <div className="flex h-full flex-col items-center justify-center transition duration-500 group-hover:scale-105">

                <span className="text-7xl font-black">
                  YOUR
                </span>

                <span className="text-7xl font-black">
                  STYLE
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


    

      <section className="px-6 py-24 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
            WHY ZAA
          </p>

          <h2 className="text-5xl font-black md:text-7xl">

            MADE FOR
            <br />

            <span className="text-gray-600">
              YOUR IDEAS.
            </span>

          </h2>


          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            <Why
              number="01"
              title="Creative"
              text="We focus on innovative and attractive design ideas."
            />

            <Why
              number="02"
              title="Custom"
              text="Your design can be created according to your own style."
            />

            <Why
              number="03"
              title="Quality"
              text="We focus on clean and professional printing results."
            />

            <Why
              number="04"
              title="Local"
              text="A creative printing brand based in Imphal, Manipur."
            />

          </div>

        </div>

      </section>


  

      <section className="bg-zinc-950 px-6 py-24 md:px-12 lg:px-20">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">

          <div>

            <p className="mb-5 text-xs font-bold tracking-[0.4em] text-red-500">
              FIND US
            </p>

            <h2 className="text-5xl font-black md:text-7xl">

              VISIT
              <br />

              <span className="text-red-600">
                ZAA.
              </span>

            </h2>

          </div>


          <div className="rounded-3xl border border-white/10 bg-black p-10">

            <div className="mb-6 text-4xl text-red-600">
              ⌖
            </div>

            <h3 className="text-3xl font-black">
              ZAA
            </h3>

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

      <section className="relative overflow-hidden bg-red-600 px-6 py-28 text-center">

        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">

          <p className="text-sm font-bold tracking-[0.4em]">
            START SOMETHING DIFFERENT
          </p>

          <h2 className="mt-6 text-5xl font-black leading-tight md:text-7xl">

            HAVE AN IDEA?
            <br />

            LET'S PRINT IT.

          </h2>

          <p className="mx-auto mt-6 max-w-xl text-red-100">

            Tell us your idea and let ZAA help turn it into a
            creative design you can wear.

          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Link
              href="/contact"
              className="rounded-full bg-black px-8 py-4 font-bold transition hover:bg-zinc-900"
            >
              Contact ZAA →
            </Link>

            <Link
              href="/about"
              className="rounded-full border border-white px-8 py-4 font-bold transition hover:bg-white hover:text-red-600"
            >
              Learn More
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

function Service({
  number,
  icon,
  title,
  text,
  featured = false,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-7 transition duration-300 hover:-translate-y-2 ${
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

        <span className="text-3xl">
          {icon}
        </span>

      </div>


      <h3 className="mt-10 text-2xl font-black">
        {title}
      </h3>


      <p
        className={`mt-4 text-sm leading-7 ${
          featured ? "text-red-100" : "text-gray-500"
        }`}
      >
        {text}
      </p>

    </div>
  );
}


function Why({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-t-2 border-white/20 pt-6">

      <span className="text-sm font-bold text-red-500">
        {number}
      </span>

      <h3 className="mt-5 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-500">
        {text}
      </p>

    </div>
  );
}