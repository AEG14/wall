# 🧱 Facebook Wall Clone (2008 Style)

Live Demo: [https://wall-sable.vercel.app/](https://wall-sable.vercel.app/)

## 📄 Overview

This is a simple, old-school Facebook Wall clone built using **Next.js 14 (App Router)**, **React 19**, **Supabase**, **Tailwind CSS**, and **shadcn/ui**. It demonstrates how to build a minimal full-stack app with real-time database updates, clean UI, and zero user authentication — all posts are anonymous.

## ✨ Functionality

- Users can write a short message (maximum 280 characters) and press **Share** to publish it.
- The live feed displays posts in reverse chronological order (newest first).
- Real-time updates are implemented using Supabase Realtime — new posts appear without refreshing the page.
- Posts are saved to a Supabase table (`posts`) which stores:
  - `id`: unique UUID
  - `user_id`: hardcoded/placeholder for now (anonymous)
  - `body`: the message (max 280 characters)
  - `created_at`: timestamp
- The front end is deployed on **Vercel**, and environment variables are managed securely via `.env.local`.

## ✅ Implemented Features

### ✅ Must-Have:

- ✅ Working message input with 280 character limit
- ✅ Share button functionality (disabled when input is empty)
- ✅ Posts feed displayed in reverse chronological order
- ✅ Real-time updates using Supabase channel subscription
- ✅ Posts stored in and retrieved from Supabase
- ✅ Deployed publicly on Vercel

### 🌟 Nice-to-Have:

- ✅ Loading states
- ✅ Error handling on submit and fetch
- ✅ Responsive layout (mobile-friendly)
- ✅ Clean UI with shadcn components and Tailwind
- ✅ Character counter displayed as you type

## 🛠️ Tech Stack

- **Frontend:** React 18, Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Database + Realtime + Storage-ready)
- **Deployment:** Vercel

## ⚠️ Notes

- No authentication is implemented — all posts are marked as **Anonymous**.
- Posts are limited to 280 characters both on the client and in the Supabase schema.
- Only the latest 50 posts are shown in the feed for simplicity and performance.

## 📦 Installation (Optional - Dev Setup)

```bash
git clone https://github.com/AEG14/wall.git
cd wall
npm install
cp .env.local.example .env.local  # add your Supabase keys here
npm run dev
```
