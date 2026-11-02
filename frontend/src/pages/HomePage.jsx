import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, ShieldCheck, Heart, Clock, Phone, MapPin, Copy, Check, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';
import VegBadge from '../components/common/VegBadge';
import { getImageUrl } from '../utils/imageUrl';

export default function HomePage() {
  const { shop, deliverySettings } = useShop();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getAll({ featured: 'true' })
        ]);

        if (catsRes.data?.success) setCategories(catsRes.data.data);
        if (prodsRes.data?.success) setFeaturedProducts(prodsRes.data.data);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const filteredFeatured = selectedCategory === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => p.category_slug === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#393186] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-400/20 border border-amber-400/40 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>Original Amreli Heritage Sweets &amp; Farsan</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Authentic Taste of <br className="hidden sm:block" />
                <span className="text-amber-300">
                  Amreliwala Sweets
                </span> &amp; Namkeen
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-purple-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Handcrafted using century-old Saurashtra recipes, pure desi cow ghee, and fresh daily batches. Experience the legendary <strong>Amreli Thabdi Penda</strong>, royal Kaju Katli, and crunchy Gujarati farsan delivered fresh to your doorstep in Ahmedabad.
              </p>

              {/* USP Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-1 sm:pt-2 text-[11px] sm:text-xs text-purple-100">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 shrink-0">
                  <VegBadge size="sm" />
                  100% Pure Vegetarian
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 shrink-0">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  Pure Desi Cow Ghee
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  Same-Day Fresh Delivery
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3 sm:pt-4 w-full">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-purple-950 font-bold px-7 py-3 rounded-full shadow-lg transition transform active:scale-95 text-xs sm:text-sm"
                >
                  <span>Order Sweets Online</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/menu?category=namkeen-farsan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full backdrop-blur-sm border border-white/20 transition text-xs sm:text-sm"
                >
                  <span>Explore Namkeen &amp; Farsan</span>
                </Link>
              </div>

              {/* Free Delivery Teaser */}
              <p className="text-[11px] sm:text-xs text-amber-300 font-medium pt-1">
                🎉 Enjoy <strong>FREE Delivery</strong> across Ahmedabad on orders above ₹{parseFloat(deliverySettings?.free_delivery_threshold || 500).toFixed(0)}!
              </p>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative mx-auto max-w-md lg:max-w-none w-full">
                <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-[#2a2463]">
                  <img
                    src="/assets/hero-banner.jpg"
                    alt="Authentic Hari Om Pendawala Gujarati Sweets"
                    className="w-full h-[260px] sm:h-[340px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-[#2a2463]/95 border-t border-purple-400/20 p-5 text-white">
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-widest">
                      Special Recommendation
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5">
                      Famous Amreli Thabdi Penda &amp; Mohanthal
                    </h3>
                    <p className="text-xs text-purple-200 mt-1">
                      Made with Saurashtra full-cream milk and traditional slow roasting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Category Highlights Carousel / Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Explore Our Categories
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-purple-950 mt-1">
              Handcrafted Gujarati Delicacies
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-3 border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 border-2 border-amber-300/80 shadow-sm group-hover:scale-105 transition-transform bg-stone-50">
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-purple-950 group-hover:text-purple-700 transition line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-gray-500 mt-0.5">
                {cat.product_count ? `${cat.product_count} items` : 'Fresh Daily'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Showcase */}
      <section className="py-12 bg-white border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Chef’s Specialties
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-purple-950 mt-1">
              Most Loved Sweets &amp; Farsan
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Our signature bestsellers made fresh every morning. Choose your preferred pack size and enjoy authentic Saurashtra flavor.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-900 text-white shadow-md'
                    : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                }`}
              >
                All Specials
              </button>
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    selectedCategory === c.slug
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-stone-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFeatured.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#393186] hover:bg-[#2a2463] text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-full shadow-lg transition transform active:scale-95"
            >
              <span>Explore All Products &amp; Prices</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. About Us & Heritage Story */}
      <section className="py-14 bg-stone-50 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Visual Hamper / Story image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="/assets/gift-box.jpg"
                  alt="Hari Om Pendawala Luxury Gift Box"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-purple-900 text-white p-5 rounded-2xl shadow-xl border-2 border-amber-400 hidden sm:block max-w-xs">
                <p className="font-serif font-bold text-sm text-amber-300">
                  Legacy of Amreli
                </p>
                <p className="text-xs text-purple-100 mt-1">
                  Renowned across Saurashtra for authentic Thabdi Penda and unadulterated milk sweets.
                </p>
              </div>
            </div>

            {/* Heritage Text */}
            <div className="space-y-5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Our Heritage &amp; Tradition
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-4xl text-purple-950 leading-tight">
                Rooted in Amreli, Crafted with Purity in South Bopal
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                For decades, <strong>Hari Om Pendawala</strong> has been a benchmark for pure Gujarati sweets. Born out of the pastoral heartlands of Amreli, Gujarat, our master halwais continue to simmer full-fat buffalo and cow milk in wide copper vats until it achieves that iconic, caramel-textured grain of authentic <em>Thabdi Penda</em>.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We believe that pure sweets need no artificial coloring or synthetic fragrances. From our hand-rolled Kaju Katli to our crisp Bhavnagari Gathiya made in pristine cold-pressed oil, every single item is prepared fresh daily to elevate your festivals, pujas, and family moments.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-sm">
                  <h4 className="font-serif font-bold text-sm text-purple-950">100% Desi Cow Ghee</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Zero vegetable oil or dalda in our sweets</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-sm">
                  <h4 className="font-serif font-bold text-sm text-purple-950">Saurashtra Farsan</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Crispy, spiced Kathiyawadi gathiya &amp; sev</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Store Visit & Google Maps Section */}
      <section className="py-14 bg-white border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Visit Us in Person
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-purple-950 mt-1">
              Shop Location &amp; Contact
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Step into our retail shop in South Bopal to taste warm samples, select custom gift packing, or pick up your online order!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Store Information Card */}
            <div className="lg:col-span-5 bg-[#393186] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-stone-200/20">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <img
                    src={shop.logo_url || '/assets/logo.jpeg'}
                    alt="Hari Om Pendawala Logo"
                    className="h-16 w-auto object-contain border border-amber-400 bg-white p-1 rounded-xl shadow-md"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      Hari Om Pendawala
                    </h3>
                    <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                      Sweet &amp; Namkeen – Amreliwala
                    </p>
                    {/* Google Maps Rating Badge */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-bold text-xs text-amber-400">4.8</span>
                      <div className="flex text-amber-400 text-xs">★★★★★</div>
                      <span className="text-[11px] text-purple-200">(58 Google reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Service Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                    <Check className="w-3 h-3 text-green-400" /> In-store shopping
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                    <Check className="w-3 h-3 text-green-400" /> In-store pick-up
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">
                    <Check className="w-3 h-3 text-green-400" /> Fast Delivery
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
                      <strong className="block text-white font-medium">Opening Hours:</strong>
                      <span>{shop.opening_hours || 'Monday – Sunday: 8:00 AM – 10:30 PM (Open 7 Days)'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-medium">Direct Phone &amp; WhatsApp:</strong>
                      <a href={`tel:${shop.phone || '+919712247979'}`} className="hover:text-amber-300 text-white font-semibold">
                        {shop.phone || '+91 97122 47979'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-purple-800 flex flex-wrap gap-3">
                <a
                  href="https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4716632,17z/data=!4m6!3m5!1s0x395e9bb5eccf742b:0x4ba5ef69ebdf83d9!8m2!3d23.0161268!4d72.4737324!16s%2Fg%2F11y5sydydr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Driving Directions</span>
                </a>

                <a
                  href={`tel:${shop.phone || '+919712247979'}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>Call Store</span>
                </a>
              </div>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-stone-200 shadow-xl min-h-[340px] sm:min-h-[420px] bg-stone-100 relative">
              <iframe
                title="Hari Om Pendawala Sweet &amp; Namkeen – Amreliwala Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.208168234857!2d72.47116747596877!3d23.016126721381223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9bb5eccf742b%3A0x4ba5ef69ebdf83d9!2sHari%20om%20pendawala%20sweet%20%26%20namkeen%20-%20Amreliwala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full min-h-[340px] lg:min-h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. Promotional Coupons Banner (Before Footer) */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-[#393186] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            <div className="lg:col-span-2 space-y-2">
              <span className="bg-amber-400 text-purple-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Festive Discount Coupons
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                Save on Every Sweet Celebration
              </h3>
              <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
                Apply these official coupon codes at checkout to unlock flat savings on fresh Amreli mithai and namkeen hampers.
              </p>
            </div>

            {/* Coupons Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-amber-300 text-sm tracking-wider">
                    HARIOM50
                  </div>
                  <div className="text-[11px] text-purple-100">
                    Flat ₹50 OFF on orders above ₹400
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCoupon('HARIOM50')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-purple-950 font-bold text-xs hover:bg-amber-300 transition shrink-0 flex items-center gap-1"
                >
                  {copiedCoupon === 'HARIOM50' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-amber-300 text-sm tracking-wider">
                    FESTIVE15
                  </div>
                  <div className="text-[11px] text-purple-100">
                    15% OFF up to ₹150 on orders above ₹600
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCoupon('FESTIVE15')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-purple-950 font-bold text-xs hover:bg-amber-300 transition shrink-0 flex items-center gap-1"
                >
                  {copiedCoupon === 'FESTIVE15' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </div>
  );
}
