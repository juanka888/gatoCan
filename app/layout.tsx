export const metadata = {
  title: 'GatoCan',
  description: 'Web de GatoCan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
