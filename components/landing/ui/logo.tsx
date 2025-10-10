import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link className="inline-flex" href="/" aria-label="Svalbard Intelligence">
      <Image 
        src="/logo.png" 
        alt="Svalbard Logo" 
        width={100} 
        height={40}
        className="w-[100px] h-auto"
      />
    </Link>
  )
}
