import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import UserAvatar from '@/components/UserAvatar'
import { useAuthContext } from '@/context/useAuthContext'

const ProfileDropdown = () => {
  const { removeSession, lockSession, user } = useAuthContext()
  const navigate = useNavigate()

  const logout = () => {
    removeSession()
    navigate('/auth/logout')
  }

  const displayName = user?.name || 'User'
  const userEmail = user?.email || ''

  return (
    <Dropdown>
      <DropdownToggle as="a" className="nav-link arrow-none nav-user" role="button" aria-haspopup="false" aria-expanded="false">
        <span className="account-user-avatar">
          <UserAvatar src={user?.avatar} alt={displayName} size={32} />
        </span>
        <span className="d-lg-block d-none">
          <h5 className="my-0 fw-normal">
            {displayName}
            <IconifyIcon icon="ri:arrow-down-s-line" className="fs-22 d-none d-sm-inline-block align-middle" />
          </h5>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end dropdown-menu-animated profile-dropdown">
        <DropdownHeader className="noti-title">
          <h6 className="text-overflow m-0">Welcome {displayName}!</h6>
          {userEmail && <small className="text-muted">{userEmail}</small>}
        </DropdownHeader>
        <Link to="/pages/profile" className="dropdown-item">
          <IconifyIcon icon="ri:account-pin-circle-line" className="fs-16 align-middle me-1" />
          <span>My Account</span>
        </Link>
        <DropdownItem onClick={lockSession}>
          <IconifyIcon icon="ri:lock-line" className="fs-16 align-middle me-1" />
          <span>Lock Screen</span>
        </DropdownItem>
        <DropdownItem onClick={logout}>
          <IconifyIcon icon="ri:logout-circle-r-line" className="align-middle me-1" />
          <span>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
