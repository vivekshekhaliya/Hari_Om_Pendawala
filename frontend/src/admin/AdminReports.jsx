import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, TrendingUp, DollarSign, Package } from 'lucide-react';
import { reportsApi } from '../services/api';

export default function AdminReports() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await reportsApi.getSales(params);
      if (res.data?.success) setSalesData(res.data.data);
    } catch (err) {
      console.error('Failed to load sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const totalPeriodRevenue = salesData.reduce((acc, row) => acc + Number(row.total_revenue || 0), 0);
  const totalPeriodOrders = salesData.reduce((acc, row) => acc + Number(row.order_count || 0), 0);
  const totalDiscountsGiven = salesData.reduce((acc, row) => acc + Number(row.total_discounts || 0), 0);
  const totalDeliveryCollected = salesData.reduce((acc, row) => acc + Number(row.total_delivery_charges || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Sales &amp; Financial Reports
          </h1>
          <p className="text-xs text-gray-500">
            Analyze daily revenue, order volumes, discounts, and delivery fees.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 shadow-sm">
            <span className="text-gray-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-gray-800 font-semibold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 shadow-sm">
            <span className="text-gray-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-gray-800 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={fetchSalesReport}
            className="bg-purple-900 hover:bg-purple-950 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Period Revenue</span>
          <span className="text-2xl font-black text-purple-950 font-sans mt-2 block">
            ₹{totalPeriodRevenue.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 block">Net sales from completed orders</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Orders Processed</span>
          <span className="text-2xl font-black text-purple-950 font-sans mt-2 block">
            {totalPeriodOrders}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 block">Delivered &amp; active orders</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Discounts Given</span>
          <span className="text-2xl font-black text-amber-700 font-sans mt-2 block">
            ₹{totalDiscountsGiven.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 block">Via promotional coupons</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Delivery Fees Collected</span>
          <span className="text-2xl font-black text-green-700 font-sans mt-2 block">
            ₹{totalDeliveryCollected.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 block">From home delivery orders</span>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-stone-50/60 font-bold text-xs text-purple-950">
          Daily Sales Breakdown
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Discounts</th>
                <th className="py-3 px-4">Delivery Charges</th>
                <th className="py-3 px-4">Average Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading sales report...</td>
                </tr>
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No sales recorded for the selected period.</td>
                </tr>
              ) : (
                salesData.map((row, idx) => {
                  const avg = Number(row.order_count) > 0 ? (Number(row.total_revenue) / Number(row.order_count)) : 0;
                  return (
                    <tr key={idx} className="hover:bg-purple-50/30 transition">
                      <td className="py-3.5 px-4 font-bold text-purple-950 font-mono">
                        {new Date(row.order_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {row.order_count} orders
                      </td>
                      <td className="py-3.5 px-4 font-bold font-sans text-purple-900">
                        ₹{Number(row.total_revenue).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-amber-700 font-sans">
                        ₹{Number(row.total_discounts).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-green-700 font-sans">
                        ₹{Number(row.total_delivery_charges).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-sans text-gray-900">
                        ₹{avg.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
