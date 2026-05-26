import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Eyebrow } from "@/components/site/eyebrow"

export function FindUs() {
  return (
    <section id="find-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#141416]">
      <div className="max-w-7xl mx-auto">
        <Eyebrow>Location</Eyebrow>
        <h2 className="text-section font-heading text-white mb-10">Find Us</h2>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Address</p>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  Sridharan Table Tennis Academy<br />
                  Chennai, Tamil Nadu 600001<br />
                  India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Phone</p>
                <p className="text-[#A1A1AA] text-sm">Contact via academy office</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Email</p>
                <p className="text-[#A1A1AA] text-sm">info@srittacademy.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Training Hours</p>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  Monday – Saturday: 6:00 AM – 9:00 PM<br />
                  Sunday: 7:00 AM – 1:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-[#27272A] shadow-xl aspect-video lg:aspect-auto lg:h-80">
            <iframe
              src="https://maps.google.com/maps?q=Chennai+Tamil+Nadu&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Academy location"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
