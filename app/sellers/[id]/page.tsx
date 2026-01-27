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
  accountManager: string | null;
  serviceNote: string | null;
  createdAt: string;
};

type Document = {
  id: string;
  fileName: string;
  fileUrl: string;
  tags: string;
  createdAt: string;
};

type UploadLink = {
  id: string;
  token: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
};

type Payment = {
  id: string;
  amount: number;
  paymentDate: string;
  reference: string | null;
  proofOfPayment: string;
  createdAt: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  pdfUrl: string | null;
  createdAt: string;
};

type InternalNote = {
  id: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
};

type Proposal = {
  id: string;
  fileName: string;
  fileUrl: string;
  shareable: boolean;
  createdAt: string;
};

type LifecycleHistory = {
  id: string;
  marketplace: string;
  stage: string;
  createdAt: string;
};

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadLinks, setUploadLinks] = useState<UploadLink[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>({});
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [lifecycleHistory, setLifecycleHistory] = useState<LifecycleHistory[]>([]);
  const [id, setId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    accountManager: "",
    serviceNote: "",
  });
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [tags, setTags] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [reference, setReference] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteAttachment, setNoteAttachment] = useState("");
  const [proposalFileName, setProposalFileName] = useState("");
  const [proposalFileUrl, setProposalFileUrl] = useState("");
  const [proposalShareable, setProposalShareable] = useState(false);
  const [marketplace, setMarketplace] = useState("");
  const [stage, setStage] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocForm, setEditDocForm] = useState({ fileName: "", fileUrl: "", tags: "" });
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchSeller(p.id);
      fetchDocuments(p.id);
      fetchUploadLinks(p.id);
      fetchPayments(p.id);
      fetchInternalNotes(p.id);
      fetchProposals(p.id);
      fetchLifecycleHistory(p.id);
    });
  }, [params]);

  const fetchSeller = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}`);
    if (res.ok) {
      const data = await res.json();
      setSeller(data);
      setEditForm({
        businessName: data.businessName || "",
        contactName: data.contactName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        accountManager: data.accountManager || "",
        serviceNote: data.serviceNote || "",
      });
    }
  };

  const fetchDocuments = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/documents`);
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
  };

  const fetchUploadLinks = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/upload-links`);
    if (res.ok) {
      const data = await res.json();
      setUploadLinks(data);
    }
  };

  const fetchPayments = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/payments`);
    if (res.ok) {
      const data = await res.json();
      setPayments(data);
      data.forEach((payment: Payment) => fetchInvoices(payment.id));
    }
  };

  const fetchInvoices = async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/invoices`);
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) => ({ ...prev, [paymentId]: data }));
    }
  };

  const fetchInternalNotes = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/notes`);
    if (res.ok) {
      const data = await res.json();
      setInternalNotes(data);
    }
  };

  const fetchProposals = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/proposals`);
    if (res.ok) {
      const data = await res.json();
      setProposals(data);
    }
  };

  const fetchLifecycleHistory = async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/lifecycle`);
    if (res.ok) {
      const data = await res.json();
      setLifecycleHistory(data);
    }
  };

  const handleUpdateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setIsEditing(false);
      fetchSeller(id);
    }
  };

  const generateInvoice = async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/invoices`, {
      method: "POST",
    });
    if (res.ok) {
      fetchInvoices(paymentId);
    }
  };

  const generateUploadLink = async () => {
    const res = await fetch(`/api/sellers/${id}/upload-links`, {
      method: "POST",
    });
    if (res.ok) {
      fetchUploadLinks(id);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileUrl, tags }),
    });
    if (res.ok) {
      setFileName("");
      setFileUrl("");
      setTags("");
      fetchDocuments(id);
    }
  };

  const handleEditDocument = async (docId: string) => {
    const res = await fetch(`/api/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDocForm),
    });
    if (res.ok) {
      setEditingDocId(null);
      fetchDocuments(id);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    if (res.ok) fetchDocuments(id);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate).toISOString(),
        reference,
        proofOfPayment,
      }),
    });
    if (res.ok) {
      setAmount("");
      setPaymentDate("");
      setReference("");
      setProofOfPayment("");
      fetchPayments(id);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent, attachmentUrl: noteAttachment || null }),
    });
    if (res.ok) {
      setNoteContent("");
      setNoteAttachment("");
      fetchInternalNotes(id);
    }
  };

  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: proposalFileName, fileUrl: proposalFileUrl, shareable: proposalShareable }),
    });
    if (res.ok) {
      setProposalFileName("");
      setProposalFileUrl("");
      setProposalShareable(false);
      fetchProposals(id);
    }
  };

  const handleUpdateLifecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/lifecycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketplace, stage }),
    });
    if (res.ok) {
      setMarketplace("");
      setStage("");
      fetchLifecycleHistory(id);
    }
  };

  if (!seller) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push("/sellers")} className="mb-4 text-blue-600 hover:text-blue-800">
          ← Back to Sellers
        </button>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{seller.businessName}</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
          {isEditing ? (
            <form onSubmit={handleUpdateSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Manager</label>
                <input
                  type="text"
                  value={editForm.accountManager}
                  onChange={(e) => setEditForm({ ...editForm, accountManager: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Note</label>
                <textarea
                  value={editForm.serviceNote}
                  onChange={(e) => setEditForm({ ...editForm, serviceNote: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Name</label>
                <p className="text-lg">{seller.contactName || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{seller.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-lg">{seller.phone || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-lg">{seller.address || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Manager</label>
                <p className="text-lg">{seller.accountManager || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Service Note</label>
                <p className="text-lg">{seller.serviceNote || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-lg">{new Date(seller.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Documents</h2>
          <form onSubmit={handleUpload} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="File Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="File URL"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Tags (e.g., KYC, PAN, Compliance)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upload Document
            </button>
          </form>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">One-Time Upload Links</h3>
            <button onClick={generateUploadLink} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4">
              Generate Upload Link
            </button>
            <div className="space-y-2">
              {uploadLinks.length === 0 ? (
                <p className="text-gray-500">No upload links generated yet</p>
              ) : (
                uploadLinks.map((link) => (
                  <div key={link.id} className="border p-3 rounded text-sm">
                    <p className="font-mono break-all">
                      {typeof window !== "undefined" ? `${window.location.origin}/upload?token=${link.token}` : ""}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: {link.used ? "Used" : new Date(link.expiresAt) < new Date() ? "Expired" : "Active"} | 
                      Expires: {new Date(link.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded yet</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="border p-4 rounded">
                  {editingDocId === doc.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editDocForm.fileName}
                        onChange={(e) => setEditDocForm({ ...editDocForm, fileName: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editDocForm.fileUrl}
                        onChange={(e) => setEditDocForm({ ...editDocForm, fileUrl: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editDocForm.tags}
                        onChange={(e) => setEditDocForm({ ...editDocForm, tags: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEditDocument(doc.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                          Save
                        </button>
                        <button onClick={() => setEditingDocId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-gray-600">Tags: {doc.tags}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          View
                        </a>
                        <button
                          onClick={() => {
                            setEditingDocId(doc.id);
                            setEditDocForm({ fileName: doc.fileName, fileUrl: doc.fileUrl, tags: doc.tags });
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Payments</h2>
          <form onSubmit={handlePayment} className="mb-6 space-y-4">
            <div>
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="Payment Date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Reference (optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Proof of Payment URL"
                value={proofOfPayment}
                onChange={(e) => setProofOfPayment(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Record Payment
            </button>
          </form>

          <div className="space-y-2">
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments recorded yet</p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                      {payment.reference && <p className="text-sm text-gray-600">Reference: {payment.reference}</p>}
                      <p className="text-xs text-gray-400">Recorded: {new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                    <a href={payment.proofOfPayment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      View Proof
                    </a>
                  </div>
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Invoices</h4>
                      <button
                        onClick={() => generateInvoice(payment.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Generate Invoice
                      </button>
                    </div>
                    {invoices[payment.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {invoices[payment.id].map((invoice) => (
                          <div key={invoice.id} className="bg-gray-50 p-2 rounded text-sm">
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleString()}</p>
                            {invoice.pdfUrl && (
                              <a href={invoice.pdfUrl} className="text-blue-600 hover:text-blue-800 text-xs">
                                Download PDF
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No invoices generated</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Proposals</h2>
          <form onSubmit={handleAddProposal} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Proposal file name"
                value={proposalFileName}
                onChange={(e) => setProposalFileName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Proposal file URL"
                value={proposalFileUrl}
                onChange={(e) => setProposalFileUrl(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="shareable"
                checked={proposalShareable}
                onChange={(e) => setProposalShareable(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="shareable">Mark as shareable</label>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upload Proposal
            </button>
          </form>
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <p className="text-gray-500">No proposals yet</p>
            ) : (
              proposals.map((proposal) => (
                <div key={proposal.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{proposal.fileName}</p>
                      <a href={proposal.fileUrl} className="text-blue-600 hover:text-blue-800 text-sm">
                        View Proposal
                      </a>
                      <p className="text-sm mt-1">
                        <span className={proposal.shareable ? "text-green-600" : "text-gray-600"}>
                          {proposal.shareable ? "Shareable" : "Internal Only"}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(proposal.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Lifecycle Tracking</h2>
          <form onSubmit={handleUpdateLifecycle} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Marketplace (e.g., Amazon, Flipkart)"
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Stage (e.g., Onboarding, Active, Suspended)"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Update Lifecycle
            </button>
          </form>
          <div className="space-y-4">
            {lifecycleHistory.length === 0 ? (
              <p className="text-gray-500">No lifecycle history yet</p>
            ) : (
              lifecycleHistory.map((entry) => (
                <div key={entry.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{entry.marketplace}</p>
                      <p className="text-sm text-gray-600">Stage: {entry.stage}</p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Internal Notes</h2>
          <form onSubmit={handleAddNote} className="mb-6 space-y-4">
            <div>
              <textarea
                placeholder="Note content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Attachment URL (optional)"
                value={noteAttachment}
                onChange={(e) => setNoteAttachment(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Note
            </button>
          </form>
          <div className="space-y-4">
            {internalNotes.length === 0 ? (
              <p className="text-gray-500">No internal notes yet</p>
            ) : (
              internalNotes.map((note) => (
                <div key={note.id} className="border rounded p-4 bg-gray-50">
                  <p className="mb-2">{note.content}</p>
                  {note.attachmentUrl && (
                    <a href={note.attachmentUrl} className="text-blue-600 hover:text-blue-800 text-sm">
                      View Attachment
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
