import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, Check, X, MapPin, Clock, Users, Star } from "lucide-react";
import { TourPackage, TourCategory } from "../../../types";
import { StorageService } from "../../../services/storage";

interface PackagesModuleProps {
  onDataChanged: () => void;
}

export const PackagesModule: React.FC<PackagesModuleProps> = ({ onDataChanged }) => {
  const [packages, setPackages] = useState<TourPackage[]>(StorageService.getPackages());
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TourPackage | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [destination, setDestination] = useState("Coron, Palawan");
  const [category, setCategory] = useState<TourCategory>("Island Hopping");
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [pricePerPerson, setPricePerPerson] = useState(18500);
  const [maxCapacity, setMaxCapacity] = useState(12);
  const [imageUrl, setImageUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [featured, setFeatured] = useState(false);

  const openCreateModal = () => {
    setEditingPkg(null);
    setTitle("");
    setTagline("");
    setDestination("Coron, Palawan");
    setCategory("Island Hopping");
    setDurationDays(3);
    setDurationNights(2);
    setPricePerPerson(18500);
    setMaxCapacity(12);
    setImageUrl("https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&auto=format&fit=crop&q=80");
    setOverview("Comprehensive Philippine island expedition featuring chartered vessel and DOT certified field guidance.");
    setFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (pkg: TourPackage) => {
    setEditingPkg(pkg);
    setTitle(pkg.title);
    setTagline(pkg.tagline);
    setDestination(pkg.destination);
    setCategory(pkg.category);
    setDurationDays(pkg.durationDays);
    setDurationNights(pkg.durationNights);
    setPricePerPerson(pkg.pricePerPerson);
    setMaxCapacity(pkg.maxCapacity);
    setImageUrl(pkg.imageUrl);
    setOverview(pkg.overview);
    setFeatured(pkg.featured);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPkg) {
      const updated: TourPackage = {
        ...editingPkg,
        title,
        tagline,
        destination,
        category,
        durationDays,
        durationNights,
        pricePerPerson,
        maxCapacity,
        imageUrl,
        overview,
        featured,
      };
      StorageService.updatePackage(updated);
    } else {
      const newPkg: TourPackage = {
        id: `pkg-${Date.now().toString(36)}`,
        title,
        tagline,
        destination,
        islandGroup: destination.includes("Palawan") ? "Palawan" : destination.includes("Cebu") ? "Visayas" : "Luzon",
        category,
        durationDays,
        durationNights,
        pricePerPerson,
        downpaymentRequiredPercent: 30,
        maxCapacity,
        rating: 5.0,
        reviewCount: 1,
        imageUrl,
        galleryUrls: [imageUrl],
        overview,
        highlights: ["Chartered Outrigger Vessel", "DOT Licensed Master Guide", "Fresh Seafood Catch"],
        inclusions: ["All environmental and ancestral fees", "Buffet lunch & fresh coconut water", "Life vests & snorkeling masks"],
        exclusions: ["Domestic airfares", "Personal gratuities"],
        itinerary: [
          {
            day: 1,
            title: "Arrival & Coastal Check-in",
            activities: ["Airport transfer to harbor", "Safety briefing & life vest fitting", "Sunset lagoon cruise"],
            mealsIncluded: ["Dinner"],
          },
        ],
        featured,
        status: "Active",
      };
      StorageService.addPackage(newPkg);
    }

    setPackages(StorageService.getPackages());
    setModalOpen(false);
    onDataChanged();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you wish to delete this tour package?")) {
      StorageService.deletePackage(id);
      setPackages(StorageService.getPackages());
      onDataChanged();
    }
  };

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Tour Packages & Inventory Master
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Manage expedition itineraries, pricing tiers, inclusions, and capacity limits
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Expedition Package</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B1014] p-4 rounded-2xl border border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7C8B96] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages by title or destination..."
            className="w-full bg-[#070B0E] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
          />
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0E151A] text-[#7C8B96] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Expedition Title</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Price / Person</th>
                <th className="px-5 py-3.5">30% Downpayment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-medium text-[#F4F1EA] max-w-xs truncate">{pkg.title}</p>
                        <p className="text-[10px] text-[#7C8B96]">{pkg.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#D1CCC0]">{pkg.destination}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[#F4F1EA]">
                      {pkg.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#7C8B96]">
                    {pkg.durationDays}D / {pkg.durationNights}N
                  </td>
                  <td className="px-5 py-4 font-serif text-sm font-semibold text-[#F4F1EA]">
                    ₱{pkg.pricePerPerson.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-[#F26A4F] font-mono">
                    ₱{Math.round(pkg.pricePerPerson * 0.3).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D1CCC0] hover:text-white transition-colors cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#D1CCC0] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
            <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                {editingPkg ? "Edit Expedition Package" : "Create New Expedition Package"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#7C8B96] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Expedition Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Destination Region *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium">Tagline / Brief Hook</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TourCategory)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  >
                    <option value="Island Hopping">Island Hopping</option>
                    <option value="Adventure & Nature">Adventure & Nature</option>
                    <option value="Heritage & Culture">Heritage & Culture</option>
                    <option value="Luxury & Wellness">Luxury & Wellness</option>
                    <option value="City Tour">City Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Price / Person (₱) *</label>
                  <input
                    type="number"
                    required
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Max Pax Capacity</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Duration (Nights)</label>
                  <input
                    type="number"
                    value={durationNights}
                    onChange={(e) => setDurationNights(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium">Overview Description</label>
                <textarea
                  rows={3}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="feat-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#F26A4F]"
                />
                <label htmlFor="feat-checkbox" className="text-[#F4F1EA] font-medium">
                  Feature prominently on Traveler Homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white font-semibold"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
