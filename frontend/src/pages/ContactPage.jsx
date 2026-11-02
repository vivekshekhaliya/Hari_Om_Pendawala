import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ContactPage() {
  const { shop } = useShop();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Bulk / Wedding Order',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-purple-950">
            Contact &amp; Visit Us
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Have an inquiry about wedding gifting, bulk festival sweets, or delivery service? We are always here to serve you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-[#393186] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src={shop.logo_url || '/assets/logo.jpeg'}
                  alt="Hari Om Pendawala Logo"
                  className="h-16 w-auto object-contain bg-white p-1 rounded-xl shadow-md border border-amber-300"
                />
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                    Hari Om Pendawala
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold uppercase">
                    Sweet &amp; Namkeen – Amreliwala
                  </p>
                  {/* Google Rating */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-bold text-xs text-amber-400">4.8</span>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <span className="text-[11px] text-purple-200">(58 Google reviews)</span>
                  </div>
                </div>
              </div>

              {/* Service Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                  ✓ In-store shopping
                </span>
                <span className="text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                  ✓ In-store pick-up
                </span>
                <span className="text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                  ✓ Fast Delivery
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-purple-100 pt-2 border-t border-purple-800/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-medium">Store Address:</strong>
                    <span className="leading-relaxed">
                      Shop Number 8, Floor 2, Sun South Park, near SOBO Center Road, South Bopal, Bopal, Ahmedabad, Gujarat 380057
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-medium">Operating Hours:</strong>
                    <span>{shop.opening_hours || 'Monday – Sunday: 8:00 AM – 10:30 PM (Open 365 Days)'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-medium">Call / WhatsApp:</strong>
                    <a href={`tel:${shop.phone || '+919712247979'}`} className="hover:text-amber-300 text-white font-bold block">
                      {shop.phone || '+91 97122 47979'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-medium">Email:</strong>
                    <span>{shop.email || 'hariompendawala.bopal@gmail.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-800">
              <a
                href="https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4716632,17z/data=!4m6!3m5!1s0x395e9bb5eccf742b:0x4ba5ef69ebdf83d9!8m2!3d23.0161268!4d72.4737324!16s%2Fg%2F11y5sydydr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold py-3 rounded-2xl text-xs transition shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                <span>Open in Google Maps (Driving Directions)</span>
              </a>
            </div>
          </div>

          {/* Inquiry / Bulk Order Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-purple-950 mb-1">
              Bulk Orders &amp; Inquiries
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Looking for special packaging for weddings, corporate gifting, or events? Send us a quick note.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-serif font-bold text-lg text-green-950">Inquiry Received!</h4>
                <p className="text-xs text-green-700 max-w-sm mx-auto">
                  Thank you! Our shop team will call you back shortly to discuss pricing and custom sweet packing.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-green-900 underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Bhavesh Shah"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 9898012345"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Inquiry Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Bulk / Wedding Order">Bulk / Wedding Sweet Hampers</option>
                    <option value="Corporate Diwali Gifting">Corporate Festive Gifting</option>
                    <option value="Delivery Inquiry">Delivery Area / Service Question</option>
                    <option value="Feedback">Product Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Message / Requirements</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us what sweets you need, approx quantity, and preferred date..."
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-900 hover:bg-purple-950 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry to Store</span>
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Embedded Google Map */}
        <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-xl h-[380px] bg-stone-100">
          <iframe
            title="Hari Om Pendawala Sweet &amp; Namkeen – Amreliwala Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.208168234857!2d72.47116747596877!3d23.016126721381223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9bb5eccf742b%3A0x4ba5ef69ebdf83d9!2sHari%20om%20pendawala%20sweet%20%26%20namkeen%20-%20Amreliwala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

      </div>
    </div>
  );
}
