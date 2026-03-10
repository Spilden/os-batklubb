import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white shadow-lg py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
        <Image src="/obk_logo.svg" alt="Os Båtklubb" width={80} height={40} />
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Os Båtklubb</p>
      </div>
    </footer>
  )
}
