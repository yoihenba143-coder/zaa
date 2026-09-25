
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("zaa_user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser: User = JSON.parse(savedUser);

        setUser(parsedUser);
        setName(parsedUser.name);
      } catch {
        localStorage.removeItem("zaa_user");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  
  const logout = () => {
    localStorage.removeItem("zaa_user");

    window.dispatchEvent(new Event("zaa-user-updated"));

    router.push("/");
  };

 
  const saveProfile = () => {
    if (!user || !name.trim()) return;

    const updatedUser: User = {
      name: name.trim(),
      email: user.email,
    };

    localStorage.setItem(
      "zaa_user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setName(updatedUser.name);
    setEditing(false);

    window.dispatchEvent(new Event("zaa-user-updated"));
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-red-600" />

          <p className="mt-5 text-sm text-zinc-500">
            Loading ZAA profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const initial =
    user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-24 text-white sm:px-6">

      
      <div className="pointer-events-none fixed left-0 top-20 h-80 w-80 rounded-full bg-red-600/10 blur-[120px]" />

      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-5xl">

        
        <div className="mb-8 flex items-center justify-between">

          <button
            onClick={() => router.push("/")}
            className="
              flex items-center gap-2
              rounded-xl
              border border-zinc-800
              bg-zinc-950
              px-4 py-2.5
              text-sm font-semibold
              text-zinc-400
              transition
              hover:border-zinc-700
              hover:bg-zinc-900
              hover:text-white
            "
          >
            ← Home
          </button>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-xs font-medium text-zinc-500">
              Account Active
            </span>

          </div>

        </div>

        

        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl">

          
          <div className="relative h-48 overflow-hidden sm:h-60">

            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-black" />

            
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full border-[60px] border-white/20" />

              <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border-[50px] border-black/30" />
            </div>

            
            <div className="absolute right-6 top-6 select-none text-7xl font-black tracking-tighter text-white/10 sm:text-9xl">
              ZAA
            </div>

            
            <div className="absolute bottom-6 left-6 sm:left-8">

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                ZERO AUTHORITY ARTISTS
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Your Profile
              </h1>

            </div>
          </div>

          
          <div className="relative px-6 pb-8 sm:px-8">

            
            <div className="-mt-16 flex items-end justify-between">

              <div
                className="
                  relative
                  flex
                  h-32
                  w-32
                  items-center
                  justify-center
                  rounded-full
                  border-[6px]
                  border-zinc-950
                  bg-gradient-to-br
                  from-red-500
                  via-red-600
                  to-orange-500
                  text-5xl
                  font-black
                  text-white
                  shadow-2xl
                  sm:h-36
                  sm:w-36
                  sm:text-6xl
                "
              >
                {initial}

                
                <span
                  className="
                    absolute
                    bottom-2
                    right-2
                    h-5
                    w-5
                    rounded-full
                    border-4
                    border-zinc-950
                    bg-green-500
                  "
                />
              </div>

              
              <button
                onClick={() => setEditing(!editing)}
                className="
                  rounded-xl
                  border
                  border-zinc-700
                  bg-zinc-900
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:border-red-600
                  hover:bg-red-600
                "
              >
                {editing ? "Cancel" : "✎ Edit Profile"}
              </button>

            </div>

           
            <div className="mt-6">

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {user.name}
                </h2>

                <span
                  className="
                    rounded-full
                    border border-red-900/50
                    bg-red-950/50
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-red-400
                  "
                >
                  Happy Customer
                </span>

              </div>

              <p className="mt-2 text-zinc-500">
                {user.email}
              </p>

            </div>

            
            <div className="mt-8 grid grid-cols-3 gap-3">

              <div className="rounded-2xl border border-zinc-800 bg-black p-4 text-center">
                <p className="text-2xl font-black text-white">
                  01
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Account
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-4 text-center">
                <p className="text-2xl font-black text-white">
                  ZAA
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Community
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-4 text-center">
                <p className="text-2xl font-black text-green-500">
                  ●
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Status
                </p>
              </div>

            </div>

          </div>
        </section>

        

        {editing && (
          <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                Account
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Edit Profile
              </h3>

            </div>

            <div className="space-y-5">

              
              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-zinc-300"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-800
                    bg-black
                    px-4
                    py-3.5
                    text-white
                    outline-none
                    transition
                    placeholder:text-zinc-700
                    focus:border-red-600
                    focus:ring-2
                    focus:ring-red-600/20
                  "
                />

              </div>

              
              <div>

                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Email Address
                </label>

                <div
                  className="
                    rounded-xl
                    border
                    border-zinc-900
                    bg-zinc-900/50
                    px-4
                    py-3.5
                    text-zinc-500
                  "
                >
                  {user.email}
                </div>

                <p className="mt-2 text-xs text-zinc-700">
                  Your email address cannot be changed here.
                </p>

              </div>

              
              <button
                onClick={saveProfile}
                className="
                  w-full
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3.5
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                  active:scale-[0.99]
                "
              >
                Save Changes
              </button>

            </div>

          </section>
        )}

        

        <section className="mt-6">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Manage
            </p>

            <h3 className="mt-1 text-2xl font-black">
              Account Settings
            </h3>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            
            <button
              onClick={() => setEditing(true)}
              className="
                group
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-red-900
                hover:bg-zinc-900
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-950/40
                    text-xl
                    transition
                    group-hover:bg-red-600
                  "
                >
                  👤
                </div>

                <span className="text-zinc-700 transition group-hover:text-red-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 font-bold">
                Personal Information
              </h4>

              <p className="mt-1 text-sm text-zinc-600">
                Update your name and account details.
              </p>

            </button>

            {/* Security */}
            <button
              className="
                group
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-red-900
                hover:bg-zinc-900
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-zinc-900
                    text-xl
                    transition
                    group-hover:bg-red-600
                  "
                >
                  🔒
                </div>

                <span className="text-zinc-700 transition group-hover:text-red-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 font-bold">
                Security
              </h4>

              <p className="mt-1 text-sm text-zinc-600">
                Manage password and account security.
              </p>

            </button>

            
            <button
              className="
                group
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-red-900
                hover:bg-zinc-900
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-zinc-900
                    text-xl
                    transition
                    group-hover:bg-red-600
                  "
                >
                  ⚙️
                </div>

                <span className="text-zinc-700 transition group-hover:text-red-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 font-bold">
                Preferences
              </h4>

              <p className="mt-1 text-sm text-zinc-600">
                Customize your ZAA experience.
              </p>

            </button>

            
            <button
              onClick={logout}
              className="
                group
                rounded-2xl
                border
                border-red-950
                bg-red-950/10
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-red-800
                hover:bg-red-950/30
              "
            >

              <div className="flex items-center justify-between">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-950/50
                    text-xl
                    transition
                    group-hover:bg-red-600
                  "
                >
                  ↪
                </div>

                <span className="text-red-900 transition group-hover:text-red-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 font-bold text-red-500">
                Logout
              </h4>

              <p className="mt-1 text-sm text-red-950">
                Sign out from your ZAA account.
              </p>

            </button>

          </div>
        </section>

        
        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center">

          <div className="text-xl font-black">
            <span className="text-red-600">Z</span>
            <span className="text-white">AA</span>
          </div>

          <p className="mt-2 text-xs text-zinc-700">
            ZERO AUTHORITY ARTISTS
          </p>

          <p className="mt-4 text-xs text-zinc-800">
            © 2026 ZAA. All rights reserved.
          </p>

        </footer>

      </div>
    </main>
  );
}
