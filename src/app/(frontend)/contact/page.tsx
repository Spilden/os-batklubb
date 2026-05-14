import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="rounded-xl bg-ocean p-4">
        <h1 className="text-surface text-2xl font-display font-bold text-center">Kontakt oss</h1>
      </div>
      <div className="p-6 bg-surface rounded-xl shadow-lg max-w-xl mx-auto w-full">
        <ContactForm />
      </div>
    </div>
  )
}
