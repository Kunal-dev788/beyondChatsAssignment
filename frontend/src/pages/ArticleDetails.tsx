"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import he from "he"
import DOMPurify from "dompurify"
import { API_URL } from "../config"

type Article = {
  _id: string
  title: string
  content: string
  type: "original" | "updated"
  references?: string[]
  createdAt?: string
}

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`${API_URL}/articles/${id}`)
        const json = await res.json()
        setArticle(json.data || json)
      } catch (err) {
        console.error("Error loading article:", err)
      }
    }

    fetchArticle()
  }, [id])

  if (!article)
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <p className="text-[#b4b9c8] text-sm">Loading article…</p>
      </div>
    )

  // remove duplicate references
  const lower = article.content?.toLowerCase() || ""
  const filteredRefs = article.references?.filter((r) => !lower.includes(r.toLowerCase())) || []

  // detect rewritten markdown
  const isMarkdown = article.type === "updated"

  // decode + sanitize HTML for original scraped articles
  let decodedHtml = he.decode(article.content || "")
  // UI fix: remove trailing number-only lines for original (HTML) articles
  if (!isMarkdown) {
    decodedHtml = decodedHtml.replace(/(?:<br\s*\/?>|\n)*((?:\s*\d+\s*){1,5})$/gim, "")
    decodedHtml = decodedHtml.replace(/(?:\n|<br\s*\/?>)+(?:\d+\s*)+$/gim, "")
  }
  const cleanHtml = DOMPurify.sanitize(decodedHtml, {
    USE_PROFILES: { html: true },
  })

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <header className="border-b border-[#2a3142] bg-[#0f1420]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#10b981] hover:text-[#059669] text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to articles
          </Link>
        </div>
      </header>

      <main className="flex items-start justify-center pt-8 pb-24 px-6 min-h-screen">
        <div className="w-full max-w-4xl">
          <article className="bg-[#1a1f3a] border border-[#2a3142] rounded-xl p-8 md:p-12 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-[#f0f1f3] leading-tight mb-6 tracking-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-[#2a3142]">
              <span
                className={`capitalize px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                  article.type === "updated"
                    ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                    : "bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30"
                }`}
              >
                {article.type === "updated" ? "Enhanced" : "Original"}
              </span>
              <span className="text-[#b4b9c8] text-sm font-normal">
                {article.createdAt
                  ? new Date(article.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date not available"}
              </span>
            </div>

            <article
              className="prose prose-invert max-w-none mt-8 text-[#f0f1f3]
              prose-headings:font-semibold prose-headings:text-[#f0f1f3] prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:font-bold
              prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-semibold
              prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold
              prose-p:leading-8 prose-p:my-5 prose-p:text-base prose-p:font-normal
              prose-li:leading-7 prose-li:text-base prose-ul:pl-6 prose-ul:my-4
              prose-img:rounded-lg prose-img:border prose-img:border-[#2a3142] prose-img:my-6
              prose-blockquote:border-l-4 prose-blockquote:border-[#10b981] 
              prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-[#b4b9c8] prose-blockquote:my-5
              prose-blockquote:bg-[#0f1420] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded
              prose-code:bg-[#0f1420] prose-code:text-[#60a5fa] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-[#0f1420] prose-pre:border prose-pre:border-[#2a3142] prose-pre:rounded-lg prose-pre:overflow-auto
              prose-pre:p-4 prose-pre:my-6
              prose-a:text-[#10b981] prose-a:hover:text-[#059669] prose-a:no-underline prose-a:font-medium hover:prose-a:underline"
            >
              {isMarkdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{article.content}</ReactMarkdown>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
              )}
            </article>

            {filteredRefs.length > 0 && (
              <footer className="mt-12 border-t border-[#2a3142] pt-8">
                <h3 className="text-lg font-semibold text-[#f0f1f3] mb-5 tracking-tight uppercase">
                  References
                </h3>
                <ul className="space-y-3">
                  {filteredRefs.map((ref, i) => (
                    <li key={i}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#10b981] hover:text-[#059669] break-all text-sm transition-colors hover:underline font-normal"
                      >
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </footer>
            )}
          </article>
        </div>
      </main>
    </div>
  )
}
