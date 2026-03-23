import { Col, Spinner } from 'react-bootstrap'
import SidePanel from './SidePanel'
import Calendar from './Calendar'
import useCalendar from '../useCalendar'
import AddEditEvent from './AddEditEvent'

const CalendarPage = () => {
  const {
    createNewEvent,
    eventData,
    events,
    loading,
    isEditable,
    onAddEvent,
    onCloseModal,
    onDateClick,
    onDrop,
    onEventClick,
    onEventDrop,
    onRemoveEvent,
    onUpdateEvent,
    show,
    filters,
    updateFilters,
    clearFilters,
    totalCount,
    filteredCount,
  } = useCalendar()

  if (loading && events.length === 0) {
    return (
      <Col xs={12} className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading calendar events...</p>
      </Col>
    )
  }

  return (
    <>
      <Col lg={3}>
        <SidePanel
          createNewEvent={createNewEvent}
          filters={filters}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      </Col>

      <Col lg={9}>
        <Calendar events={events} onDateClick={onDateClick} onDrop={onDrop} onEventClick={onEventClick} onEventDrop={onEventDrop} />
      </Col>

      <AddEditEvent
        eventData={eventData}
        isEditable={isEditable}
        onAddEvent={onAddEvent}
        onRemoveEvent={onRemoveEvent}
        onUpdateEvent={onUpdateEvent}
        open={show}
        toggle={onCloseModal}
      />
    </>
  )
}
export default CalendarPage
