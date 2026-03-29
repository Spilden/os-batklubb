import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <div className="bg-sage rounded-xl shadow-lg w-full">
      <div className="rounded-t-xl bg-ocean p-4">
        <h1 className="text-text text-2xl font-bold text-center">Kontakt oss</h1>
      </div>
      <div className="p-6">
        <ContactForm />
      </div>
    </div>
  )
}
