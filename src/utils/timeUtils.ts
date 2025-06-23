import moment from 'moment';

interface TimeSlot {
  date: string;
  fullTime: string;
  start_time: string;
  end_time: string;
  availability_type_id: string;
  is_holiday: boolean;
  available: boolean;
  selected: boolean;
}

interface TimeConfig {
  Id: string;
  CatServiceId: string;
  CatSpecialtyId: string;
  StartTime: string;
  EndTime: string;
  CatAvailabilityTypeId: string;
  ServiceProviderId: string;
  StartDate: string;
  EndDate: string;
  OrganizationId: string;
  ShowCareProviderInfo: boolean;
  ServiceProviderHolidays: string | null;
  UnavailableStartdate: string | null;
  UnavailableEnddate: string | null;
  UnavailableStartTime: string | null;
  UnavailableEndTime: string | null;
  BookedSlots: any[];
}

// Convert 24-hour time to 12-hour format
export const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert UTC to local timezone
export const convertUTCToLocalTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): { date: string; time: string } => {
  const utcDateTime = new Date(`${dateString}T${timeString}:00Z`);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const localDateTimeString = utcDateTime.toLocaleString('en-US', options);
  const [localDate, localTime] = localDateTimeString.split(', ');
  const [month, day, year] = localDate.split('/');
  const [hour, minute] = localTime.split(':');

  return {
    date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  };
};

// Generate time slots for a specific date only
export const generateSlotsForDate = (
  config: TimeConfig,
  targetDate: string, // YYYY-MM-DD format
  slotDurationMinutes: number = 60,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const {
    StartTime,
    EndTime,
    StartDate,
    EndDate,
    CatAvailabilityTypeId,
  } = config;

  // Check if target date is within the valid range
  const targetDateObj = new Date(targetDate);
  const startDateObj = new Date(StartDate);
  const endDateObj = new Date(EndDate);
  
  if (targetDateObj < startDateObj || targetDateObj > endDateObj) {
    return []; // Target date is outside the valid range
  }

  const holidays = config.ServiceProviderHolidays || '';
  const holidaySet = holidays ? new Set(holidays.split(',')) : new Set();

  // Convert UTC times to local timezone for the target date
  const startLocal = convertUTCToLocalTimezone(StartDate, StartTime, targetTimeZone);
  const endLocal = convertUTCToLocalTimezone(EndDate, EndTime, targetTimeZone);

  const [rangeStartHour, rangeStartMinute] = startLocal.time.split(':').map(Number);
  const [rangeEndHour, rangeEndMinute] = endLocal.time.split(':').map(Number);

  const rangeStartTotalMinutes = rangeStartHour * 60 + rangeStartMinute;
  let rangeEndTotalMinutes = rangeEndHour * 60 + rangeEndMinute;

  const isOvernight = rangeStartTotalMinutes > rangeEndTotalMinutes;
  if (isOvernight) {
    rangeEndTotalMinutes += 1440; // Add 24 hours in minutes
  }

  const slots: TimeSlot[] = [];
  const dayName = targetDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const isHoliday = holidaySet.has(dayName);

  // Generate slots for the specific date only
  let currentTotalMinutes = 0;
  const maxIterations = 1440 / slotDurationMinutes; // 24 hours worth of slots

  for (let i = 0; i < maxIterations; i++) {
    const nextTotalMinutes = currentTotalMinutes + slotDurationMinutes;

    const formatTime = (totalMinutes: number): string => {
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const startTimeStr = formatTime(currentTotalMinutes);
    const endTimeStr = formatTime(nextTotalMinutes);
    const start12Hour = convertTo12Hour(startTimeStr);
    const end12Hour = convertTo12Hour(endTimeStr);

    let slotMinutes = currentTotalMinutes;
    if (isOvernight && slotMinutes < rangeStartTotalMinutes) {
      slotMinutes += 1440;
    }

    const isAvailable = !isHoliday && (
      slotMinutes >= rangeStartTotalMinutes && slotMinutes < rangeEndTotalMinutes
    );

    slots.push({
      date: targetDate,
      fullTime: startTimeStr,
      start_time: start12Hour,
      end_time: end12Hour,
      availability_type_id: CatAvailabilityTypeId,
      is_holiday: isHoliday,
      available: isAvailable,
      selected: false
    });

    currentTotalMinutes = nextTotalMinutes;
  }

  return slots;
};

// Optimized version of getUniqueAvailableSlots
export const getUniqueAvailableSlotsOptimized = (
  schedules: TimeConfig[],
  slotTime: number,
  selectedDate: string,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
  
  // Generate slots only for the selected date from all schedules
  const mergedSlots = schedules.flatMap(config => 
    generateSlotsForDate(config, formattedDate, slotTime, targetTimeZone)
  );
  
  const uniqueSlots: TimeSlot[] = [];
  const seenSlots = new Set<string>();

  mergedSlots.forEach(slot => {
    const key = `${slot.fullTime}`;
    if (!seenSlots.has(key)) {
      seenSlots.add(key);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots.sort((a, b) => {
    const fullTimeA = `${a.date} ${a.fullTime}`;
    const fullTimeB = `${b.date} ${b.fullTime}`;
    return new Date(fullTimeA).getTime() - new Date(fullTimeB).getTime();
  });
};

// Keep the original function for backward compatibility (but mark as deprecated)
/**
 * @deprecated Use generateSlotsForDate instead for better performance
 */
export const generateSlots = (
  config: any,
  slotDurationMinutes: number = 60,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const {
    StartTime,
    EndTime,
    StartDate,
    EndDate,
    CatAvailabilityTypeId,
  } = config;

  const holidays = config.ServiceProviderHolidays || '';

  const generateDynamicSlots = (): TimeSlot[] => {
    const startLocal = convertUTCToLocalTimezone(StartDate, StartTime, targetTimeZone);
    const endLocal = convertUTCToLocalTimezone(EndDate, EndTime, targetTimeZone);

    const [rangeStartHour, rangeStartMinute] = startLocal.time.split(':').map(Number);
    const [rangeEndHour, rangeEndMinute] = endLocal.time.split(':').map(Number);

    const rangeStartTotalMinutes = rangeStartHour * 60 + rangeStartMinute;
    let rangeEndTotalMinutes = rangeEndHour * 60 + rangeEndMinute;

    const isOvernight = rangeStartTotalMinutes > rangeEndTotalMinutes;
    if (isOvernight) {
      rangeEndTotalMinutes += 1440;
    }

    const slots: TimeSlot[] = [];
    const startDateObj = new Date(startLocal.date);
    const endDateObj = new Date(endLocal.date);
    let currentDate = new Date(startDateObj);
    const holidaySet = holidays ? new Set(holidays.split(',')) : new Set();

    while (currentDate <= endDateObj) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const isHoliday = holidaySet.has(dayName);
      const formattedDate = currentDate.toISOString().split('T')[0];

      let currentTotalMinutes = 0;
      const maxIterations = 1440 / slotDurationMinutes;

      for (let i = 0; i < maxIterations; i++) {
        const nextTotalMinutes = currentTotalMinutes + slotDurationMinutes;

        const formatTime = (totalMinutes: number): string => {
          const hours = Math.floor(totalMinutes % 1440 / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        const startTimeStr = formatTime(currentTotalMinutes);
        const endTimeStr = formatTime(nextTotalMinutes);
        const start12Hour = convertTo12Hour(startTimeStr);
        const end12Hour = convertTo12Hour(endTimeStr);

        let slotMinutes = currentTotalMinutes;
        if (isOvernight && slotMinutes < rangeStartTotalMinutes) {
          slotMinutes += 1440;
        }

        const isAvailable = !isHoliday && (
          slotMinutes >= rangeStartTotalMinutes && slotMinutes < rangeEndTotalMinutes
        );

        slots.push({
          date: formattedDate,
          fullTime: startTimeStr,
          start_time: start12Hour,
          end_time: end12Hour,
          availability_type_id: CatAvailabilityTypeId,
          is_holiday: isHoliday,
          available: isAvailable,
          selected: false
        });

        currentTotalMinutes = nextTotalMinutes;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  };

  return generateDynamicSlots();
};

// Keep original function for backward compatibility
export const getUniqueAvailableSlots = (
  schedules: TimeConfig[],
  slotTime: number,
  selectedDate: string
): TimeSlot[] => {
  const mergedSlots = schedules.flatMap(obj => generateSlots(obj, slotTime));
  
  const uniqueSlots: TimeSlot[] = [];
  const seenSlots = new Set<string>();
  
  const filteredSlots = mergedSlots.filter(obj => 
    obj.date === moment(selectedDate).format('YYYY-MM-DD')
  );

  filteredSlots.forEach(slot => {
    const key = `${slot.fullTime}`;
    if (!seenSlots.has(key)) {
      seenSlots.add(key);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots.sort((a, b) => {
    const fullTimeA = `${a.date} ${a.fullTime}`;
    const fullTimeB = `${b.date} ${b.fullTime}`;
    return new Date(fullTimeA).getTime() - new Date(fullTimeB).getTime();
  });
};