"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

type Document = {
  id: string;
  fileName: string;
  fileUrl: string;
  tags: string;
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
    accountManagerName: "",
    accountManagerMobile: "",
    accountManagerEmail: "",
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
        accountManagerName: data.accountManagerName || "",
        accountManagerMobile: data.accountManagerMobile || "",
        accountManagerEmail: data.accountManagerEmail || "",
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/sellers")}>
          ← Back to Sellers
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">{seller.businessName}</CardTitle>
              <Button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdateSeller} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={editForm.contactName}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                <div className="border-t pt-6 space-y-4">
                  <h4 className="text-sm font-semibold">Account Manager <span className="text-muted-foreground font-normal">(Optional)</span></h4>
                  <div className="space-y-2">
                    <Label htmlFor="amName">Name</Label>
                    <Input
                      id="amName"
                      value={editForm.accountManagerName}
                      onChange={(e) => setEditForm({ ...editForm, accountManagerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amMobile">Mobile Number</Label>
                    <Input
                      id="amMobile"
                      value={editForm.accountManagerMobile}
                      onChange={(e) => setEditForm({ ...editForm, accountManagerMobile: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amEmail">Email Address</Label>
                    <Input
                      id="amEmail"
                      type="email"
                      value={editForm.accountManagerEmail}
                      onChange={(e) => setEditForm({ ...editForm, accountManagerEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceNote">Service Note</Label>
                  <Textarea
                    id="serviceNote"
                    value={editForm.serviceNote}
                    onChange={(e) => setEditForm({ ...editForm, serviceNote: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Contact Name</Label>
                    <p className="mt-1">{seller.contactName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="mt-1">{seller.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="mt-1">{seller.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="mt-1">{seller.address || "-"}</p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold mb-4">Account Manager</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="mt-1">{seller.accountManagerName || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mobile Number</Label>
                      <p className="mt-1">{seller.accountManagerMobile || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email Address</Label>
                      <p className="mt-1">{seller.accountManagerEmail || "-"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service Note</Label>
                  <p className="mt-1">{seller.serviceNote || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="mt-1">{new Date(seller.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g., KYC, PAN, Compliance"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Upload Document</Button>
            </form>

            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No documents uploaded yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      {editingDocId === doc.id ? (
                        <TableCell colSpan={4}>
                          <div className="space-y-2">
                            <Input
                              value={editDocForm.fileName}
                              onChange={(e) => setEditDocForm({ ...editDocForm, fileName: e.target.value })}
                            />
                            <Input
                              value={editDocForm.fileUrl}
                              onChange={(e) => setEditDocForm({ ...editDocForm, fileUrl: e.target.value })}
                            />
                            <Input
                              value={editDocForm.tags}
                              onChange={(e) => setEditDocForm({ ...editDocForm, tags: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEditDocument(doc.id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingDocId(null)}>Cancel</Button>
                            </div>
                          </div>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell className="font-medium">{doc.fileName}</TableCell>
                          <TableCell><Badge variant="secondary">{doc.tags}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(doc.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" asChild>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingDocId(doc.id);
                                  setEditDocForm({ fileName: doc.fileName, fileUrl: doc.fileUrl, tags: doc.tags });
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteDocument(doc.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference <span className="text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proofOfPayment">Proof of Payment URL</Label>
                <Input
                  id="proofOfPayment"
                  value={proofOfPayment}
                  onChange={(e) => setProofOfPayment(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Record Payment</Button>
            </form>

            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payments recorded yet</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-2xl font-semibold">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                        {payment.reference && <p className="text-sm text-muted-foreground">Reference: {payment.reference}</p>}
                        <p className="text-xs text-muted-foreground">Recorded: {new Date(payment.createdAt).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={payment.proofOfPayment} target="_blank" rel="noopener noreferrer">View Proof</a>
                      </Button>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm">Invoices</h4>
                        <Button size="sm" onClick={() => generateInvoice(payment.id)}>
                          Generate Invoice
                        </Button>
                      </div>
                      {invoices[payment.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {invoices[payment.id].map((invoice) => (
                            <div key={invoice.id} className="bg-muted p-3 rounded text-sm flex justify-between items-center">
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-xs text-muted-foreground">{new Date(invoice.createdAt).toLocaleString()}</p>
                              </div>
                              {invoice.pdfUrl && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={invoice.pdfUrl}>Download PDF</a>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No invoices generated</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proposalFileName">Proposal File Name</Label>
                <Input
                  id="proposalFileName"
                  value={proposalFileName}
                  onChange={(e) => setProposalFileName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposalFileUrl">Proposal File URL</Label>
                <Input
                  id="proposalFileUrl"
                  value={proposalFileUrl}
                  onChange={(e) => setProposalFileUrl(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shareable"
                  checked={proposalShareable}
                  onChange={(e) => setProposalShareable(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="shareable" className="cursor-pointer">Mark as shareable</Label>
              </div>
              <Button type="submit">Upload Proposal</Button>
            </form>
            {proposals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No proposals yet</p>
            ) : (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{proposal.fileName}</p>
                        <Button size="sm" variant="link" className="p-0 h-auto" asChild>
                          <a href={proposal.fileUrl}>View Proposal</a>
                        </Button>
                        <div className="mt-2">
                          <Badge variant={proposal.shareable ? "default" : "secondary"}>
                            {proposal.shareable ? "Shareable" : "Internal Only"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(proposal.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUpdateLifecycle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketplace">Marketplace</Label>
                <Input
                  id="marketplace"
                  placeholder="e.g., Amazon, Flipkart"
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Input
                  id="stage"
                  placeholder="e.g., Onboarding, Active, Suspended"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Update Lifecycle</Button>
            </form>
            {lifecycleHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No lifecycle history yet</p>
            ) : (
              <div className="space-y-3">
                {lifecycleHistory.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{entry.marketplace}</p>
                        <p className="text-sm text-muted-foreground">Stage: {entry.stage}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteContent">Note Content</Label>
                <Textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteAttachment">Attachment URL <span className="text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="noteAttachment"
                  value={noteAttachment}
                  onChange={(e) => setNoteAttachment(e.target.value)}
                />
              </div>
              <Button type="submit">Add Note</Button>
            </form>
            {internalNotes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No internal notes yet</p>
            ) : (
              <div className="space-y-3">
                {internalNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 bg-muted/50">
                    <p className="mb-2">{note.content}</p>
                    {note.attachmentUrl && (
                      <Button size="sm" variant="link" className="p-0 h-auto" asChild>
                        <a href={note.attachmentUrl}>View Attachment</a>
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
