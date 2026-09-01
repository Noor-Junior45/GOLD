import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Phone,
  MessageCircle,
  Share2,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Technician, TechnicianReview } from '../../types/technician';
import { fetchTechnicianById, submitTechnicianReview } from '../../services/technicianService';
import { showToast } from '../../utils/toast';
import { hapticLight, hapticMedium, hapticSelection } from '../../utils/haptics';

interface TechnicianDetailPageProps {
  technician?: Technician | null;
  onBack?: () => void;
}

export const TechnicianDetailPage: React.FC<TechnicianDetailPageProps> = ({
  technician: propTechnician,
  onBack: propOnBack
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tech, setTech] = useState<Technician | null>(propTechnician || null);
  const [isLoading, setIsLoading] = useState(!propTechnician);
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'reviews'>('overview');

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerArea, setCustomerArea] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewsList, setReviewsList] = useState<TechnicianReview[]>([]);

  useEffect(() => {
    if (propTechnician) {
      setTech(propTechnician);
      setReviewsList(propTechnician.recentReviews || []);
      setIsLoading(false);
      return;
    }

    if (id) {
      setIsLoading(true);
      fetchTechnicianById(id)
        .then((data) => {
          if (data) {
            setTech(data);
            setReviewsList(data.recentReviews || []);
          }
        })
        .catch((err) => {
          console.warn('Error loading technician:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, propTechnician]);

  const handleBack = () => {
    hapticLight();
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/technicians');
    }
  };

  const handleShare = async () => {
    hapticLight();
    const shareData = {
      title: `${tech?.name} - Verified Technician`,
      text: `View profile and credentials of ${tech?.name} (${tech?.title}) on Giriraj Power.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', 'success');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tech) return;

    if (!customerName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please enter your review feedback', 'error');
      return;
    }

    setIsSubmittingReview(true);
    hapticMedium();

    try {
      const res = await submitTechnicianReview(tech.id, {
        customerName: customerName.trim(),
        area: customerArea.trim() || 'Kolkata',
        rating: reviewRating,
        comment: reviewComment.trim(),
        serviceType: serviceType.trim() || tech.primarySector || 'Service Visit'
      });

      if (res.success && res.review) {
        const updatedList = [res.review, ...reviewsList];
        setReviewsList(updatedList);

        // Update overall tech rating in local view
        const totalRating = updatedList.reduce((sum, r) => sum + Number(r.rating || 5), 0);
        const newAvg = Number((totalRating / updatedList.length).toFixed(2));
        setTech((prev) =>
          prev
            ? {
                ...prev,
                rating: newAvg,
                reviewsCount: updatedList.length,
                recentReviews: updatedList
              }
            : null
        );

        showToast('Review submitted and saved to server successfully!', 'success');
        setCustomerName('');
        setCustomerArea('');
        setServiceType('');
        setReviewComment('');
        setReviewRating(5);
      } else {
        showToast(res.message || 'Failed to save review', 'error');
      }
    } catch {
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading technician profile...</p>
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Technician Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested technician profile could not be located or has been updated.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-sm"
          >
            Back to Technicians
          </button>
        </div>
      </div>
    );
  }

  const shortDescription =
    tech.aiDescription ||
    `${tech.experienceYears}+ years experienced ${tech.title.toLowerCase()} specialized in ${
      tech.subSectors?.[0] || tech.primarySector
    } with verified field expertise across Kolkata.`;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Sticky Navigation [Clean & Borderless] */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {tech.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {tech.title}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Share profile"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Main ID Details Hero Card [Borderless Design] */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7 text-center sm:text-left">
            {/* Left Photo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shrink-0 bg-slate-100 shadow-sm">
              <img
                src={tech.photo}
                alt={tech.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Beside Photo Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {tech.name}
              </h2>

              <p className="text-sm font-semibold text-slate-700">
                {tech.title}
                {tech.primarySector ? ` • ${tech.primarySector}` : ''}
              </p>

              {/* Rating, Experience, Jobs Done [Borderless text] */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-600 font-medium flex-wrap pt-1">
                <span className="text-amber-500 font-bold">★ {tech.rating.toFixed(1)}</span>
                <span className="text-slate-400">({reviewsList.length} reviews)</span>
                <span className="text-slate-300">·</span>
                <span>{tech.experienceYears}+ Yrs Exp</span>
                <span className="text-slate-300">·</span>
                <span>{tech.completedJobs}+ Jobs Done</span>
              </div>

              {/* Gemini Smart Short Description [Borderless text] */}
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                {shortDescription}
              </p>

              {/* License and Authority info */}
              <p className="text-[11px] text-slate-400 pt-1">
                License: <span className="font-semibold text-slate-600">{tech.licenseNumber}</span> · {tech.issuingAuthority}
              </p>
            </div>
          </div>

          {/* Quick Action Contact Row [Borderless] */}
          <div className="mt-6 pt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {tech.workingHours}
            </div>

            <div className="flex items-center gap-2.5">
              {tech.phone && (
                <a
                  href={`tel:${tech.phone}`}
                  onClick={() => hapticMedium()}
                  className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Technician</span>
                </a>
              )}

              {tech.whatsapp && (
                <a
                  href={`https://wa.me/${tech.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${tech.name}, I would like to consult regarding electrical/technician service via Giriraj Power.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => hapticMedium()}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher [Clean & Borderless] */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              hapticSelection();
              setActiveTab('overview');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white shadow-2xs'
            }`}
          >
            Overview & Skills
          </button>
          <button
            type="button"
            onClick={() => {
              hapticSelection();
              setActiveTab('certifications');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'certifications'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white shadow-2xs'
            }`}
          >
            Certifications ({tech.certifications.length})
          </button>
          <button
            type="button"
            onClick={() => {
              hapticSelection();
              setActiveTab('reviews');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white shadow-2xs'
            }`}
          >
            Reviews ({reviewsList.length})
          </button>
        </div>

        {/* Tab 1: OVERVIEW [Borderless] */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* About / Full Bio */}
            <div className="bg-white rounded-3xl p-6 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                About & Experience
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {tech.about}
              </p>
            </div>

            {/* Sub-specialties */}
            {tech.subSectors && tech.subSectors.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Specialized Areas of Work
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tech.subSectors.map((sub, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 text-slate-800 text-xs font-medium rounded-xl flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills Competency */}
            {tech.skills && tech.skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Technical Competencies
                </h3>
                <div className="space-y-3">
                  {tech.skills.map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        <span className="font-bold text-slate-900">{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {tech.serviceAreas && tech.serviceAreas.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Active Service Areas in Kolkata
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tech.serviceAreas.join(' • ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: CERTIFICATIONS & TOOLS [Borderless] */}
        {activeTab === 'certifications' && (
          <div className="space-y-5">
            {/* Certifications List */}
            <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Government & Professional Certifications
              </h3>
              <div className="space-y-3">
                {tech.certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {cert.title}
                        </h4>
                        {cert.verified && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className="text-[11px] font-mono text-slate-400">ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Tools */}
            {tech.toolsCarried && tech.toolsCarried.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Calibrated Equipment Carried On-Site
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tech.toolsCarried.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl text-xs font-medium text-slate-800 flex items-center gap-2.5"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: REVIEWS & SERVER SUBMISSION [Borderless] */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Live Rating Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {tech.rating.toFixed(1)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(tech.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Based on {reviewsList.length} verified reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive "Write a Review" Form [Saved to Server] */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Write a Review
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share your experience with {tech.name}. Your review is saved to the server.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleAddReview} className="space-y-4 pt-1">
                {/* Rating Stars Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          hapticLight();
                          setReviewRating(star);
                        }}
                        className="p-1 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                        title={`${star} Stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-all ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400 scale-110'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {reviewRating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name and Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Subhajit Roy"
                      required
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Area / Location
                    </label>
                    <input
                      type="text"
                      value={customerArea}
                      onChange={(e) => setCustomerArea(e.target.value)}
                      placeholder="e.g. Salt Lake Sector V"
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Executed
                  </label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="e.g. Solar Inverter Setup / MCB Tripping Diagnostic"
                    className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Review Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the technician handled the work, punctuality, and quality..."
                    rows={3}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Server...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review to Server</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List of Reviews [Clean & Borderless] */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 px-1">
                Client Service Reviews ({reviewsList.length})
              </h3>

              {reviewsList.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-500 shadow-xs">
                  No reviews yet for this technician. Be the first to leave a verified review above!
                </div>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl p-5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {rev.customerName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {rev.area} {rev.serviceType ? `• ${rev.serviceType}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rev.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {rev.verifiedJob && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Service Execution</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
