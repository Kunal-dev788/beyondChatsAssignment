"use client"

import { useEffect, useState } from "react"
import { getArticles } from "../api/articles"
import type { Article } from "../types"
import { Link } from "react-router-dom"

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    getArticles().then(setArticles)
  }, [])

  function formatPreview(text = "") {
    return text
      .replace(/<[^>]+>/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*|__/g, "")
      .replace(/\*|_/g, "")
      .replace(/`+/g, "")
      .replace(/\[(.*?)\]$$.*?$$/g, "$1")
      .replace(/^\s*[-*+]\s*/gm, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <header className="border-b border-[#2a3142] bg-[#0f1420]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              <span className="text-[#f0f1f3]">Beyond</span>
              <span className="text-[#10b981] ml-3">Blogs</span>
            </h1>
            <p className="text-[#b4b9c8] text-base mt-2 font-normal">Explore curated articles and insights</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {articles.map((a) => {
            const preview = formatPreview(a.content).slice(0, 200)

            return (
              <Link key={a._id} to={`/article/${a._id}`} className="group">
                <div className="bg-[#1a1f3a] border border-[#2a3142] rounded-xl p-8 hover:border-[#10b981]/30 hover:bg-[#242a43] transition-all duration-300 h-full">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h2 className="text-2xl font-semibold text-[#f0f1f3] group-hover:text-[#10b981] transition-colors leading-snug">
                      {a.title}
                    </h2>
                    <svg
                      className="w-5 h-5 text-[#10b981] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full tracking-wide ${
                        a.type === "updated"
                          ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                          : "bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30"
                      }`}
                    >
                      {a.type === "updated" ? "Enhanced" : "Original"}
                    </span>
                  </div>

                  <p className="text-[#b4b9c8] leading-relaxed text-base line-clamp-3 font-normal">
                    {preview || "No preview available"}…
                  </p>

                  <div className="flex items-center gap-2 mt-6 text-[#10b981] text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Read article</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {articles.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[#b4b9c8] text-base">Loading articles…</p>
          </div>
        )}
      </main>
    </div>
  )
}
