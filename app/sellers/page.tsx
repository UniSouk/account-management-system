"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sellers</h1>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : "Add Seller"}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Add New Seller</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Account Manager (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formData.accountManagerName}
                      onChange={(e) => setFormData({ ...formData, accountManagerName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      value={formData.accountManagerMobile}
                      onChange={(e) => setFormData({ ...formData, accountManagerMobile: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.accountManagerEmail}
                      onChange={(e) => setFormData({ ...formData, accountManagerEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Service Note</label>
                <textarea
                  value={formData.serviceNote}
                  onChange={(e) => setFormData({ ...formData, serviceNote: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <Button type="submit">Save Seller</Button>
            </div>
          </form>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No sellers yet. Click "Add Seller" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.businessName}</TableCell>
                    <TableCell>{seller.contactName || "-"}</TableCell>
                    <TableCell>{seller.email || "-"}</TableCell>
                    <TableCell>{seller.phone || "-"}</TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => router.push(`/sellers/${seller.id}`)} className="p-0 h-auto">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
