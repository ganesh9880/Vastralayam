import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, Check, X, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleApproval = async (customerId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("id", customerId);

      if (error) throw error;

      setCustomers(customers.map(customer =>
        customer.id === customerId ? { ...customer, approval_status: status } : customer
      ));

      toast.success(`Customer ${status}`);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Failed to update customer");
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (!selectedCustomer) return;

    try {
      const currentBalance = selectedCustomer.overall_lease_balance || 0;
      const newBalance = Math.max(0, currentBalance - amount);

      const { error } = await supabase
        .from("profiles")
        .update({ overall_lease_balance: newBalance })
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      toast.success(`Payment of ₹${amount.toFixed(2)} recorded successfully`);
      setPaymentDialog(false);
      setPaymentAmount("");
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast.error(error.message || "Failed to record payment");
    }
  };

  const openPaymentDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Customers Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer registrations and approvals
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold mb-2">No customers found</h3>
              <p className="text-sm text-muted-foreground">
                Customers will appear here once they register
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{customer.full_name}</h3>
                        {getStatusBadge(customer.approval_status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Phone: {customer.phone_number}</p>
                        <p>Address: {customer.address}</p>
                        <p className="text-xs">
                          Registered: {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                        {customer.overall_lease_balance > 0 && (
                          <p className="text-sm font-semibold text-primary mt-2">
                            Lease Balance: ₹{customer.overall_lease_balance.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {customer.approval_status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(customer.id, "approved")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(customer.id, "rejected")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {customer.overall_lease_balance > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPaymentDialog(customer)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {selectedCustomer?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Balance</Label>
                <p className="text-2xl font-bold text-primary">
                  ₹{selectedCustomer?.overall_lease_balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment}>
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
