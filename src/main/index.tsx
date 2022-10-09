import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { configure } from "mobx"
import { createRoot } from "react-dom/client"
import { App } from "./components/App/App"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})

configure({
  enforceActions: "never",
})

const root = createRoot(document.querySelector("#root")!)
root.render(<App />)
