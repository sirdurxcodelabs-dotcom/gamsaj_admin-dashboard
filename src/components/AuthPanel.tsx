// Shared construction-themed right panel for all auth pages
const IMAGES = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80', // crane/construction
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80', // building site
  'https://images.unsplash.com/photo-1590644365607-5f3e8e7e3b3e?w=900&q=80', // infrastructure
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80', // construction workers
]

interface Props {
  imageIndex?: number
  headline?: string
  sub?: string
}

const AuthPanel = ({ imageIndex = 0, headline = "Building Nigeria's Infrastructure", sub = 'Civil Engineering · Real Estate · Industrial Construction' }: Props) => {
  const img = IMAGES[imageIndex % IMAGES.length]
  return (
    <div
      style={{
        backgroundImage: `url('${img}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '2.5rem',
      }}
    >
      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)',
      }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <span className="badge px-3 py-2 mb-3" style={{ background: '#fd7e14', fontSize: 12 }}>
          GAMSAJ International Limited
        </span>
        <h2 className="text-white fw-bold mb-2" style={{ lineHeight: 1.3 }}>{headline}</h2>
        <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{sub}</p>
      </div>
    </div>
  )
}

export default AuthPanel
