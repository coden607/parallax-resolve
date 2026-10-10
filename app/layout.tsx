import './globals.css'; import Link from 'next/link';
export const metadata={title:'Parallax Resolve',description:'Understand first. Resolve wisely.',manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><nav><b>Parallax Resolve</b><Link href="/analyze">Analyze</Link><Link href="/dashboard">Dashboard</Link><Link href="/check-in">Check-in</Link><Link href="/pricing">Pricing</Link><Link href="/settings">Settings</Link></nav>{children}</body></html>}
