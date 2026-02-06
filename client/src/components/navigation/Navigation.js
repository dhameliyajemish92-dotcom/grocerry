import styles from './navigation.module.css';
import Logo from '../../shared/assets/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { SEARCH_HIDDEN, SEARCH_VISIBLE } from "./constants/search";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../actions/auth";

const Navigation = ({ cartCount }) => {

  const [search, setSearch] = useState(SEARCH_HIDDEN);
  const [menuActive, setMenuActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [dropdown, setDropdown] = useState(false);

  const searchElement = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(state => state.authentication.user);
  const auth = !!user;
  const admin = auth && user.role === "ADMIN";

  useEffect(() => {
    setDropdown(false);
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = () => {
    if (window.innerWidth < 980 && search === SEARCH_HIDDEN) {
      setSearch(SEARCH_VISIBLE);
      searchElement.current.focus();
    } else {
      navigate(`/products?search=${searchInput}`);
      setSearch(SEARCH_HIDDEN);
      setSearchInput("");
    }
  };

  return (
    <div className={styles.wrapper}>

      <Link to="/" className={styles.logo}>
        <img src={Logo} alt="Rabbit" />
      </Link>

      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>

        {!auth && <Link to="/login">Login / Signup</Link>}

        {auth && <Link to="/wishlist">Wishlist</Link>}
        {auth && <Link to="/orders">Orders</Link>}
        {admin && <Link to="/admin">Admin</Link>}
      </nav>

      <div className={styles.actions}>

        <input
          ref={searchElement}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search"
          className={styles.search}
        />

        <button onClick={handleSearch} className={styles.searchBtn}>
          🔍
        </button>

        <Link to="/cart" className={styles.cart}>
          🛒 {cartCount || 0}
        </Link>

        {/* 👇 LOGIN ICON OR USER NAME */}

        {!auth ? (
          <Link to="/login" className={styles.loginIcon}>👤</Link>
        ) : (
          <div className={styles.userBox} onClick={() => setDropdown(!dropdown)}>
            Hi, {user.first_name}

            {dropdown && (
              <div className={styles.dropdown}>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/orders">Orders</Link>
                {admin && <Link to="/admin">Admin</Link>}
                <div onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Navigation;
