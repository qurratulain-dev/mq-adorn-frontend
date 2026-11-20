import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp.js'
import { WhatsAppIcon } from './Icons.jsx'

// Site-wide click-to-chat button. Uses the shared WhatsApp constant.
export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp at ${WHATSAPP_DISPLAY}`}
      className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center bg-gold text-white shadow-[0_12px_30px_-12px_rgba(26,26,26,0.6)] transition hover:bg-gold-dark motion-reduce:transition-none sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon width={26} height={26} />
    </a>
  )
}
