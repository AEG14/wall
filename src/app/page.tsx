"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

// Simple Button styled like shadcn/ui for now
function Button({ children, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className="bg-[#4d6ca8] hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors flex items-center justify-center gap-2"
      {...props}
      disabled={props.disabled || loading}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
      )}
      {children}
    </button>
  );
}

// Skeleton loader for posts
function PostSkeleton() {
  return (
    <div className="bg-white/95 dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700 animate-pulse space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-16 bg-gray-100 dark:bg-gray-600 rounded ml-auto" />
    </div>
  );
}

// Helper for relative time
function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString();
}

interface Post {
  id: string;
  user_id: string | null;
  body: string;
  created_at: string;
}

export default function Home() {
  const [body, setBody] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Theme effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
    setMounted(true);
  }, []);

  // Fetch posts on mount
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setError("Failed to load posts. Please try again.");
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();

    // Subscribe to new posts
    const channel = supabase
      .channel('realtime:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev) => [payload.new as Post, ...prev]);
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Handle post submit
  const handleShare = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    const { error } = await supabase.from("posts").insert({ body });
    setPosting(false);
    if (error) {
      setError("Failed to post. Please try again.");
    } else {
      setBody("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full bg-[#4d6ca8] backdrop-blur border-b border-gray-200 shadow-sm py-4 px-6 flex items-center justify-between">
        <div />
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm select-none transition-colors duration-200 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`}>Freedom Wall</h1>
        <button
          aria-label="Toggle dark mode"
          className="rounded-full p-2 bg-white/20 hover:bg-white/40 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M6.34 6.34l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
          )}
        </button>
      </header>
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Sidebar */}
        <aside className="w-full sm:w-80 bg-white/90 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center gap-4 shadow-md">
          <Image
            src="/file.svg"
            alt="Profile placeholder"
            width={120}
            height={120}
            className="rounded-full border shadow-lg"
          />
          <div className="text-center">
            <h2 className="font-bold text-xl dark:text-white">Aithan Eulysse Gimenez</h2>
            <div className="text-gray-500 dark:text-gray-400">wall</div>
          </div>
          <div className="w-full mt-4">
            <Button className="w-full" disabled>Information</Button>
          </div>
          <div className="mt-6 w-full text-sm text-gray-800 dark:text-gray-200">
            <div className="mb-2">
              <span className="font-semibold">Networks</span><br />Jackson Hole Shooting Experience<br />OneMileClub<br />ATSource<br />SliqPay
            </div>
            <div>
              <span className="font-semibold">Current City</span><br />Cebu, Philippines
            </div>
          </div>
        </aside>
        {/* Main Feed */}
        <main className="flex-1 flex flex-col items-center p-4 sm:p-10 gap-6">
          <div className="w-full max-w-xl bg-white/95 dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-100 dark:border-gray-700">
            <textarea
              ref={inputRef}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#4d6ca8] bg-gray-50 dark:bg-gray-900 dark:text-white"
              rows={3}
              maxLength={280}
              placeholder="What's on your mind?"
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={posting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{280 - body.length} characters remaining</span>
              <Button onClick={handleShare} disabled={!body.trim() || posting} loading={posting}>Share</Button>
            </div>
            {error && <div className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</div>}
          </div>
          <div className="w-full max-w-xl">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 dark:text-red-400">{error}</div>
            ) : (
              <ul className="flex flex-col gap-4">
                {posts.map(post => (
                  <li key={post.id} className="bg-white/95 dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700 transition-all duration-300 animate-fade-in">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 dark:text-white">Anonymous</span>
                      <span className="text-xs text-gray-400 dark:text-gray-300">· {getRelativeTime(post.created_at)}</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-100 mb-2 whitespace-pre-line">{post.body}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-300 text-right">{new Date(post.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease;
        }
        html.dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}
