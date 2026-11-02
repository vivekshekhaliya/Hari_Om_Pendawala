import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import VegBadge from './VegBadge';

export default function Footer() {
  const { shop } = useShop();

  return (
    <footer className="bg-[#fcfbf9] border-t border-purple-100 text-gray-700">
      {/* 1. Value Badges Bar */}
      <div className="border-b border-purple-100/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50/60 transition">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 mb-2 shadow-sm">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-serif font-bold text-sm text-purple-950">Amreli Heritage</h4>
            <p className="text-xs text-gray-500 mt-0.5">Authentic Saurashtra taste &amp; recipes</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50/60 transition">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-800 mb-2 shadow-sm">
              <VegBadge size="lg" />
            </div>
            <h4 className="font-serif font-bold text-sm text-green-900">100% Pure Veg</h4>
            <p className="text-xs text-gray-500 mt-0.5">Pure desi cow ghee &amp; groundnut oil</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50/60 transition">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-2 shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-serif font-bold text-sm text-purple-950">Daily Fresh Batches</h4>
            <p className="text-xs text-gray-500 mt-0.5">Handcrafted every morning with love</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50/60 transition">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 mb-2 shadow-sm">
              <Clock className="w-6 h-6 text-purple-800" />
            </div>
            <h4 className="font-serif font-bold text-sm text-purple-950">Fast Express Delivery</h4>
            <p className="text-xs text-gray-500 mt-0.5">Delivered fresh across Ahmedabad</p>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={shop.logo_url || '/assets/logo.jpeg'}
                alt="Hari Om Pendawala Logo"
                className="h-16 w-auto object-contain border border-purple-200/70 shadow-sm bg-white p-1 rounded-xl"
              />
              <div>
                <h3 className="font-serif font-bold text-lg text-[#393186] leading-tight">
                  Hari Om Pendawala
                </h3>
                <p className="text-xs text-amber-700 font-semibold tracking-wider uppercase">
                  Sweet &amp; Namkeen – <span className="text-green-700">Amreliwala</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Bringing the legendary sweet-making traditions of Amreli, Saurashtra to South Bopal, Ahmedabad. Renowned for our signature Thabdi Penda, pure desi ghee Mohanthal, Kaju Katli, and authentic Kathiyawadi namkeen.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-800">
              <VegBadge size="sm" />
              <span>100% Pure Vegetarian Preparation</span>
            </div>
          </div>

          {/* Customer Service & Help */}
          <div>
            <h4 className="font-serif font-bold text-sm text-purple-950 uppercase tracking-wider mb-4 border-b border-purple-200 pb-2">
              Customer Services
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link to="/track-order" className="hover:text-purple-900 transition">
                  Track Your Order Online
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-purple-900 transition">
                  Shopping Cart &amp; Checkout
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-purple-900 transition">
                  My Customer Account
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-purple-900 transition">
                  Our Heritage &amp; Quality Promise
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-900 transition">
                  Contact Store &amp; Bulk Orders
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-purple-800 hover:text-purple-950 font-semibold flex items-center gap-1 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Admin Panel Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop Location & Contact Details */}
          <div>
            <h4 className="font-serif font-bold text-sm text-purple-950 uppercase tracking-wider mb-4 border-b border-purple-200 pb-2">
              Visit Our Store
            </h4>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#393186] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Shop Number 8, Floor 2, Sun South Park, near SOBO Center Road, South Bopal, Bopal, Ahmedabad, Gujarat 380057
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                <span>⭐ 4.8 / 5.0 (58 Reviews on Google)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{shop.opening_hours || 'Monday – Sunday: 8:00 AM – 10:30 PM'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-green-700 shrink-0" />
                <a href={`tel:${shop.phone || '+919712247979'}`} className="hover:text-[#393186] font-semibold text-gray-800">
                  {shop.phone || '+91 97122 47979'}
                </a>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4716632,17z/data=!4m6!3m5!1s0x395e9bb5eccf742b:0x4ba5ef69ebdf83d9!8m2!3d23.0161268!4d72.4737324!16s%2Fg%2F11y5sydydr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#393186]/10 hover:bg-[#393186]/20 text-[#393186] px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#393186]" />
                  <span>Get Driving Directions (Google Maps)</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Announcement & Store Details Bar */}
      <div className="bg-[#393186] text-white text-xs font-medium py-2.5 px-4 sm:px-6 border-t border-purple-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
              Amreli Special
            </span>
            <span className="text-purple-100 text-xs">{shop.announcement_text || 'Pure Desi Ghee Mithai & Fresh Saurashtra Farsan'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-purple-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {shop.opening_hours || '8:00 AM – 10:30 PM'}
            </span>
            <span className="text-purple-400">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              South Bopal, Ahmedabad
            </span>
            <span className="text-purple-400">•</span>
            <a href={`tel:${shop.phone || '+919712247979'}`} className="flex items-center gap-1.5 text-white hover:text-amber-300 font-semibold transition">
              <Phone className="w-3 h-3 text-green-400" />
              {shop.phone || '+91 97122 47979'}
            </a>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Bar */}
      <div className="bg-[#2a2463] text-purple-200 text-xs py-3.5 px-4 sm:px-6 border-t border-purple-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} <strong className="text-white">Hari Om Pendawala Sweet &amp; Namkeen – Amreliwala</strong>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-purple-300 text-[11px]">
            <span>Crafted with Pure Desi Ghee &amp; Devotion</span>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-amber-300 transition">Store Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
