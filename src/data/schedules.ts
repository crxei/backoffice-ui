export interface ScheduleProvider {
  id: string
  name: string
  specialty: string
}

export interface Schedule {
  scheduleId: string
  availableSlots: number
  planningHorizon: {
    start: string
    end: string
  }
  providers: ScheduleProvider[]
  serviceTypes: string[]
}

export interface ScheduleSummary {
  dateRange: {
    start: string
    end: string
  }
  totalAvailableSlots: number
  totalSchedules: number
}

export interface SchedulesData {
  schedules: Schedule[]
  summary: ScheduleSummary
}
