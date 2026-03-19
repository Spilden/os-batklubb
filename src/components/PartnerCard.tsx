import type { Partner } from '@/payload-types'
import Image from 'next/image'
import { imageGuard } from '@/utils/ImageGuard'

type PartnerCardProps = {
  partner: Partner
}

export default function Partner({ partner }: PartnerCardProps) {
  const partnerLogo = imageGuard(partner.logo)

  return (
    <div className="flex flex-col items-center gap-2 bg-surface rounded-lg p-4 shadow-lg w-32">
      {partnerLogo?.url && (
        <Image
          src={partnerLogo.url}
          alt={partnerLogo.alt ?? partner.name}
          width={partnerLogo.width}
          height={partnerLogo.height}
          className="object-cover w-16 h-16 rounded-lg"
        />
      )}
      <p className="text-text-muted text-xs text-center font-medium">{partner.name}</p>
    </div>
  )
}
