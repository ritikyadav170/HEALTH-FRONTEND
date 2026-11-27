import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import { MdAdd } from "react-icons/md";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MdOutlineRemoveRedEye, MdEdit, MdDelete } from "react-icons/md";
import BulkDoctorUpload from "../../components/BulkDoctorUpload";
import HospitalExportButton from "../../components/HospitalExportButton";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export default function DoctorsList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [blockedFilter, setBlockedFilter] = useState("");

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal states
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctors");
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await api.put(`/doctors/${id}/status`, {
        status: !currentStatus,
      });
      if (res.data.success) {
        toast.success(`Doctor ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchDoctors();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBlockToggle = async (id, currentBlockedStatus) => {
    try {
      const res = await api.put(`/doctors/${id}/status`, {
        isBlocked: !currentBlockedStatus,
      });
      if (res.data.success) {
        toast.success(`Doctor ${!currentBlockedStatus ? 'blocked' : 'unblocked'}`);
        fetchDoctors();
      }
    } catch (err) {
      toast.error("Failed to update block status");
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDocId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/doctors/${selectedDocId}`);
      toast.success("Doctor removed from your hospital");
      setIsDeleteModalVisible(false);
      setSelectedDocId(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove doctor");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Frontend Filtering
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      let matches = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = doc.Name?.toLowerCase().includes(query);
        const emailMatch = doc.email?.toLowerCase().includes(query);
        const phoneMatch = doc.mobile?.includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch) matches = false;
      }
      if (statusFilter !== "") {
        const isActive = statusFilter === "true";
        if (doc.status !== isActive) matches = false;
      }
      if (blockedFilter !== "") {
        const isBlocked = blockedFilter === "true";
        if (doc.isBlocked !== isBlocked) matches = false;
      }
      return matches;
    });
  }, [doctors, searchQuery, statusFilter, blockedFilter]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical Staff</h1>
          <p className="mt-2 text-slate-500 font-medium">Manage your medical staff and their availability.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <HospitalExportButton section="doctors" label="Export Doctors" />
          <BulkDoctorUpload onSuccess={fetchDoctors} />
          <Link
            to="/doctors/add"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-200"
          >
            <MdAdd className="text-xl" />
            Add Specialist
          </Link>
        </div>
      </div>
      <p className="-mt-5 mb-6 text-right text-xs font-medium text-slate-500">
        Bulk upload: CSV, Excel, or ZIP with an images folder
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by name, mobile, Email..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white text-slate-700"
              value={blockedFilter}
              onChange={(e) => setBlockedFilter(e.target.value)}
            >
              <option value="">All Block Status</option>
              <option value="true">Blocked</option>
              <option value="false">Unblocked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading medical staff...</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] table-auto divide-y divide-gray-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Completion %</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming (48h)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="w-24 px-3 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <MdAdd className="text-3xl" />
                      </div>
                      <p className="font-medium text-slate-600">No medical staff onboarded yet.</p>
                      <p className="text-sm mt-1">Click the button above to add your first specialist.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={doc.profileImage ? (() => {
                              if (doc.profileImage.startsWith("http")) return doc.profileImage;
                              if (doc.profileImage.startsWith("/public/")) return `${BASE_URL}${doc.profileImage}`;
                              return `${BASE_URL}/${doc.profileImage}`;
                            })() : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%239ca3af'/%3E%3Cpath d='M 50 200 Q 50 140 100 140 Q 150 140 150 200' fill='%239ca3af'/%3E%3C/svg%3E"}
                            alt={doc.Name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%239ca3af'/%3E%3Cpath d='M 50 200 Q 50 140 100 140 Q 150 140 150 200' fill='%239ca3af'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{doc.Name}</div>
                          <div className="text-xs font-medium text-slate-500 capitalize">{doc.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-100">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                      {Array.isArray(doc.categories) && doc.categories.length > 0
                        ? doc.categories.map((c) => (typeof c === "object" ? c?.name : c)).filter(Boolean).join(", ")
                        : doc.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{doc.email}</div>
                      <div className="text-xs font-medium text-slate-500">{doc.mobile}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full min-w-[60px] max-w-[100px] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (doc.profileCompletionPercent || 0) >= 100
                                ? "bg-emerald-500"
                                : (doc.profileCompletionPercent || 0) >= 75
                                  ? "bg-blue-500"
                                  : (doc.profileCompletionPercent || 0) >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${doc.profileCompletionPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 min-w-[35px]">
                          {doc.profileCompletionPercent || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                      {doc.upcomingAppointments48h || 0}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleBlockToggle(doc._id, doc.isBlocked)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${doc.isBlocked ? "bg-red-500" : "bg-slate-300"
                          }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${doc.isBlocked ? "translate-x-6" : "translate-x-1"
                          }`} />
                      </button>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleStatusToggle(doc._id, doc.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${doc.status ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${doc.status ? "translate-x-6" : "translate-x-1"
                          }`} />
                      </button>
                    </td>
                    <td className="w-24 px-3 py-5 whitespace-nowrap text-center text-sm font-medium">
                      <IconButton onClick={(e) => handleMenuOpen(e, doc._id)}>
                        <MoreVertIcon className="text-slate-400 hover:text-indigo-600" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { borderRadius: "12px", minWidth: "160px", mt: 1 }
          }
        }}
      >
        <MenuItem onClick={() => { navigate(`/doctors/view/${selectedDocId}`); handleMenuClose(); }} className="gap-3 py-2.5 text-indigo-600">
          <MdOutlineRemoveRedEye className="text-xl" /> View Details
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/doctors/edit/${selectedDocId}`); handleMenuClose(); }} className="gap-3 py-2.5 text-emerald-600">
          <MdEdit className="text-xl" /> Edit Profile
        </MenuItem>
        <MenuItem onClick={() => { setIsDeleteModalVisible(true); handleMenuClose(); }} className="gap-3 py-2.5 text-red-600">
          <MdDelete className="text-xl" /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="text-red-600">Delete Confirmation</DialogTitle>
        <DialogContent>
          <p className="py-2">Are you sure you want to delete this doctor? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteModalVisible(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleDeleteDoctor}
            disabled={deleteLoading}
            color="error" 
            variant="contained"
          >
            {deleteLoading ? "Removing..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
