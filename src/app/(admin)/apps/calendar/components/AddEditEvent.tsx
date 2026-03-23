import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Col, Modal, ModalBody, ModalHeader, ModalTitle, Row, Form } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import * as yup from 'yup'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import SelectFormInput from '@/components/form/SelectFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import type { CalendarFormType } from '@/types/component-props'

const AddEditEvent = ({ eventData, isEditable, onAddEvent, onRemoveEvent, onUpdateEvent, open, toggle }: CalendarFormType) => {
  const [isMultiDay, setIsMultiDay] = useState(false)

  const eventFormSchema = yup.object({
    title: yup.string().required('Please enter event title'),
    description: yup.string(),
    type: yup.string().required('Please select event type'),
    priority: yup.string().required('Please select priority'),
    location: yup.string(),
    category: yup.string().required('Please select color'),
    startDate: yup.string(),
    startTime: yup.string(),
    endDate: yup.string(),
    endTime: yup.string(),
    tasks: yup.array().of(
      yup.object().shape({
        title: yup.string().required('Task title is required'),
      })
    ),
  })

  type FormValues = yup.InferType<typeof eventFormSchema>

  const { handleSubmit, control, setValue, reset } = useForm<FormValues>({
    resolver: yupResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'other',
      priority: 'medium',
      location: '',
      category: '#007bff',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '17:00',
      tasks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  })

  useEffect(() => {
    if (eventData) {
      setValue('title', String(eventData?.title || ''))
      setValue('description', String(eventData?.extendedProps?.description || ''))
      setValue('type', String(eventData?.extendedProps?.type || 'other'))
      setValue('priority', String(eventData?.extendedProps?.priority || 'medium'))
      setValue('location', String(eventData?.extendedProps?.location || ''))
      setValue('category', String(eventData?.className || '#007bff'))
      
      // Set tasks if available
      if (eventData?.extendedProps?.tasks && Array.isArray(eventData.extendedProps.tasks)) {
        setValue('tasks', eventData.extendedProps.tasks)
      }
      
      // Set dates if available
      if (eventData.start) {
        const startDate = new Date(eventData.start as any)
        setValue('startDate', startDate.toISOString().split('T')[0])
        setValue('startTime', startDate.toTimeString().slice(0, 5))
      }
      
      if (eventData.end) {
        const endDate = new Date(eventData.end as any)
        setValue('endDate', endDate.toISOString().split('T')[0])
        setValue('endTime', endDate.toTimeString().slice(0, 5))
        
        // Check if multi-day
        if (eventData.start && eventData.end) {
          const start = new Date(eventData.start as any)
          const end = new Date(eventData.end as any)
          const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          setIsMultiDay(daysDiff > 0)
        }
      }
    }
  }, [eventData])

  useEffect(() => {
    if (!open) {
      reset()
      setIsMultiDay(false)
    }
  }, [open])

  const onSubmitEvent = (data: any) => {
    const eventPayload = {
      ...data,
      isMultiDay,
    }
    isEditable ? onUpdateEvent(eventPayload) : onAddEvent(eventPayload)
  }

  const addTask = () => {
    append({ title: '' })
  }

  return (
    <Modal show={open} onHide={toggle} className="fade" tabIndex={-1} size="lg">
      <div className="modal-content">
        <form onSubmit={handleSubmit(onSubmitEvent)} className="needs-validation" name="event-form">
          <ModalHeader className="modal-header py-3 px-4 border-bottom-0" closeButton>
            <ModalTitle className="modal-title" as="h5">
              {isEditable ? 'Edit Event' : 'Add New Event'}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="px-4 pb-4 pt-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Row>
              <Col xs={12}>
                <TextFormInput 
                  control={control} 
                  name="title" 
                  containerClassName="mb-3" 
                  label="Event Title" 
                  placeholder="e.g., Construction Project - Building A" 
                />
              </Col>
              
              <Col xs={12}>
                <TextAreaFormInput
                  control={control}
                  name="description"
                  containerClassName="mb-3"
                  label="Description"
                  placeholder="Enter event description..."
                  rows={3}
                />
              </Col>

              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="type"
                  label="Event Type"
                  containerClassName="mb-3"
                  options={[
                    { value: 'project', label: 'Construction Project' },
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'deadline', label: 'Deadline' },
                    { value: 'inspection', label: 'Site Inspection' },
                    { value: 'delivery', label: 'Material Delivery' },
                    { value: 'legal', label: 'Legal/Compliance' },
                    { value: 'permit', label: 'Permit/License' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Col>

              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="priority"
                  label="Priority"
                  containerClassName="mb-3"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </Col>

              <Col xs={12}>
                <TextFormInput
                  control={control}
                  name="location"
                  containerClassName="mb-3"
                  label="Location"
                  placeholder="e.g., Site A, Lagos"
                />
              </Col>

              <Col xs={12}>
                <SelectFormInput
                  control={control}
                  name="category"
                  label="Color"
                  containerClassName="mb-3"
                  options={[
                    { value: '#dc3545', label: 'Red (Urgent)' },
                    { value: '#fd7e14', label: 'Orange (High Priority)' },
                    { value: '#ffc107', label: 'Yellow (Warning)' },
                    { value: '#28a745', label: 'Green (Success)' },
                    { value: '#007bff', label: 'Blue (Info)' },
                    { value: '#6c757d', label: 'Gray (Normal)' },
                    { value: '#17a2b8', label: 'Cyan (Meeting)' },
                    { value: '#6f42c1', label: 'Purple (Legal)' },
                  ]}
                />
              </Col>

              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="multi-day-check"
                  label="Multi-day event (spans multiple days)"
                  checked={isMultiDay}
                  onChange={(e) => setIsMultiDay(e.target.checked)}
                  className="mb-3"
                />
              </Col>

              {isMultiDay ? (
                <>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        {...control.register('startDate')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        {...control.register('startTime')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        {...control.register('endDate')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="time"
                        {...control.register('endTime')}
                      />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        {...control.register('startDate')}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        {...control.register('startTime')}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}

              {/* Tasks Section */}
              <Col xs={12}>
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <IconifyIcon icon="mdi:checkbox-marked-circle-outline" className="me-2" />
                    Tasks
                  </h6>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={addTask}
                    type="button"
                  >
                    <IconifyIcon icon="mdi:plus" className="me-1" />
                    Add Task
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-muted small mb-3">
                    No tasks added yet. Click "Add Task" to create a checklist for this event.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="mb-2">
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <Form.Control
                          type="text"
                          placeholder={`Task ${index + 1}`}
                          {...control.register(`tasks.${index}.title` as const)}
                        />
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => remove(index)}
                        type="button"
                      >
                        <IconifyIcon icon="mdi:delete" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
            <Row className="mt-3">
              <Col xs={6}>
                {isEditable && (
                  <button onClick={onRemoveEvent} type="button" className="btn btn-danger">
                    <IconifyIcon icon="mdi:delete" className="me-1" />
                    Delete Event
                  </button>
                )}
              </Col>
              <Col xs={6} className="text-end">
                <Button variant="light" type="button" className="me-1" onClick={toggle}>
                  Cancel
                </Button>
                <Button variant="success" type="submit">
                  <IconifyIcon icon={isEditable ? 'mdi:check' : 'mdi:plus'} className="me-1" />
                  {isEditable ? 'Update' : 'Create'} Event
                </Button>
              </Col>
            </Row>
          </ModalBody>
        </form>
      </div>
    </Modal>
  )
}

export default AddEditEvent
