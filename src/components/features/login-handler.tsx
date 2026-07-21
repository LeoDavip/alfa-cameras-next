"use client"

import { useEffect } from "react"

export default function LoginHandler() {
  useEffect(() => {
    const form = document.getElementById("login-form") as HTMLFormElement | null
    if (!form) return

    const handler = async (e: SubmitEvent) => {
      e.preventDefault()
      const btn = form.querySelector("button") as HTMLButtonElement | null
      const oldErr = document.getElementById("login-error")
      if (oldErr) oldErr.remove()
      if (btn) {
        btn.disabled = true
        btn.textContent = "Entrando..."
      }

      try {
        const formData = new FormData(form)
        const params = new URLSearchParams()
        formData.forEach((value, key) => {
          if (typeof value === "string") params.append(key, value)
        })
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        })
        if (res.ok) {
          const data = await res.json()
          document.cookie = "token=" + data.token + "; path=/; max-age=900; SameSite=Lax"
          window.location.href = "/dashboard"
        } else {
          const data = await res.json()
          const p = document.createElement("p")
          p.id = "login-error"
          p.className = "text-sm text-red-500"
          p.textContent = data.error || "Erro ao fazer login"
          btn?.parentNode?.insertBefore(p, btn!)
        }
      } catch {
        const p = document.createElement("p")
        p.id = "login-error"
        p.className = "text-sm text-red-500"
        p.textContent = "Erro de conexão"
        btn?.parentNode?.insertBefore(p, btn!)
      } finally {
        if (btn) {
          btn.disabled = false
          btn.textContent = "Entrar"
        }
      }
    }

    form.addEventListener("submit", handler)
    return () => form.removeEventListener("submit", handler)
  }, [])

  return null
}
