import { DateInput, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import { DateClickArg, Draggable } from '@fullcalendar/interaction'
import { useEffect, useState, useRef, useCallback } from 'react'
import { calendarAPI } from '@/services/api'
import { useSearchParams } from 'react-router-dom'

export type SubmitEventType = {
  title: string
  category: string
  description?: string
  type?: string
  priority?: string
  location?: string
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  isMultiDay?: boolean
  tasks?: Array<{ title: string; completed?: boolean }>
}

export type FilterState = {
  type: string
  priority: string
}

const useCalendar = () => {
  const [show, setShow] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [events, setEvents] = useState<EventInput[]>([])
  const [allEvents, setAllEvents] = useState<EventInput[]>([])
  const [eventData, setEventData] = useState<EventInput>()
  const [dateInfo, setDateInfo] = useState<DateClickArg>()
  const [filters, setFilters] = useState<FilterState>({ type: '', priority: '' })
  const isCreatingEvent = useRef(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const onOpenModal = () => setShow(true)

  const onCloseModal = () => {
    setEventData(undefined)
    setDateInfo(undefined)
    setShow(false)
    if (searchParams.has('eventId')) {
      searchParams.delete('eventId')
      setSearchParams(searchParams)
    }
  }

  const transformEvents = (rawEvents: any[]): EventInput[] =>
    rawEvents.map((event: any) => ({
      id: event._id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      backgroundColor: event.color || '#007bff',
      borderColor: event.color || '#007bff',
      extendedProps: {
        description: event.description,
        type: event.type,
        status: event.status,
        priority: event.priority,
        location: event.location,
        projectReference: event.projectReference,
        legalReference: event.legalReference,
        tasks: event.tasks || [],
        color: event.color || '#007bff',
      },
    }))

  const applyFilters = useCallback((evts: EventInput[], f: FilterState): EventInput[] =>
    evts.filter(e => {
      const props = e.extendedProps || {}
      if (f.type && props.type !== f.type) return false
      if (f.priority && props.priority !== f.priority) return false
      return true
    }), [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await calendarAPI.getEvents()
      if (response.data.success) {
        const transformed = transformEvents(response.data.data)
        setAllEvents(transformed)
        setEvents(applyFilters(transformed, filters))
        const eventIdFromUrl = searchParams.get('eventId')
        if (eventIdFromUrl) {
          const eventToOpen = transformed.find((e: EventInput) => e.id === eventIdFromUrl)
          if (eventToOpen) {
            setEventData(eventToOpen)
            setIsEditable(true)
            onOpenModal()
          }
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    setEvents(applyFilters(allEvents, filters))
  }, [filters, allEvents, applyFilters])

  useEffect(() => {
    const draggableEl = document.getElementById('external-events')
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.external-event',
        eventData: (eventEl) => {
          const str = eventEl.getAttribute('data-event')
          if (str) {
            const info = JSON.parse(str)
            return {
              title: info.title,
              backgroundColor: info.color,
              borderColor: info.color,
              extendedProps: { fromExternal: true, color: info.color },
            }
          }
          return null
        },
      })
    }
  }, [])

  const onDateClick = (arg: DateClickArg) => {
    setDateInfo(arg)
    onOpenModal()
    setIsEditable(false)
  }

  const onEventClick = (arg: EventClickArg) => {
    setEventData({
      id: String(arg.event.id),
      title: arg.event.title,
      start: arg.event.start ?? undefined,
      end: arg.event.end ?? undefined,
      extendedProps: arg.event.extendedProps,
    })
    setIsEditable(true)
    onOpenModal()
  }

  const onDrop = async (arg: any) => {
    if (isCreatingEvent.current) return
    try {
      isCreatingEvent.current = true
      const eventInfo = arg.event.extendedProps
      if (eventInfo?.fromExternal) {
        const dropDate = new Date(arg.event.start!)
        const start = new Date(dropDate); start.setHours(9, 0, 0, 0)
        const end = new Date(dropDate); end.setHours(17, 0, 0, 0)
        const response = await calendarAPI.createEvent({
          title: arg.event.title,
          description: '',
          type: 'other',
          priority: 'medium',
          location: '',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          color: eventInfo.color,
          status: 'pending',
          isAllDay: false,
          tasks: [],
        })
        if (response.data.success) {
          arg.event.remove()
          await fetchEvents()
        }
      }
    } catch (error) {
      console.error('Error creating event from drop:', error)
      arg.event.remove()
    } finally {
      setTimeout(() => { isCreatingEvent.current = false }, 500)
    }
  }

  const onAddEvent = async (data: SubmitEventType) => {
    try {
      let startDateTime: Date, endDateTime: Date
      if (data.isMultiDay) {
        startDateTime = new Date(`${data.startDate}T${data.startTime || '09:00'}:00`)
        endDateTime = new Date(`${data.endDate}T${data.endTime || '17:00'}:00`)
      } else {
        const dateStr = data.startDate || dateInfo?.dateStr || new Date().toISOString().split('T')[0]
        startDateTime = new Date(`${dateStr}T${data.startTime || '09:00'}:00`)
        endDateTime = new Date(`${dateStr}T${data.endTime || '17:00'}:00`)
      }
      const response = await calendarAPI.createEvent({
        title: data.title,
        description: data.description || '',
        type: data.type || 'other',
        priority: data.priority || 'medium',
        location: data.location || '',
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        color: data.category,
        status: 'pending',
        isAllDay: false,
        tasks: data.tasks || [],
      })
      if (response.data.success) {
        await fetchEvents()
        onCloseModal()
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    }
  }

  const onUpdateEvent = async (data: SubmitEventType) => {
    try {
      if (!eventData?.id) return
      let startDateTime: Date | undefined, endDateTime: Date | undefined
      if (data.isMultiDay && data.startDate && data.endDate) {
        startDateTime = new Date(`${data.startDate}T${data.startTime || '09:00'}:00`)
        endDateTime = new Date(`${data.endDate}T${data.endTime || '17:00'}:00`)
      } else if (data.startDate) {
        startDateTime = new Date(`${data.startDate}T${data.startTime || '09:00'}:00`)
        endDateTime = new Date(`${data.startDate}T${data.endTime || '17:00'}:00`)
      }
      const payload: any = {
        title: data.title,
        description: data.description || '',
        type: data.type || 'other',
        priority: data.priority || 'medium',
        location: data.location || '',
        color: data.category,
        tasks: data.tasks || [],
      }
      if (startDateTime) payload.startDate = startDateTime.toISOString()
      if (endDateTime) payload.endDate = endDateTime.toISOString()
      const response = await calendarAPI.updateEvent(String(eventData.id), payload)
      if (response.data.success) {
        await fetchEvents()
        onCloseModal()
        setIsEditable(false)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    }
  }

  const onRemoveEvent = async () => {
    try {
      if (!eventData?.id) return
      if (!confirm('Are you sure you want to delete this event?')) return
      const response = await calendarAPI.deleteEvent(String(eventData.id))
      if (response.data.success) {
        await fetchEvents()
        onCloseModal()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const onEventDrop = async (arg: EventDropArg) => {
    try {
      await calendarAPI.updateEvent(String(arg.event.id), {
        startDate: arg.event.start,
        endDate: arg.event.end || arg.event.start,
      })
      const updated = allEvents.map(e =>
        e.id === arg.event.id
          ? { ...e, start: (arg.event.start ?? undefined) as DateInput | undefined, end: (arg.event.end ?? undefined) as DateInput | undefined }
          : e
      )
      setAllEvents(updated)
      setEvents(applyFilters(updated, filters))
    } catch (error) {
      console.error('Error updating event:', error)
      arg.revert()
    }
  }

  const createNewEvent = () => { setIsEditable(false); onOpenModal() }
  const updateFilters = (f: Partial<FilterState>) => setFilters(prev => ({ ...prev, ...f }))
  const clearFilters = () => setFilters({ type: '', priority: '' })

  return {
    createNewEvent,
    show,
    loading,
    onDateClick,
    onEventClick,
    onDrop,
    onEventDrop,
    events,
    onCloseModal,
    isEditable,
    eventData,
    onUpdateEvent,
    onRemoveEvent,
    onAddEvent,
    fetchEvents,
    filters,
    updateFilters,
    clearFilters,
    totalCount: allEvents.length,
    filteredCount: events.length,
  }
}

export default useCalendar
