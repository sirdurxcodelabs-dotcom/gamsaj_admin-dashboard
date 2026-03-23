import { useState } from 'react'

// Inline SVG default avatar — clean black silhouette, no external dependency
const DEFAULT_AVATAR_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23374151'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23d1d5db'/%3E%3Cellipse cx='20' cy='35' rx='12' ry='9' fill='%23d1d5db'/%3E%3C/svg%3E`

type UserAvatarProps = {
  src?: string | null
  alt?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders a user avatar with automatic fallback to a default SVG avatar.
 * Handles null, empty string, and broken image URLs gracefully.
 */
const UserAvatar = ({ src, alt = 'user', size = 32, className = 'rounded-circle', style }: UserAvatarProps) => {
  const [errored, setErrored] = useState(false)

  const imgSrc = !src || src.trim() === '' || errored ? DEFAULT_AVATAR_SVG : src

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      onError={() => setErrored(true)}
    />
  )
}

export default UserAvatar
