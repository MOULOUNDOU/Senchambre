import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout as logoutUser } from '../services/authService';
import { getComparison } from '../services/comparisonService';
import { Notifications } from './Notifications';

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);

  useEffect(() => {
    // Charger l'utilisateur au montage
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setComparisonCount(getComparison().length);

    // Écouter les changements de localStorage pour mettre à jour l'état
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      setComparisonCount(getComparison().length);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      if (updatedUser?.id !== user?.id) {
        setUser(updatedUser);
      }
      setComparisonCount(getComparison().length);
    }, 1000);

    // Fermer le menu si on clique ailleurs
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.user-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [user?.id, showMenu]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowMenu(false);
    navigate('/');
    // Forcer le rechargement pour mettre à jour toutes les pages
    window.location.reload();
  };

  const roleLabels = {
    proprietaire: 'Propriétaire',
    courtier: 'Courtier',
    locataire: 'Locataire',
    admin: 'Admin'
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>SenChambres</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/comparison" className="nav-link">
            Comparaison
            {comparisonCount > 0 && (
              <span className="nav-badge">{comparisonCount}</span>
            )}
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {(user.role === 'proprietaire' || user.role === 'courtier') && (
                <>
                  <Link to="/publish" className="nav-link">Publier</Link>
                  <Link to="/my-listings" className="nav-link">Mes annonces</Link>
                </>
              )}
            </>
          )}
          {user ? (
            <>
              <Notifications />
              <div className="user-menu">
              <button 
                className="user-menu-toggle"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu utilisateur"
              >
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="user-avatar-small" />
                ) : (
                  <div className="user-avatar-small user-avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="user-name">{user.name}</span>
                <span className="user-menu-arrow">{showMenu ? '▲' : '▼'}</span>
              </button>
              {showMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-info">
                    <div className="user-menu-photo">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} />
                      ) : (
                        <div className="user-photo-placeholder">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="user-menu-details">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="user-role-badge">{roleLabels[user.role] || user.role}</span>
                    </div>
                  </div>
                  <div className="user-menu-items">
                    <Link 
                      to="/settings"
                      className="user-menu-item"
                      onClick={() => setShowMenu(false)}
                    >
                      ⚙️ Paramètres
                    </Link>
                    <Link 
                      to="/dashboard"
                      className="user-menu-item"
                      onClick={() => setShowMenu(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <button 
                      className="user-menu-item btn-logout"
                      onClick={handleLogout}
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-small">
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

