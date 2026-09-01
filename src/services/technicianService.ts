import { supabase } from '../lib/supabaseClient';
import { Technician, TechnicianReview } from '../types/technician';
import { DEMO_TECHNICIANS } from '../data/demoTechnicians';

export async function fetchTechnicians(): Promise<Technician[]> {
  let baseTechnicians: Technician[] = [];

  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('featured', { ascending: false });

    if (!error && data && data.length > 0) {
      baseTechnicians = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        title: row.title,
        badgeId: row.badge_id || row.badgeId,
        experienceYears: Number(row.experience_years ?? row.experienceYears ?? 1),
        primarySector: row.primary_sector || row.primarySector,
        subSectors: row.sub_sectors || row.subSectors || [],
        photo: row.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
        rating: Number(row.rating ?? 5.0),
        reviewsCount: Number(row.reviews_count ?? row.reviewsCount ?? 0),
        completedJobs: Number(row.completed_jobs ?? row.completedJobs ?? 0),
        verificationStatus: row.verification_status || row.verificationStatus || 'verified',
        licenseNumber: row.license_number || row.licenseNumber || 'VERIFIED-LIC-001',
        issuingAuthority: row.issuing_authority || row.issuingAuthority || 'Govt. Electrical Board',
        status: row.status || 'available',
        statusText: row.status_text || row.statusText,
        phone: row.phone,
        email: row.email,
        whatsapp: row.whatsapp,
        emergencySupport: Boolean(row.emergency_support ?? row.emergencySupport),
        serviceAreas: row.service_areas || row.serviceAreas || [],
        workingHours: row.working_hours || row.workingHours || '08:00 AM - 08:00 PM',
        startingRate: Number(row.starting_rate ?? row.startingRate ?? 499),
        rateUnit: row.rate_unit || row.rateUnit || 'base inspection visit',
        about: row.about || '',
        aiDescription: row.ai_description || row.aiDescription,
        certifications: Array.isArray(row.certifications) ? row.certifications : [],
        skills: Array.isArray(row.skills) ? row.skills : [],
        toolsCarried: row.tools_carried || row.toolsCarried || [],
        recentReviews: Array.isArray(row.recent_reviews) ? row.recent_reviews : [],
        featured: Boolean(row.featured),
        joinedDate: row.joined_date || row.joinedDate
      }));
    } else if (error) {
      console.warn('[technicianService] Supabase query notice:', error.message);
    }
  } catch (err) {
    console.warn('[technicianService] Could not fetch from Supabase:', err);
    baseTechnicians = [];
  }

  // Enhance each technician with any server-persisted reviews
  try {
    const updated = await Promise.all(
      baseTechnicians.map(async (tech) => {
        try {
          const res = await fetch(`/api/technicians/${tech.id}/reviews`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
              const mergedReviews = [...data.reviews, ...tech.recentReviews];
              // De-duplicate by id
              const uniqueReviews = Array.from(
                new Map(mergedReviews.map((r) => [r.id, r])).values()
              );
              const totalRating = uniqueReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
              const avgRating = uniqueReviews.length > 0 ? totalRating / uniqueReviews.length : tech.rating;

              return {
                ...tech,
                recentReviews: uniqueReviews,
                reviewsCount: uniqueReviews.length,
                rating: Number(avgRating.toFixed(2))
              };
            }
          }
        } catch {
          // Keep base
        }
        return tech;
      })
    );
    return updated;
  } catch {
    return baseTechnicians;
  }
}

export async function fetchTechnicianById(id: string): Promise<Technician | null> {
  const all = await fetchTechnicians();
  return all.find((t) => t.id === id) || null;
}

export async function fetchTechnicianReviews(technicianId: string): Promise<TechnicianReview[]> {
  try {
    const res = await fetch(`/api/technicians/${technicianId}/reviews`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        return data.reviews;
      }
    }
  } catch (err) {
    console.warn('Error fetching server reviews for technician:', err);
  }
  return [];
}

export async function submitTechnicianReview(
  technicianId: string,
  reviewData: {
    customerName: string;
    area?: string;
    rating: number;
    comment: string;
    serviceType?: string;
  }
): Promise<{ success: boolean; message?: string; review?: TechnicianReview; reviews?: TechnicianReview[] }> {
  try {
    const res = await fetch(`/api/technicians/${technicianId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error submitting technician review:', err);
    return {
      success: false,
      message: err.message || 'Network error while submitting review'
    };
  }
}

export async function generateTechnicianDescription(tech: Partial<Technician>): Promise<string> {
  try {
    const res = await fetch('/api/technicians/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tech)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.description) {
        return data.description;
      }
    }
  } catch (err) {
    console.warn('AI description generator error:', err);
  }

  return `${tech.experienceYears || 5}+ years experienced ${tech.title || 'Specialist'} with verified expertise in ${
    tech.primarySector || 'electrical power systems'
  }.`;
}
