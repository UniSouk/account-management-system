"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Seller = {
  id: string;
  businessName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  accountManagerName: string | null;
  accountManagerMobile: string | null;
  accountManagerEmail: string | null;
  serviceNote: string | null;
  createdAt: string;
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    accountManagerName: "",
    accountManagerMobile: "",
    accountManagerEmail: "",
    serviceNote: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    const res = await fetch("/api/sellers");
    if (res.ok) {
      const data = await res.json();
      setSellers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({ businessName: "", contactName: "", email: "", phone: "", address: "", accountManagerName: "", accountManagerMobile: "", accountManagerEmail: "", serviceNote: "" });
      fetchSellers();
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sellers</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Add Seller"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Seller</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Account Manager (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.accountManagerName}
                      onChange={(e) => setFormData({ ...formData, accountManagerName: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={formData.accountManagerMobile}
                      onChange={(e) => setFormData({ ...formData, accountManagerMobile: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.accountManagerEmail}
                      onChange={(e) => setFormData({ ...formData, accountManagerEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service Note</label>
                <textarea
                  value={formData.serviceNote}
                  onChange={(e) => setFormData({ ...formData, serviceNote: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Save Seller
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{seller.businessName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.contactName || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.email || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.phone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/sellers/${seller.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sellers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No sellers yet. Click "Add Seller" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
