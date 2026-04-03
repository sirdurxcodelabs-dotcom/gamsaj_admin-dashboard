import { Link } from 'react-router-dom'

const AuthLogo = () => (
  <div className="mb-4">
    <Link to="/">
      <img
        src="/GamSaj Logo.png"
        alt="GAMSAJ International Limited"
        style={{ maxHeight: 80, width: 'auto', objectFit: 'contain' }}
      />
    </Link>
  </div>
)

export default AuthLogo
