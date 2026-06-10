// Natural numerical sort function (B5532 -> 5532, B10087 -> 10087)
function naturalNumericalSort(arr) {
  return [...arr].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}

// Format Turno Label dynamically (e.g. Día 03, Noche 03-04)
function formatTurnoLabel(fechaStr, timeStr) {
  if (!fechaStr || !timeStr || timeStr === '—') return 'Día';
  
  const dateParts = fechaStr.split('-');
  if (dateParts.length !== 3) return 'Día';
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  
  const currentDate = new Date(year, month, day);
  
  const timeParts = timeStr.split(':');
  const hour = parseInt(timeParts[0], 10);
  if (isNaN(hour)) return 'Día';
  
  const formattedDay = (d) => String(d).padStart(2, '0');
  
  if (hour >= 8 && hour < 20) {
    return `☀️ Día ${formattedDay(day)}`;
  } else {
    if (hour >= 20) {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      return `🌙 Noche ${formattedDay(day)}-${formattedDay(tomorrow.getDate())}`;
    } else {
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      return `🌙 Noche ${formattedDay(yesterday.getDate())}-${formattedDay(day)}`;
    }
  }
}

// Calculate supervisor (Jefe de Turno) based on date and time from Ciclos_JT.md rotation
function calculateSupervisor(fechaStr, timeStr) {
  if (!fechaStr || !timeStr || timeStr === '—') return 'Sin asignar';

  // Parse time
  const timeParts = timeStr.split(':');
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10) || 0;
  if (isNaN(hour)) return 'Sin asignar';

  // Parse date
  const dateParts = fechaStr.split('-');
  if (dateParts.length !== 3) return 'Sin asignar';
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  const targetDate = new Date(year, month, day, hour, minute, 0);
  if (isNaN(targetDate.getTime())) return 'Sin asignar';

  const isDayShift = hour >= 8 && hour < 20;

  // Rotation data from Ciclos_JT.md
  const shiftCycles = [
    { start: "2025-12-31T20:00:00", end: "2026-01-07T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-01-07T20:00:00", end: "2026-01-14T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-01-14T20:00:00", end: "2026-01-21T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-01-21T20:00:00", end: "2026-01-28T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-01-28T20:00:00", end: "2026-02-04T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-02-04T20:00:00", end: "2026-02-11T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-02-11T20:00:00", end: "2026-02-18T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-02-18T20:00:00", end: "2026-02-25T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-02-25T20:00:00", end: "2026-03-04T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-03-04T20:00:00", end: "2026-03-11T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-03-11T20:00:00", end: "2026-03-18T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-03-18T20:00:00", end: "2026-03-25T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-03-25T20:00:00", end: "2026-04-01T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-04-01T20:00:00", end: "2026-04-08T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-04-08T20:00:00", end: "2026-04-15T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-04-15T20:00:00", end: "2026-04-22T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-04-22T20:00:00", end: "2026-04-29T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-04-29T20:00:00", end: "2026-05-06T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-05-06T20:00:00", end: "2026-05-13T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-05-13T20:00:00", end: "2026-05-20T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-05-20T20:00:00", end: "2026-05-27T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-05-27T20:00:00", end: "2026-06-03T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-06-03T20:00:00", end: "2026-06-10T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday *(Actual)*" },
    { start: "2026-06-10T20:00:00", end: "2026-06-17T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-06-17T20:00:00", end: "2026-06-24T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-06-24T20:00:00", end: "2026-07-01T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-07-01T20:00:00", end: "2026-07-08T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-07-08T20:00:00", end: "2026-07-15T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-07-15T20:00:00", end: "2026-07-22T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-07-22T20:00:00", end: "2026-07-29T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-07-29T20:00:00", end: "2026-08-05T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-08-05T20:00:00", end: "2026-08-12T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-08-12T20:00:00", end: "2026-08-19T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-08-19T20:00:00", end: "2026-08-26T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-08-26T20:00:00", end: "2026-09-02T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-09-02T20:00:00", end: "2026-09-09T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-09-09T20:00:00", end: "2026-09-16T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-09-16T20:00:00", end: "2026-09-23T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-09-23T20:00:00", end: "2026-09-30T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-09-30T20:00:00", end: "2026-10-07T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-10-07T20:00:00", end: "2026-10-14T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-10-14T20:00:00", end: "2026-10-21T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-10-21T20:00:00", end: "2026-10-28T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-10-28T20:00:00", end: "2026-11-04T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-11-04T20:00:00", end: "2026-11-11T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-11-11T20:00:00", end: "2026-11-18T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-11-18T20:00:00", end: "2026-11-25T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-11-25T20:00:00", end: "2026-12-02T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-12-02T20:00:00", end: "2026-12-09T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" },
    { start: "2026-12-09T20:00:00", end: "2026-12-16T20:00:00", noche: "David Henriquez", dia: "Juan Carrasco" },
    { start: "2026-12-16T20:00:00", end: "2026-12-23T20:00:00", noche: "Juan Cifuentes", dia: "Victor Alday" },
    { start: "2026-12-23T20:00:00", end: "2026-12-30T20:00:00", noche: "Juan Carrasco", dia: "David Henriquez" },
    { start: "2026-12-30T20:00:00", end: "2027-01-06T20:00:00", noche: "Victor Alday", dia: "Juan Cifuentes" }
  ];

  // 1. Try to find a match in the explicit range
  for (const cycle of shiftCycles) {
    const startDate = new Date(cycle.start);
    const endDate = new Date(cycle.end);
    if (targetDate >= startDate && targetDate < endDate) {
      return isDayShift ? cycle.dia : cycle.noche;
    }
  }

  // 2. Extrapolate future dates past Jan 06, 2027 (Wednesday 20:00)
  const anchorDate = new Date("2027-01-06T20:00:00");
  if (targetDate >= anchorDate) {
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const diffMs = targetDate.getTime() - anchorDate.getTime();
    const weeksPassed = Math.floor(diffMs / msInWeek);
    
    // Cycle patterns continuing standard module 4 week cycle
    const pattern = [
      { noche: "David Henriquez", dia: "Juan Carrasco" }, // Week 0
      { noche: "Juan Cifuentes", dia: "Victor Alday" },   // Week 1
      { noche: "Juan Carrasco", dia: "David Henriquez" }, // Week 2
      { noche: "Victor Alday", dia: "Juan Cifuentes" }    // Week 3
    ];
    
    const weekIndex = weeksPassed % 4;
    const currentWeekPattern = pattern[weekIndex];
    return isDayShift ? currentWeekPattern.dia : currentWeekPattern.noche;
  }

  // 3. Extrapolate past dates before Dec 31, 2025 (Wednesday 20:00)
  const pastAnchorDate = new Date("2025-12-31T20:00:00");
  if (targetDate < pastAnchorDate) {
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const diffMs = pastAnchorDate.getTime() - targetDate.getTime();
    const weeksPassed = Math.floor(diffMs / msInWeek) + 1;
    
    const pattern = [
      { noche: "Victor Alday", dia: "Juan Cifuentes" }, // Week 0 (4 weeks ago)
      { noche: "Juan Carrasco", dia: "David Henriquez" }, // 1 week ago
      { noche: "Juan Cifuentes", dia: "Victor Alday" },   // 2 weeks ago
      { noche: "David Henriquez", dia: "Juan Carrasco" }  // 3 weeks ago
    ];
    
    const weekIndex = weeksPassed % 4;
    const currentWeekPattern = pattern[weekIndex];
    return isDayShift ? currentWeekPattern.dia : currentWeekPattern.noche;
  }

  return 'Sin asignar';
}

module.exports = {
  naturalNumericalSort,
  formatTurnoLabel,
  calculateSupervisor
};
