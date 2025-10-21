import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddPastCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    password: "",
    leaseBalance: "",
    monthlyAmount: "",
    nextPaymentDate: "",
    notes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.phoneNumber || !formData.password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Create a temporary email for the user (required by Supabase Auth)
      const tempEmail = `${formData.phoneNumber}@lakshmi.app`;
      const customerPassword = formData.password;

      // Use the admin_create_user function to create user without switching auth context
      const { data: newUserId, error: createUserError } = await supabase.rpc('admin_create_user' as any, {
        user_email: tempEmail,
        user_password: customerPassword,
        user_phone: formData.phoneNumber,
        user_name: formData.fullName,
        user_address: formData.address
      });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        throw new Error(`Failed to create user: ${createUserError.message}`);
      }

      if (!newUserId) {
        throw new Error("Failed to create user - no user ID returned");
      }
      
      // Update profile with approval and lease balance
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          approval_status: 'approved',
          overall_lease_balance: parseFloat(formData.leaseBalance || '0')
        })
        .eq("id", newUserId as string);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      // If there's lease data, create a lease agreement
      if (formData.leaseBalance && parseFloat(formData.leaseBalance) > 0) {
        const { error: leaseError } = await supabase
          .from("lease_agreements")
          .insert({
            customer_id: newUserId as string,
            order_id: null, // Past customer, no order reference
            total_amount: parseFloat(formData.leaseBalance),
            monthly_amount: parseFloat(formData.monthlyAmount || '0'),
            remaining_balance: parseFloat(formData.leaseBalance),
            next_payment_date: formData.nextPaymentDate || null,
            status: 'active'
          });

        if (leaseError) {
          console.error("Lease agreement error:", leaseError);
          throw new Error(`Failed to create lease agreement: ${leaseError.message}. Please ensure you have run the database migration to allow NULL order_id.`);
        }
      }

      toast.success(`Past customer added successfully! Customer can log in with phone: ${formData.phoneNumber} and the password you set.`);
      navigate("/admin/customers");
    } catch (error: any) {
      console.error("Error adding past customer:", error);
      toast.error(error.message || "Failed to add past customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Add Past Customer</h2>
            <p className="text-muted-foreground mt-1">
              Add existing customers with their lease history
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/customers")}>
            Back to Customers
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set password for customer login"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This password will be used by the customer to log in with their phone number.
                  </p>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter customer's address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Lease Details */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Lease Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="leaseBalance">Current Lease Balance (₹)</Label>
                    <Input
                      id="leaseBalance"
                      name="leaseBalance"
                      type="number"
                      step="0.01"
                      value={formData.leaseBalance}
                      onChange={handleInputChange}
                      placeholder="Enter outstanding balance"
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthlyAmount">Monthly Payment Amount (₹)</Label>
                    <Input
                      id="monthlyAmount"
                      name="monthlyAmount"
                      type="number"
                      step="0.01"
                      value={formData.monthlyAmount}
                      onChange={handleInputChange}
                      placeholder="Enter monthly payment amount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
                    <Input
                      id="nextPaymentDate"
                      name="nextPaymentDate"
                      type="date"
                      value={formData.nextPaymentDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes about this customer or lease"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/customers")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding Customer..." : "Add Customer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
