import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg, type DropArg } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import bootstrapPlugin from '@fullcalendar/bootstrap'

import type { CalendarProps } from '@/types/component-props'
import type { EventClickArg, EventDropArg } from '@fullcalendar/core/index.js'

const Calendar = ({ events, onDateClick, onDrop, onEventClick, onEventDrop }: CalendarProps) => {
  // You can modify these events as per your needs
  const handleDateClick = (arg: DateClickArg) => {
    onDateClick(arg)
  }
  const handleEventClick = (arg: EventClickArg) => {
    onEventClick(arg)
  }
  const handleDrop = (arg: DropArg) => {
    onDrop(arg)
  }
  const handleEventDrop = (arg: EventDropArg) => {
    onEventDrop(arg)
  }

  return (
    <div className="mt-4 mt-lg-0">
      <div id="calendar">
        <FullCalendar
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, bootstrapPlugin]}
          themeSystem="bootstrap"
          bootstrapFontAwesome={false}
          handleWindowResize={true}
          slotDuration="00:15:00"
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
            prev: 'Prev',
            next: 'Next',
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
          }}
          dayMaxEventRows={2}
          editable={true}
          selectable={true}
          droppable={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          drop={handleDrop}
          eventDrop={handleEventDrop}
          eventDisplay="block"
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          eventClassNames={() => {
            return [`event-custom-color`]
          }}
          eventDidMount={(info) => {
            // Read color from extendedProps (stored as hex) or backgroundColor
            const color = info.event.extendedProps?.color || info.event.backgroundColor || '#007bff'
            const isMultiDay = info.event.end && info.event.start &&
              (new Date(info.event.end).getDate() !== new Date(info.event.start).getDate() ||
               new Date(info.event.end).getMonth() !== new Date(info.event.start).getMonth())

            info.el.style.backgroundColor = color
            info.el.style.borderColor = color
            info.el.style.color = '#ffffff'
            info.el.style.borderRadius = '4px'
            info.el.style.fontSize = '0.875rem'
            info.el.style.fontWeight = '500'
            info.el.style.cursor = 'pointer'
            info.el.style.border = 'none'
            info.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'

            if (isMultiDay) {
              info.el.style.padding = '6px 8px'
              info.el.style.minHeight = '32px'
              info.el.style.fontWeight = '600'
              const icon = document.createElement('i')
              icon.className = 'mdi mdi-calendar-range me-1'
              icon.style.fontSize = '14px'
              const titleEl = info.el.querySelector('.fc-event-title')
              if (titleEl) titleEl.prepend(icon)
            } else {
              info.el.style.padding = '4px 6px'
            }

            info.el.addEventListener('mouseenter', () => {
              info.el.style.opacity = '0.85'
              info.el.style.transform = 'translateY(-1px)'
              info.el.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
            })
            info.el.addEventListener('mouseleave', () => {
              info.el.style.opacity = '1'
              info.el.style.transform = 'translateY(0)'
              info.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            })
          }}
        />
      </div>
    </div>
  )
}

export default Calendar
