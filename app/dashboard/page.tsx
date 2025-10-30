"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdLogout,
  MdPerson,
  MdMenu,
  MdArrowUpward,
  MdArrowDownward,
  MdVisibility,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { visitorApi } from "@/lib/api";
import { Visitor } from "@/lib/types";

type SortField =
  | "name"
  | "organisation"
  | "mobileNumber"
  | "purposeOfVisit"
  | "dateCreated"
  | "timeIn";
type SortOrder = "asc" | "desc";

const fetcher = async () => {
  const response = await visitorApi.getAll();
  return response.data;
};

export default function DashboardPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      toast.error("Please login to access the dashboard");
      router.push("/login");
    }
  }, [router]);

  const { data, error, isLoading, mutate } = useSWR<Visitor[]>(
    "visitors",
    fetcher
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [viewingVisitor, setViewingVisitor] = useState<Visitor | null>(null);
  const [deletingVisitorId, setDeletingVisitorId] = useState<number | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("dateCreated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    tagNumber: "",
    name: "",
    organisation: "",
    mobileNumber: "",
    whomToSee: "",
    purposeOfVisit: "",
    signIn: "yes",
  });

  const visitors = data || [];

  const resetForm = () => {
    setFormData({
      tagNumber: "",
      name: "",
      organisation: "",
      mobileNumber: "",
      whomToSee: "",
      purposeOfVisit: "",
      signIn: "yes",
    });
    setEditingVisitor(null);
  };

  const handleAddVisitor = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditVisitor = (visitor: Visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      tagNumber: visitor.tagNumber,
      name: visitor.name,
      organisation: visitor.organisation,
      mobileNumber: visitor.mobileNumber,
      whomToSee: visitor.whomToSee,
      purposeOfVisit: visitor.purposeOfVisit,
      signIn: visitor.signIn,
    });
    setIsDialogOpen(true);
  };

  const handleViewVisitor = (visitor: Visitor) => {
    setViewingVisitor(visitor);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingVisitorId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingVisitorId !== null) {
      try {
        const response = await visitorApi.signOut(deletingVisitorId, "yes");

        if (response.responseCode === "00") {
          toast.success("Visitor signed out successfully!");
          mutate(); // Revalidate data
          setIsDeleteDialogOpen(false);
          setDeletingVisitorId(null);
        } else {
          toast.error(response.responseMessage || "Failed to sign out visitor");
        }
      } catch (error) {
        console.error("Failed to sign out visitor:", error);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Note: API doesn't support update, only add
      const response = await visitorApi.add(formData);

      if (response.responseCode === "00") {
        toast.success("Visitor added successfully!");
        mutate(); // Revalidate data
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.responseMessage || "Failed to add visitor");
      }
    } catch (error) {
      console.error("Failed to save visitor:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort and paginate visitors
  const sortedVisitors = useMemo(() => {
    const sorted = [...visitors].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [visitors, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedVisitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisitors = sortedVisitors.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <MdArrowUpward className="w-4 h-4 inline ml-1" />
    ) : (
      <MdArrowDownward className="w-4 h-4 inline ml-1" />
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">Failed to load visitors data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <MdMenu className="w-6 h-6 text-gray-600" />
              </button>
              <Image
                src="/images/logo.png"
                alt="XPRESS Payment Solutions"
                width={120}
                height={48}
                priority
              />
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MdLogout className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage and track all your visitors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : visitors.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdPerson className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Today&apos;s Visits
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : visitors.filter((v) => {
                          const today = new Date().toISOString().split("T")[0];
                          return v.dateCreated.startsWith(today);
                        }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Meetings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : visitors.filter(
                          (v) => v.purposeOfVisit === "Business Meeting"
                        ).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : visitors.filter((v) => v.purposeOfVisit === "Interview")
                          .length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, visitors.length)} of {visitors.length}{" "}
                visitors
              </>
            )}
          </div>
          <Button
            onClick={handleAddVisitor}
            className="bg-green-700 hover:bg-green-800 h-11"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Add Visitor
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="py-2 px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/N</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("name")}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("organisation")}
                    >
                      Organisation <SortIcon field="organisation" />
                    </TableHead>
                    <TableHead
                      className="hidden sm:table-cell cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("mobileNumber")}
                    >
                      Phone <SortIcon field="mobileNumber" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("purposeOfVisit")}
                    >
                      Purpose <SortIcon field="purposeOfVisit" />
                    </TableHead>
                    <TableHead
                      className="hidden lg:table-cell cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("dateCreated")}
                    >
                      Date <SortIcon field="dateCreated" />
                    </TableHead>
                    <TableHead
                      className="hidden lg:table-cell cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("timeIn")}
                    >
                      Time In <SortIcon field="timeIn" />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        Loading visitors...
                      </TableCell>
                    </TableRow>
                  ) : currentVisitors.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No visitors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentVisitors.map((visitor, index) => (
                      <TableRow key={visitor.vistorId}>
                        <TableCell className="text-gray-600">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {visitor.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {visitor.organisation}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {visitor.mobileNumber}
                        </TableCell>
                        <TableCell>{visitor.purposeOfVisit}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(visitor.dateCreated).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {visitor.timeIn}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewVisitor(visitor)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-0 shadow-none h-8 px-3"
                            >
                              <MdVisibility className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditVisitor(visitor)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 border-0 shadow-none h-8 px-3"
                              disabled
                              title="Edit not available - API only supports add"
                            >
                              <MdEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(visitor.vistorId)
                              }
                              className="bg-red-100 hover:bg-red-200 text-red-700 border-0 shadow-none h-8 px-3"
                              title="Sign out visitor"
                            >
                              <MdDelete className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-green-700 hover:bg-green-800"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVisitor ? "Edit Visitor" : "Add New Visitor"}
            </DialogTitle>
            <DialogDescription>
              {editingVisitor
                ? "Update the visitor information below."
                : "Fill in the details to add a new visitor."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tagNumber">
                  Tag Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tagNumber"
                  value={formData.tagNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tagNumber: e.target.value })
                  }
                  placeholder="Enter tag number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter visitor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organisation">
                  Organisation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="organisation"
                  value={formData.organisation}
                  onChange={(e) =>
                    setFormData({ ...formData, organisation: e.target.value })
                  }
                  placeholder="Enter organisation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whomToSee">
                  Whom to See <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="whomToSee"
                  value={formData.whomToSee}
                  onChange={(e) =>
                    setFormData({ ...formData, whomToSee: e.target.value })
                  }
                  placeholder="Person to visit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purposeOfVisit">
                  Purpose of Visit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={(e) =>
                    setFormData({ ...formData, purposeOfVisit: e.target.value })
                  }
                  placeholder="Enter purpose of visit"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingVisitor ? "Update" : "Add"}{" "}
                Visitor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visitor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visitor? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
            <DialogDescription>
              Complete information about the visitor
            </DialogDescription>
          </DialogHeader>
          {viewingVisitor && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">
                  Tag Number:
                </div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.tagNumber}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">Name:</div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.name}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">
                  Organisation:
                </div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.organisation}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">Mobile:</div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.mobileNumber}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">
                  Whom to See:
                </div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.whomToSee}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">
                  Purpose:
                </div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.purposeOfVisit}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">Date:</div>
                <div className="col-span-2 text-sm text-gray-900">
                  {new Date(viewingVisitor.dateCreated).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-gray-600">
                  Time In:
                </div>
                <div className="col-span-2 text-sm text-gray-900">
                  {viewingVisitor.timeIn}
                </div>
              </div>
              {viewingVisitor.timeOut && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Time Out:
                  </div>
                  <div className="col-span-2 text-sm text-gray-900">
                    {viewingVisitor.timeOut}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-green-700 hover:bg-green-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
