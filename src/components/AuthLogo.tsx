
import { Link } from 'react-router-dom'

const gamsajLogo = '/GamSaj Logo.png'

const AuthLogo = () => {
  return (
    <div className="auth-brand p-4 text-center">
      <Link to="/" className="logo-light">
        <img src={gamsajLogo} alt="GAMSAJ International Limited" style={{ maxHeight: '100px', width: 'auto' }} />
      </Link>
      <Link to="/" className="logo-dark">
        <img src={gamsajLogo} alt="GAMSAJ International Limited" style={{ maxHeight: '100px', width: 'auto' }} />
      </Link>
    </div>
  )
}
export default AuthLogo
