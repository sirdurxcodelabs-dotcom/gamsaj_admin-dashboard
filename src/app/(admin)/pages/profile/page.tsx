import { useRef, useState } from 'react'
import { Alert, Col, Nav, NavItem, NavLink, Row, Spinner, TabContainer, TabContent, TabPane } from 'react-bootstrap'
import profileBg from '@/assets/images/bg-profile.jpg'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import UserAvatar from '@/components/UserAvatar'
import { useProfile } from '@/hooks/useProfile'
import { useAuthContext } from '@/context/useAuthContext'
import { uploadAPI } from '@/services/api'
import AboutTab from './components/AboutTab'
import PermissionsTab from './components/PermissionsTab'
import ChangePasswordTab from './components/ChangePasswordTab'

const Profile = () => {
  const { profile, allPermissions, loading, updating, error, fetchProfile, fetchAllPermissions, updateProfile, changePassword } =
    useProfile()
  const { updateAvatar } = useAuthContext()
  const [activeTab, setActiveTab] = useState('about')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setErrorMessage(null)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setSuccessMessage(null)
  }

  const handleUpdateProfile = async (data: any) => {
    const result = await updateProfile(data)
    if (result.success) showSuccess(result.message)
    else showError(result.message)
    return result
  }

  const handleChangePassword = async (data: any) => {
    const result = await changePassword(data)
    if (result.success) showSuccess(result.message)
    else showError(result.message)
    return result
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type and size
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      showError('Only JPG, PNG, GIF, or WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be smaller than 5MB.')
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      setAvatarUploading(true)
      const res = await uploadAPI.uploadAvatar(file)
      if (res.data.success) {
        showSuccess('Profile picture updated successfully.')
        updateAvatar(res.data.data.url)  // update nav avatar instantly
        await fetchProfile()             // refresh full profile data
        setAvatarPreview(null)
      } else {
        showError(res.data.message || 'Upload failed')
        setAvatarPreview(null)
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Upload failed. Please try again.')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Alert variant="danger">
          <IconifyIcon icon="mdi:alert-circle" className="me-2" />
          {error || 'Failed to load profile'}
        </Alert>
      </div>
    )
  }

  const avatarSrc = avatarPreview || profile.avatar || undefined

  return (
    <>
      <PageTitle title="Profile" />
      <Row>
        <Col sm={12}>
          <div className="profile-bg-picture" style={{ backgroundImage: `url(${profileBg})`, backgroundPosition: 'bottom' }} />
          <div className="p-sm-3 p-0 profile-user">
            <Row className="g-2">
              {/* Sidebar */}
              <Col lg={3} className="d-none d-lg-block">
                {/* Avatar with upload */}
                <div className="profile-user-img p-2 text-start position-relative" style={{ display: 'inline-block' }}>
                  <UserAvatar src={avatarSrc} alt={profile.name} size={100} className="img-thumbnail rounded" style={{ width: 100, height: 100 }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    title="Change profile picture"
                    style={{
                      position: 'absolute', bottom: 8, right: 8,
                      background: '#1a73e8', border: 'none', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#fff',
                    }}
                  >
                    {avatarUploading
                      ? <Spinner size="sm" style={{ width: 14, height: 14 }} />
                      : <IconifyIcon icon="mdi:camera" style={{ fontSize: 14 }} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="text-start p-1 pt-2">
                  <h4 className="fs-17 ellipsis">{profile.name}</h4>
                  <p className="font-13">{profile.role.name}</p>
                  <p className="text-muted mb-0"><small>{profile.location || 'Location not set'}</small></p>
                </div>
                <div className="pt-3 ps-2">
                  <p className="text-muted mb-2 font-13"><strong>Full Name:</strong> <span className="ms-2">{profile.name}</span></p>
                  {profile.phone && <p className="text-muted mb-2 font-13"><strong>Mobile:</strong> <span className="ms-2">{profile.phone}</span></p>}
                  <p className="text-muted mb-2 font-13"><strong>Email:</strong> <span className="ms-2">{profile.email}</span></p>
                  {profile.location && <p className="text-muted mb-1 font-13"><strong>Location:</strong> <span className="ms-2">{profile.location}</span></p>}
                </div>
                {(profile.socialMedia?.facebook || profile.socialMedia?.twitter || profile.socialMedia?.instagram || profile.socialMedia?.linkedin) && (
                  <div className="text-start mt-4">
                    <h4>Follow On:</h4>
                    <div className="d-flex gap-2 mt-3">
                      {profile.socialMedia?.facebook && <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn px-2 py-1 btn-soft-primary"><IconifyIcon icon="mdi:facebook" /></a>}
                      {profile.socialMedia?.twitter && <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="btn px-2 py-1 btn-soft-info"><IconifyIcon icon="mdi:twitter" /></a>}
                      {profile.socialMedia?.instagram && <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="btn px-2 py-1 btn-soft-danger"><IconifyIcon icon="mdi:instagram" /></a>}
                      {profile.socialMedia?.linkedin && <a href={profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="btn px-2 py-1 btn-soft-primary"><IconifyIcon icon="mdi:linkedin" /></a>}
                    </div>
                  </div>
                )}
              </Col>

              {/* Main content */}
              <Col lg={9} className="bg-light-subtle">
                {successMessage && (
                  <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="m-3">
                    <IconifyIcon icon="mdi:check-circle" className="me-2" />{successMessage}
                  </Alert>
                )}
                {errorMessage && (
                  <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)} className="m-3">
                    <IconifyIcon icon="mdi:alert-circle" className="me-2" />{errorMessage}
                  </Alert>
                )}

                <div className="profile-content">
                  <TabContainer activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                    <Nav as="ul" justify className="nav-pills gap-0 p-3 text-center" role="tablist">
                      <NavItem as="li" className="mt-2">
                        <NavLink eventKey="about" className="fs-5 p-2">
                          <IconifyIcon icon="mdi:account" className="me-1" />About
                        </NavLink>
                      </NavItem>
                      <NavItem as="li" className="mt-2">
                        <NavLink eventKey="permissions" className="fs-5 p-2">
                          <IconifyIcon icon="mdi:shield-account" className="me-1" />Permissions
                        </NavLink>
                      </NavItem>
                      <NavItem as="li" className="mt-2">
                        <NavLink eventKey="password" className="fs-5 p-2">
                          <IconifyIcon icon="mdi:lock-reset" className="me-1" />Change Password
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent className="m-0 p-2 p-sm-4">
                      <TabPane eventKey="about">
                        <AboutTab profile={profile} onUpdate={handleUpdateProfile} updating={updating} />
                      </TabPane>
                      <TabPane eventKey="permissions">
                        <PermissionsTab profile={profile} allPermissions={allPermissions} onFetchPermissions={fetchAllPermissions} />
                      </TabPane>
                      <TabPane eventKey="password">
                        <ChangePasswordTab onChangePassword={handleChangePassword} updating={updating} />
                      </TabPane>
                    </TabContent>
                  </TabContainer>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Profile
