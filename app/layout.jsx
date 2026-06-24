import './globals.css'

export const metadata = {
  title: 'Exasol Repo Explorer',
  description:
    'Live explorer for all public repositories of the exasol and exasol-labs GitHub organizations.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  )
}
