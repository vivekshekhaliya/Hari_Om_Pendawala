import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, MapPin, Clock, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import VegBadge from '../components/common/VegBadge';

export default function AboutPage() {
  const { shop } = useShop();

  return (
    <div className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <img
            src={shop.logo_url || '/assets/logo.jpeg'}
            alt="Hari Om Pendawala Logo"
            className="h-20 w-auto object-contain mx-auto border border-purple-200 bg-white p-1 rounded-2xl shadow-sm"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Amreliwala Sweet Heritage
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#393186]">
            About Hari Om Pendawala
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Preserving the sacred art of Saurashtra sweet-making with uncompromised pure desi cow ghee, rich buffalo milk, and traditional copper kadhais.
          </p>
        </div>

        {/* Feature Image Banner */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
          <img
            src="/assets/hero-banner.jpg"
            alt="Hari Om Pendawala Traditional Sweets"
            className="w-full h-[320px] sm:h-[420px] object-cover"
          />
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="font-serif font-bold text-2xl text-purple-950">
            Our Story: From Amreli to South Bopal, Ahmedabad
          </h2>

          <p>
            The story of <strong>Hari Om Pendawala (Amreliwala)</strong> began with a single vision: to bring the authentic, rich sweetness of Saurashtra into everyday celebrations. Amreli is known across Gujarat for having the finest pastoral dairy heritage, where slow-cooked caramel milk sweets have been perfected over generations.
          </p>

          <p>
            When our founders set foot in South Bopal, Ahmedabad, we brought that very craft with us. We strictly refuse shortcuts: our signature <strong>Thabdi Penda</strong> is simmered for hours until it reaches its deep golden-brown hue and authentic coarse grain. No artificial thickeners, no food coloring, and no preservatives.
          </p>

          {/* Pillars of Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-center space-y-2">
              <Award className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-serif font-bold text-purple-950 text-sm">100% Pure Desi Ghee</h3>
              <p className="text-xs text-gray-500">Every single sweet is prepared in aromatic, pure desi cow ghee.</p>
            </div>

            <div className="p-4 bg-green-50/60 rounded-2xl border border-green-100 text-center space-y-2">
              <VegBadge size="lg" className="mx-auto" />
              <h3 className="font-serif font-bold text-green-950 text-sm">Strictly Vegetarian</h3>
              <p className="text-xs text-gray-500">100% pure vegetarian establishment following strict hygiene standards.</p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-center space-y-2">
              <Clock className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-serif font-bold text-purple-950 text-sm">Daily Fresh Batches</h3>
              <p className="text-xs text-gray-500">Cooked fresh every morning in small batches for maximum taste.</p>
            </div>
          </div>

          <h3 className="font-serif font-bold text-lg text-purple-950 pt-4">
            Our Specialties
          </h3>

          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600">
            <li><strong>Famous Amreli Thabdi Penda:</strong> Our flagship milk fudge enriched with cardamom and crunch.</li>
            <li><strong>Royal Kaju Katli:</strong> Silky cashew fudge with pure silver vark and Kashmiri saffron.</li>
            <li><strong>Desi Ghee Mohanthal:</strong> Roasted besan sweet laden with slivered almonds and pistachios.</li>
            <li><strong>Authentic Bhavnagari Gathiya:</strong> Soft, peppery Kathiyawadi breakfast snack.</li>
            <li><strong>Festive Hampers:</strong> Luxury gift boxes tailored for weddings, corporate gifting, and festivals like Diwali &amp; Raksha Bandhan.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
