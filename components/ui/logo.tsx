import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  withLink?: boolean
}

export default function Logo({ withLink = true }: LogoProps) {
  const imageContent = (
    <Image
      src="/logoOver.png"
      alt="CoreGuard Logo"
      width={32}
      height={32}
      className="object-contain"
    />
  )

  if (withLink) {
    return (
      <Link className="block" href="/">
        {imageContent}
      </Link>
    )
  }

  return imageContent
}
