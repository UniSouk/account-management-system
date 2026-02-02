"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/app-layout";
import {
  Plus,
  FileText,
  CreditCard,
  MessageSquare,
  FileCheck,
  Activity,
} from "lucide-react";

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

export default function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [seller, setSeller] = useState<Seller | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>({});
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [lifecycleHistory, setLifecycleHistory] = useState<LifecycleHistory[]>(
    [],
  );
  const [isEditing, setIsEditing] = useState(false);

  // Dialog states
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = useState(false);

  // Form states
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
  const [docForm, setDocForm] = useState({
    fileName: "",
    fileUrl: "",
    tags: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    reference: "",
    proofOfPayment: "",
  });
  const [noteForm, setNoteForm] = useState({ content: "", attachmentUrl: "" });
  const [proposalForm, setProposalForm] = useState({
    fileName: "",
    fileUrl: "",
    shareable: false,
  });
  const [lifecycleForm, setLifecycleForm] = useState({
    marketplace: "",
    stage: "",
  });

  const fetchSeller = useCallback(async (sellerId: string) => {
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
  }, []);

  const fetchDocuments = useCallback(async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/documents`);
    if (res.ok) setDocuments(await res.json());
  }, []);

  const fetchInvoices = useCallback(async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/invoices`);
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) => ({ ...prev, [paymentId]: data }));
    }
  }, []);

  const fetchPayments = useCallback(
    async (sellerId: string) => {
      const res = await fetch(`/api/sellers/${sellerId}/payments`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
        data.forEach((p: Payment) => fetchInvoices(p.id));
      }
    },
    [fetchInvoices],
  );

  const fetchNotes = useCallback(async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/notes`);
    if (res.ok) setInternalNotes(await res.json());
  }, []);

  const fetchProposals = useCallback(async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/proposals`);
    if (res.ok) setProposals(await res.json());
  }, []);

  const fetchLifecycle = useCallback(async (sellerId: string) => {
    const res = await fetch(`/api/sellers/${sellerId}/lifecycle`);
    if (res.ok) setLifecycleHistory(await res.json());
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const p = await params;
      if (!mounted) return;

      setId(p.id);
      fetchSeller(p.id);
      fetchDocuments(p.id);
      fetchPayments(p.id);
      fetchNotes(p.id);
      fetchProposals(p.id);
      fetchLifecycle(p.id);
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [
    params,
    fetchSeller,
    fetchDocuments,
    fetchPayments,
    fetchNotes,
    fetchProposals,
    fetchLifecycle,
  ]);

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
      toast.success("Seller updated");
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(docForm),
    });
    if (res.ok) {
      setDocForm({ fileName: "", fileUrl: "", tags: "" });
      setDocDialogOpen(false);
      fetchDocuments(id);
      toast.success("Document added");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      fetchDocuments(id);
      toast.success("Document deleted");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date(paymentForm.paymentDate).toISOString(),
        reference: paymentForm.reference || null,
        proofOfPayment: paymentForm.proofOfPayment,
      }),
    });
    if (res.ok) {
      setPaymentForm({
        amount: "",
        paymentDate: "",
        reference: "",
        proofOfPayment: "",
      });
      setPaymentDialogOpen(false);
      fetchPayments(id);
      toast.success("Payment recorded");
    }
  };

  const generateInvoice = async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/invoices`, {
      method: "POST",
    });
    if (res.ok) {
      fetchInvoices(paymentId);
      toast.success("Invoice generated");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: noteForm.content,
        attachmentUrl: noteForm.attachmentUrl || null,
      }),
    });
    if (res.ok) {
      setNoteForm({ content: "", attachmentUrl: "" });
      setNoteDialogOpen(false);
      fetchNotes(id);
      toast.success("Note added");
    }
  };

  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposalForm),
    });
    if (res.ok) {
      setProposalForm({ fileName: "", fileUrl: "", shareable: false });
      setProposalDialogOpen(false);
      fetchProposals(id);
      toast.success("Proposal added");
    }
  };

  const handleAddLifecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/sellers/${id}/lifecycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lifecycleForm),
    });
    if (res.ok) {
      setLifecycleForm({ marketplace: "", stage: "" });
      setLifecycleDialogOpen(false);
      fetchLifecycle(id);
      toast.success("Lifecycle updated");
    }
  };

  if (!seller)
    return (
      <AppLayout>
        <div className="space-y-6 p-8">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/sellers")}>
          ← Back to Sellers
        </Button>

        {/* Seller Info Card */}
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
              <form onSubmit={handleUpdateSeller} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input
                      value={editForm.businessName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={editForm.contactName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Point of Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editForm.accountManagerName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accountManagerName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Mobile</Label>
                      <Input
                        value={editForm.accountManagerMobile}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accountManagerMobile: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editForm.accountManagerEmail}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accountManagerEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Service Note</Label>
                  <Textarea
                    value={editForm.serviceNote}
                    onChange={(e) =>
                      setEditForm({ ...editForm, serviceNote: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Contact</Label>
                    <p>{seller.contactName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{seller.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{seller.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p>{seller.address || "-"}</p>
                  </div>
                </div>
                {(seller.accountManagerName ||
                  seller.accountManagerMobile ||
                  seller.accountManagerEmail) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Point of Contact</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p>{seller.accountManagerName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Mobile</Label>
                        <p>{seller.accountManagerMobile || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p>{seller.accountManagerEmail || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {seller.serviceNote && (
                  <div>
                    <Label className="text-muted-foreground">
                      Service Note
                    </Label>
                    <p>{seller.serviceNote}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Lifecycle
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddDocument} className="space-y-4">
                      <div>
                        <Label>File Name</Label>
                        <Input
                          value={docForm.fileName}
                          onChange={(e) =>
                            setDocForm({ ...docForm, fileName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>File URL</Label>
                        <Input
                          value={docForm.fileUrl}
                          onChange={(e) =>
                            setDocForm({ ...docForm, fileUrl: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Tags</Label>
                        <Input
                          placeholder="e.g., KYC, PAN"
                          value={docForm.tags}
                          onChange={(e) =>
                            setDocForm({ ...docForm, tags: e.target.value })
                          }
                          required
                        />
                      </div>
                      <Button type="submit">Add Document</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No documents yet
                  </p>
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
                          <TableCell className="font-medium">
                            {doc.fileName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.tags}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <a href={doc.fileUrl} target="_blank">
                                View
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payments</CardTitle>
                <Dialog
                  open={paymentDialogOpen}
                  onOpenChange={setPaymentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentForm.amount}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                amount: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            value={paymentForm.paymentDate}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                paymentDate: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Reference (Optional)</Label>
                        <Input
                          value={paymentForm.reference}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              reference: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Proof of Payment URL</Label>
                        <Input
                          value={paymentForm.proofOfPayment}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              proofOfPayment: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <Button type="submit">Record Payment</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No payments yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-2xl font-semibold">
                              INR {payment.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Date:{" "}
                              {new Date(
                                payment.paymentDate,
                              ).toLocaleDateString()}
                            </p>
                            {payment.reference && (
                              <p className="text-sm text-muted-foreground">
                                Ref: {payment.reference}
                              </p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={payment.proofOfPayment} target="_blank">
                              View Proof
                            </a>
                          </Button>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Invoices</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={invoices[payment.id]?.length > 0}
                              onClick={() => generateInvoice(payment.id)}
                            >
                              Generate Invoice
                            </Button>
                          </div>
                          {invoices[payment.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {invoices[payment.id].map((inv) => (
                                <div
                                  key={inv.id}
                                  className="bg-muted p-3 rounded flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {inv.invoiceNumber}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        inv.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="ghost" asChild>
                                    <a
                                      href={`/api/invoices/${inv.id}/download`}
                                      download
                                    >
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No invoices generated
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Proposals</CardTitle>
                <Dialog
                  open={proposalDialogOpen}
                  onOpenChange={setProposalDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Proposal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Proposal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProposal} className="space-y-4">
                      <div>
                        <Label>File Name</Label>
                        <Input
                          value={proposalForm.fileName}
                          onChange={(e) =>
                            setProposalForm({
                              ...proposalForm,
                              fileName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>File URL</Label>
                        <Input
                          value={proposalForm.fileUrl}
                          onChange={(e) =>
                            setProposalForm({
                              ...proposalForm,
                              fileUrl: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="shareable"
                          checked={proposalForm.shareable}
                          onChange={(e) =>
                            setProposalForm({
                              ...proposalForm,
                              shareable: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                        <Label htmlFor="shareable" className="cursor-pointer">
                          Mark as shareable
                        </Label>
                      </div>
                      <Button type="submit">Add Proposal</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No proposals yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((p) => (
                      <div
                        key={p.id}
                        className="border rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold">{p.fileName}</p>
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 h-auto"
                            asChild
                          >
                            <a href={p.fileUrl} target="_blank">
                              View Proposal
                            </a>
                          </Button>
                          <div className="mt-2">
                            <Badge
                              variant={p.shareable ? "default" : "secondary"}
                            >
                              {p.shareable ? "Shareable" : "Internal Only"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifecycle Tab */}
          <TabsContent value="lifecycle">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lifecycle Tracking</CardTitle>
                <Dialog
                  open={lifecycleDialogOpen}
                  onOpenChange={setLifecycleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Update Lifecycle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Lifecycle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddLifecycle} className="space-y-4">
                      <div>
                        <Label>Marketplace</Label>
                        <Input
                          placeholder="e.g., Amazon, Flipkart"
                          value={lifecycleForm.marketplace}
                          onChange={(e) =>
                            setLifecycleForm({
                              ...lifecycleForm,
                              marketplace: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Stage</Label>
                        <Input
                          placeholder="e.g., Onboarding, Active"
                          value={lifecycleForm.stage}
                          onChange={(e) =>
                            setLifecycleForm({
                              ...lifecycleForm,
                              stage: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <Button type="submit">Update</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {lifecycleHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No lifecycle history yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lifecycleHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold">{entry.marketplace}</p>
                          <p className="text-sm text-muted-foreground">
                            Stage: {entry.stage}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Internal Notes</CardTitle>
                <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Internal Note</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddNote} className="space-y-4">
                      <div>
                        <Label>Note Content</Label>
                        <Textarea
                          value={noteForm.content}
                          onChange={(e) =>
                            setNoteForm({
                              ...noteForm,
                              content: e.target.value,
                            })
                          }
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label>Attachment URL (Optional)</Label>
                        <Input
                          value={noteForm.attachmentUrl}
                          onChange={(e) =>
                            setNoteForm({
                              ...noteForm,
                              attachmentUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button type="submit">Add Note</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {internalNotes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notes yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-lg p-4 bg-muted/50"
                      >
                        <p className="mb-2">{note.content}</p>
                        {note.attachmentUrl && (
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 h-auto"
                            asChild
                          >
                            <a href={note.attachmentUrl} target="_blank">
                              View Attachment
                            </a>
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
