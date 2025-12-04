import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <h2 className="text-4xl font-bold text-emerald-500">Not Found</h2>
            <p className="text-zinc-400">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                Return Home
            </Link>
        </div>
    )
}
