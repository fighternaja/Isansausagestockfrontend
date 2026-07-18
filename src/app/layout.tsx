import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { AuthGuard } from '@/components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Tracker — ระบบจัดการสต็อกสินค้า',
  description: 'ระบบจัดการสต็อกสินค้าสำหรับใช้ภายใน',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-watermark`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="container mx-auto flex-1 px-4 py-8">
                <AuthGuard>{children}</AuthGuard>
              </main>
            </div>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
