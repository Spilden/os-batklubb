import type { Partner } from '@/payload-types'
import Image from 'next/image'
import { imageGuard } from '@/utils/ImageGuard'

type PartnerCardProps = {
  partner: Partner
}

export default function Partner({ partner }: PartnerCardProps) {
  const partnerLogo = imageGuard(partner.logo)

  return (
    <div key={partner.id}>
      <h2>{partner.name}</h2>
      {partnerLogo?.url && (
        <Image
          src={partnerLogo.url}
          alt={partnerLogo.alt ?? partner.name}
          width={partnerLogo.width}
          height={partnerLogo.height}
          className="object-contain"
        />
      )}
    </div>
  )
}
