import React, { useState, useMemo } from "react";
import { TourPackage } from "../../types";
import { Star, Clock, Users, MapPin, Check, X, ArrowRight, Utensils, Anchor, ShieldCheck } from "lucide-react";

interface TourCatalogProps {
  packages: TourPackage[];
  filterDestination: string;
  onBookPackage: (pkg: TourPackage) => void;
}

export const TourCatalog: React.FC<TourCatalogProps> = ({
  packages,
  filterDestination,
  onBookPackage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewPackage, setPreviewPackage] = useState<TourPackage | null>(null);

  const categories: string[] = [
    "All",
    "Island Hopping",
    "Adventure & Nature",
    "Heritage & Culture",
    "Luxury & Wellness",
    "City Tour",
  ];

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const matchCat = selectedCategory === "All" || pkg.category === selectedCategory;
      const matchDest =
        !filterDestination ||
        pkg.destination.toLowerCase().includes(filterDestination.toLowerCase()) ||
        pkg.title.toLowerCase().includes(filterDestination.toLowerCase());
      return matchCat && matchDest;
    });
  }, [packages, selectedCategory, filterDestination]);

  return (
    <section id="expeditions-catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold font-mono">
            Curated Archipelago Expeditions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold mt-1">
            Handcrafted Marine Charters &amp; Remote Sanctuaries
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Every itinerary incorporates private vessels, accredited DOT guides, ancestral territory clearances, and 30% slot reservations.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-500 text-[#030C16] shadow-md shadow-cyan-500/25 font-bold"
                  : "bg-[#071726] text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-200 border border-white/5"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((pkg) => {
          const downpayment = Math.round(pkg.pricePerPerson * 0.3);
          return (
            <div
              key={pkg.id}
              className="group bg-[#071726] border border-cyan-500/15 rounded-3xl overflow-hidden hover:border-cyan-400/50 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-xl hover:shadow-cyan-950/50"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071726] via-transparent to-black/30" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#030C16]/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white">
                    {pkg.category}
                  </span>
                  {pkg.featured && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500 text-[#030C16] text-[11px] font-bold shadow-md">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pkg.destination}</span>
                  </span>

                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-xl text-amber-300 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{pkg.rating} ({pkg.reviewCount})</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Clock className="w-3.5 h-3.5" />
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      Max {pkg.maxCapacity} Pax
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {pkg.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Highlights tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pkg.highlights.slice(0, 3).map((h, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#030C16] text-[10px] text-slate-300 border border-white/5"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Pricing & Reservation Action */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Standard Fare
                      </span>
                      <span className="font-serif text-2xl font-bold text-white">
                        ₱{pkg.pricePerPerson.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400"> / pax</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-cyan-400 font-bold block">
                        30% Reserve Slot
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        ₱{downpayment.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewPackage(pkg)}
                      className="px-3 py-2 rounded-xl bg-[#0B2238] hover:bg-[#0E2C48] text-xs text-slate-200 font-medium transition-colors cursor-pointer border border-white/5"
                    >
                      Itinerary
                    </button>
                    <button
                      onClick={() => onBookPackage(pkg)}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs text-[#030C16] font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Itinerary Preview Modal */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl my-8">
            {/* Header */}
            <div className="bg-[#0B2238] px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold font-mono">
                  Comprehensive Expedition Itinerary
                </span>
                <h3 className="font-serif text-2xl text-white font-bold">
                  {previewPackage.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPackage(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 md:p-8 max-h-[65vh] overflow-y-auto space-y-6 text-sm">
              <p className="text-slate-300 leading-relaxed">{previewPackage.overview}</p>

              {/* Day-by-day Itinerary */}
              <div className="space-y-4">
                <h4 className="font-serif text-lg text-white font-bold border-b border-white/10 pb-2">
                  Daily Expedition Sequence
                </h4>
                <div className="space-y-4">
                  {previewPackage.itinerary.map((day) => (
                    <div key={day.day} className="bg-[#030C16] p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                            {day.day}
                          </span>
                          <span>Day {day.day}: {day.title}</span>
                        </h5>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Utensils className="w-3.5 h-3.5 text-amber-400" />
                          <span>Meals: {day.mealsIncluded.join(", ")}</span>
                        </div>
                      </div>

                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                        {day.activities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-[#030C16] p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                  <h5 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Comprehensive Inclusions
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {previewPackage.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-rose-500/20 space-y-2">
                  <h5 className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Package Exclusions
                  </h5>
                  <ul className="space-y-1.5 text-slate-400">
                    {previewPackage.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#0B2238] px-6 py-4 border-t border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">From</span>
                <span className="font-serif text-xl font-bold text-white ml-1">
                  ₱{previewPackage.pricePerPerson.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400"> / pax</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewPackage(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const chosen = previewPackage;
                    setPreviewPackage(null);
                    onBookPackage(chosen);
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Reserve with 30% Downpayment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
