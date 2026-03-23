import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { timeSince } from '@/utils/date'
import { Link, useNavigate } from 'react-router-dom'
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { notificationsAPI } from '@/services/api'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  eventId?: {
    _id: string
    title: string
    type: string
    status: string
    startDate: string
    endDate: string
  }
  userId: string
  isRead: boolean
  readAt?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  soundPlayed: boolean
  metadata?: any
  createdAt: string
  updatedAt: string
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastNotificationIdRef = useRef<string | null>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getRecent(10)
      const newNotifications = response.data.data
      const newUnreadCount = response.data.unreadCount

      // Play sound if there's a new unread notification
      if (newNotifications.length > 0 && notifications.length > 0) {
        const latestNotification = newNotifications[0]
        if (
          !latestNotification.isRead &&
          !latestNotification.soundPlayed &&
          latestNotification._id !== lastNotificationIdRef.current
        ) {
          playNotificationSound()
          lastNotificationIdRef.current = latestNotification._id
          // Mark sound as played
          await notificationsAPI.markSoundPlayed(latestNotification._id)
        }
      }

      setNotifications(newNotifications)
      setUnreadCount(newUnreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing notification sound:', error)
      })
    }
  }

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      await notificationsAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification._id)
    
    // Navigate to calendar with eventId parameter
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      setIsOpen(false)
    } else if (notification.eventId) {
      // Fallback: navigate to calendar with eventId query param
      navigate(`/apps/calendar?eventId=${notification.eventId._id}`)
      setIsOpen(false)
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string, _priority: string) => {
    switch (type) {
      case 'event_reminder':
        return 'ri:calendar-event-fill'
      case 'event_overdue':
        return 'ri:alarm-warning-fill'
      case 'task_completed':
        return 'ri:checkbox-circle-fill'
      default:
        return 'ri:notification-3-fill'
    }
  }

  // Get variant based on priority
  const getVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'primary'
    }
  }

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return timeSince(date)
  }

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />

      <Dropdown className="notification-list" show={isOpen} onToggle={setIsOpen}>
        <DropdownToggle
          className="nav-link arrow-none"
          as={'a'}
          role="button"
          aria-haspopup="false"
          aria-expanded="false"
        >
          <IconifyIcon icon="ri:notification-3-line" className="fs-22" />
          {unreadCount > 0 && (
            <span className="noti-icon-badge badge text-bg-pink">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end dropdown-menu-animated py-0" style={{ width: '380px', maxWidth: '95vw' }}>
          {/* Header */}
          <div className="p-3 border-bottom bg-light">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-15 fw-semibold d-flex align-items-center gap-2">
                  <IconifyIcon icon="ri:notification-badge-fill" className="text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </h6>
              </Col>
              <Col xs="auto">
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleMarkAllAsRead()
                    }}
                    className="btn btn-sm btn-link text-decoration-none p-0"
                    disabled={loading}
                  >
                    <small className="text-primary fw-semibold">
                      {loading ? 'Clearing...' : 'Mark all read'}
                    </small>
                  </button>
                )}
              </Col>
            </Row>
          </div>

          {/* Notifications List */}
          <SimplebarReactClient style={{ maxHeight: '420px', overflowX: 'hidden' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <IconifyIcon 
                    icon="ri:notification-off-line" 
                    className="fs-1 text-muted" 
                    style={{ fontSize: '4rem', opacity: 0.3 }}
                  />
                </div>
                <h6 className="text-muted mb-1">No notifications yet</h6>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <div className="p-0">
                {notifications.map((notification) => {
                  const variant = getVariant(notification.priority)
                  const icon = getNotificationIcon(notification.type, notification.priority)

                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`notification-item p-3 border-bottom ${
                        !notification.isRead ? 'bg-light-subtle' : ''
                      }`}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = !notification.isRead
                          ? 'rgba(0, 123, 255, 0.02)'
                          : 'transparent'
                      }}
                    >
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: '#0d6efd',
                          }}
                        />
                      )}

                      <div className="d-flex align-items-start gap-3" style={{ paddingLeft: !notification.isRead ? '8px' : '0' }}>
                        {/* Icon */}
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: `var(--bs-${variant}-bg-subtle)`,
                            border: `2px solid var(--bs-${variant})`,
                          }}
                        >
                          <IconifyIcon
                            icon={icon}
                            className={`text-${variant}`}
                            style={{ fontSize: '1.3rem' }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                            <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
                              {notification.title}
                            </h6>
                            {!notification.isRead && (
                              <span
                                className="badge bg-primary flex-shrink-0"
                                style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                              >
                                NEW
                              </span>
                            )}
                          </div>

                          <p
                            className="text-muted mb-2"
                            style={{
                              fontSize: '0.85rem',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {notification.message}
                          </p>

                          {/* Event info */}
                          {notification.eventId && (
                            <div
                              className="d-flex align-items-center gap-2 mb-2 p-2 rounded"
                              style={{
                                backgroundColor: 'rgba(0, 123, 255, 0.05)',
                                fontSize: '0.8rem',
                              }}
                            >
                              <IconifyIcon icon="ri:calendar-line" className="text-primary" />
                              <span className="text-truncate" style={{ wordBreak: 'break-word' }}>
                                {notification.eventId.title}
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                            <IconifyIcon icon="ri:time-line" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SimplebarReactClient>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-top bg-light">
              <Link
                to="/apps/calendar"
                className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.85rem' }}
              >
                <IconifyIcon icon="ri:eye-line" />
                View All Notifications
              </Link>
            </div>
          )}
        </DropdownMenu>
      </Dropdown>
    </>
  )
}

export default NotificationDropdown
