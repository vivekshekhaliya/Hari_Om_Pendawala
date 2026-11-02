import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag } from 'lucide-react';
import { customersApi } from '../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await customersApi.getAll();
      if (res.data?.success) setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Customer Directory
          </h1>
          <p className="text-xs text-gray-500">
            View registered customer profiles, purchase history, and lifetime spending.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs text-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full bg-white border border-purple-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-purple-600"
          />
          <Search className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading customers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No customers found.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs">
                          {c.name ? c.name[0].toUpperCase() : 'C'}
                        </div>
                        <strong className="text-gray-900 font-medium">{c.name}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-950">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {c.email || '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {c.total_orders || 0} orders
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold font-sans text-purple-950">
                      ₹{Number(c.total_spent || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
