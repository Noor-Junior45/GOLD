import { KolkataArea } from '../types';

export const KOLKATA_AREAS: KolkataArea[] = [
  { name: 'Ezra Street / Burrabazar', pincode: '700001', zone: 'Central', hub: 'Central Ezra Hub', deliveryMinutes: 30, serviceable: true, lat: 22.5744, lng: 88.3547, exactStreet: 'Ezra Street, Burrabazar' },
  { name: 'Park Street / Camac Street', pincode: '700016', zone: 'Central', hub: 'Central Ezra Hub', deliveryMinutes: 40, serviceable: true, lat: 22.5512, lng: 88.3533, exactStreet: 'Park Street, Camac Street' },
  { name: 'Salt Lake Sector I / II / III', pincode: '700064', zone: 'East', hub: 'Salt Lake Sector V Hub', deliveryMinutes: 45, serviceable: true, lat: 22.5867, lng: 88.4178, exactStreet: 'Sector I / II / III, Salt Lake' },
  { name: 'Salt Lake Sector V (IT Hub)', pincode: '700091', zone: 'East', hub: 'Salt Lake Sector V Hub', deliveryMinutes: 35, serviceable: true, lat: 22.5735, lng: 88.4331, exactStreet: 'Sector V, Salt Lake' },
  { name: 'New Town Action Area I', pincode: '700156', zone: 'East', hub: 'New Town Express Hub', deliveryMinutes: 45, serviceable: true, lat: 22.5898, lng: 88.4682, exactStreet: 'Major Arterial Road, Action Area I, New Town' },
  { name: 'New Town Action Area II & III', pincode: '700135', zone: 'East', hub: 'New Town Express Hub', deliveryMinutes: 50, serviceable: true, lat: 22.6045, lng: 88.4879, exactStreet: 'Action Area II & III, New Town' },
  { name: 'Rajarhat / Chinar Park', pincode: '700136', zone: 'East', hub: 'New Town Express Hub', deliveryMinutes: 45, serviceable: true, lat: 22.6284, lng: 88.4485, exactStreet: 'Rajarhat Main Road, Chinar Park' },
  { name: 'Ballygunge / Gariahat', pincode: '700019', zone: 'South', hub: 'Gariahat South Hub', deliveryMinutes: 40, serviceable: true, lat: 22.5195, lng: 88.3653, exactStreet: 'Rashbehari Avenue, Gariahat' },
  { name: 'Bhowanipore / Elgin Road', pincode: '700025', zone: 'South', hub: 'Gariahat South Hub', deliveryMinutes: 40, serviceable: true, lat: 22.5354, lng: 88.3478, exactStreet: 'Elgin Road, Bhowanipore' },
  { name: 'Alipore / New Alipore', pincode: '700027', zone: 'South', hub: 'Gariahat South Hub', deliveryMinutes: 45, serviceable: true, lat: 22.5186, lng: 88.3308, exactStreet: 'Alipore Road, New Alipore' },
  { name: 'Garia / Patuli / EM Bypass South', pincode: '700084', zone: 'South', hub: 'Garia South Hub', deliveryMinutes: 50, serviceable: true, lat: 22.4645, lng: 88.3842, exactStreet: 'EM Bypass, Patuli, Garia' },
  { name: 'Jadavpur / Tollygunge', pincode: '700032', zone: 'South', hub: 'Gariahat South Hub', deliveryMinutes: 45, serviceable: true, lat: 22.4988, lng: 88.3698, exactStreet: 'Raja SC Mullick Road, Jadavpur' },
  { name: 'Behala / Taratala', pincode: '700034', zone: 'South', hub: 'Taratala Hub', deliveryMinutes: 50, serviceable: true, lat: 22.5023, lng: 88.3187, exactStreet: 'Diamond Harbour Road, Behala' },
  { name: 'Shyambazar / Bagbazar', pincode: '700004', zone: 'North', hub: 'North Dum Dum Hub', deliveryMinutes: 45, serviceable: true, lat: 22.6033, lng: 88.3721, exactStreet: 'Bidhan Sarani, Shyambazar' },
  { name: 'Dum Dum / Nagerbazar / Airport', pincode: '700028', zone: 'North', hub: 'North Dum Dum Hub', deliveryMinutes: 50, serviceable: true, lat: 22.6322, lng: 88.4067, exactStreet: 'Jessore Road, Dum Dum' },
  { name: 'Howrah / Shibpur / Mandirtala', pincode: '711101', zone: 'West', hub: 'Howrah Bridge West Hub', deliveryMinutes: 55, serviceable: true, lat: 22.5855, lng: 88.3312, exactStreet: 'Grand Trunk Road, Howrah' },
  { name: 'Topsia / Tangra / EM Bypass North', pincode: '700046', zone: 'East', hub: 'Salt Lake Sector V Hub', deliveryMinutes: 40, serviceable: true, lat: 22.5441, lng: 88.3892, exactStreet: 'EM Bypass North, Topsia, Tangra' },
  { name: 'Lake Town / Bangur Avenue', pincode: '700089', zone: 'North', hub: 'North Dum Dum Hub', deliveryMinutes: 45, serviceable: true, lat: 22.6078, lng: 88.4019, exactStreet: 'VIP Road, Lake Town, Bangur' }
];

export const KOLKATA_PINCODE_RANGE_MIN = 700001;
export const KOLKATA_PINCODE_RANGE_MAX = 711106;

export function isKolkataServiceable(pincode: string): boolean {
  const pinNum = parseInt(pincode.trim(), 10);
  if (isNaN(pinNum)) return false;
  // Check exact list or valid range (700001 - 700160 Kolkata Municipal/Metropolitan & 711101-711106 Howrah)
  return (pinNum >= 700001 && pinNum <= 700160) || (pinNum >= 711101 && pinNum <= 711106);
}

export function getKolkataAreaByPincode(pincode: string): KolkataArea | undefined {
  const clean = pincode.trim();
  return KOLKATA_AREAS.find((a) => a.pincode === clean);
}

export function checkKolkataDeliveryService(pincode: string): {
  isServiceable: boolean;
  areaName: string;
  deliveryMins: number;
  hub: string;
  message: string;
} {
  const clean = pincode.trim();
  if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return {
      isServiceable: false,
      areaName: '',
      deliveryMins: 0,
      hub: '',
      message: 'Please enter a valid 6-digit PIN code.'
    };
  }

  const matchedArea = getKolkataAreaByPincode(clean);
  const serviceable = isKolkataServiceable(clean);

  if (serviceable) {
    const areaName = matchedArea ? matchedArea.name : 'Kolkata Metropolitan Area';
    const hub = matchedArea ? matchedArea.hub : 'Giriraj Power Kasba Kolkata Warehouse Hub';
    const deliveryMins = matchedArea ? matchedArea.deliveryMinutes : 60;
    return {
      isServiceable: true,
      areaName,
      deliveryMins,
      hub,
      message: `Express Delivery Available in ${areaName}`
    };
  }

  return {
    isServiceable: false,
    areaName: '',
    deliveryMins: 0,
    hub: '',
    message: 'Currently, Giriraj Power delivers exclusively across Kolkata & Howrah (PIN 700001–700160 & 711101–711106). Delivery is not available for this area.'
  };
}
