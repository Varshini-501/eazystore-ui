import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBasket,
  faTags,
  faSun,
  faMoon,
  faAngleDown,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectTotalQuantity } from "../store/cart-slice";
import {
  selectIsAuthenticated,
  selectUser,
  logout,
} from "../store/auth-slice";
import { toast } from "react-toastify";

export default function Header() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const userMenuRef = useRef();
  const navigate = useNavigate();

  const toggleAdminMenu = () => setAdminMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  const totalQuantity = useSelector(selectTotalQuantity);
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isVendor = user?.roles?.includes("ROLE_VENDOR");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setAdminMenuOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, location.pathname]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/home");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setAdminMenuOpen(false);
  };

  const navLinkClass =
    "text-center text-lg font-primary font-semibold text-primary py-2 dark:text-light hover:text-dark dark:hover:text-lighter";

  const dropdownLinkClass =
    "block w-full text-left px-4 py-2 text-lg font-primary font-semibold text-primary dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600";

  return (
    <header className="border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20 bg-normalbg dark:bg-darkbg">
      <div className="flex items-center justify-between mx-auto max-w-[1152px] px-4 sm:px-6 py-3 sm:py-4">

        {/* LOGO */}
        <Link
          to="/"
          className={`${navLinkClass} flex items-center gap-2`}
          onClick={closeMobileMenu}
        >
          <FontAwesomeIcon icon={faTags} className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="font-bold whitespace-nowrap">
            VKart
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center py-2 z-10">
          {/* Theme */}
          <button
            className="flex items-center justify-center mx-3 w-8 h-8 rounded-full border border-primary dark:border-light transition duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <FontAwesomeIcon
              icon={theme === "dark" ? faMoon : faSun}
              className="w-4 h-4 dark:text-light text-primary"
            />
          </button>

          <ul className="flex space-x-6 items-center">
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/feed"
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Feed
              </NavLink>
            </li>

            <li>
              <NavLink
                to={isVendor ? "/vendor/dashboard" : "/vendor/register"}
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                {isVendor ? "My Store" : "Sell on EazyStore"}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Contact
              </NavLink>
            </li>

            {/* USER */}
            <li>
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="relative text-primary flex items-center"
                  >
                    <span className={navLinkClass}>
                      {`Hello ${
                        user.name.length > 5
                          ? `${user.name.slice(0, 5)}...`
                          : user.name
                      }`}
                    </span>

                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="text-primary dark:text-light w-5 h-5 ml-1"
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-normalbg dark:bg-darkbg border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20">
                      <ul className="py-2">
                        <li>
                          <Link
                            to="/profile"
                            className={dropdownLinkClass}
                          >
                            Profile
                          </Link>
                        </li>

                        <li>
                          <Link
                            to="/orders"
                            className={dropdownLinkClass}
                          >
                            Orders
                          </Link>
                        </li>

                        {isAdmin && (
                          <li>
                            <button
                              onClick={toggleAdminMenu}
                              className={`${dropdownLinkClass} flex items-center justify-between`}
                            >
                              Admin
                              <FontAwesomeIcon icon={faAngleDown} />
                            </button>

                            {isAdminMenuOpen && (
                              <ul className="ml-4 mt-2 space-y-2">
                                <li>
                                  <Link
                                    to="/admin/orders"
                                    className={dropdownLinkClass}
                                  >
                                    Orders
                                  </Link>
                                </li>

                                <li>
                                  <Link
                                    to="/admin/messages"
                                    className={dropdownLinkClass}
                                  >
                                    Messages
                                  </Link>
                                </li>

                                <li>
                                  <Link
                                    to="/admin/price-offers"
                                    className={dropdownLinkClass}
                                  >
                                    Price Offers
                                  </Link>
                                </li>
                              </ul>
                            )}
                          </li>
                        )}

                        <li>
                          <Link
                            to="/home"
                            onClick={handleLogout}
                            className={dropdownLinkClass}
                          >
                            Logout
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? `underline ${navLinkClass}` : navLinkClass
                  }
                >
                  Login
                </NavLink>
              )}
            </li>

            {/* CART */}
            <li>
              <Link to="/cart" className="relative text-primary py-2">
                <FontAwesomeIcon
                  icon={faShoppingBasket}
                  className="text-primary dark:text-light w-6"
                />

                <div className="absolute -top-2 -right-6 text-xs bg-yellow-400 text-black font-semibold rounded-full px-2 py-1 leading-none">
                  {totalQuantity}
                </div>
              </Link>
            </li>
          </ul>
        </nav>

        {/* MOBILE CONTROLS */}
        <div className="flex lg:hidden items-center gap-3">

          {/* Theme */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full border border-primary dark:border-light transition duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <FontAwesomeIcon
              icon={theme === "dark" ? faMoon : faSun}
              className="w-4 h-4 dark:text-light text-primary"
            />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative text-primary">
            <FontAwesomeIcon
              icon={faShoppingBasket}
              className="text-primary dark:text-light w-6"
            />

            <div className="absolute -top-2 -right-3 text-xs bg-yellow-400 text-black font-semibold rounded-full px-1.5 py-1 leading-none">
              {totalQuantity}
            </div>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 text-primary dark:text-light"
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faXmark : faBars}
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-300 dark:border-gray-600 bg-normalbg dark:bg-darkbg shadow-md">
          <nav className="max-w-[1152px] mx-auto px-6 py-4">
            <ul className="flex flex-col space-y-1">

              <li>
                <NavLink
                  to="/home"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block ${navLinkClass} text-left px-3 py-3 ${
                      isActive ? "underline" : ""
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block ${navLinkClass} text-left px-3 py-3 ${
                      isActive ? "underline" : ""
                    }`
                  }
                >
                  About
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/feed"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block ${navLinkClass} text-left px-3 py-3 ${
                      isActive ? "underline" : ""
                    }`
                  }
                >
                  Feed
                </NavLink>
              </li>

              <li>
                <NavLink
                  to={isVendor ? "/vendor/dashboard" : "/vendor/register"}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block ${navLinkClass} text-left px-3 py-3 ${
                      isActive ? "underline" : ""
                    }`
                  }
                >
                  {isVendor ? "My Store" : "Sell on EazyStore"}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/contact"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block ${navLinkClass} text-left px-3 py-3 ${
                      isActive ? "underline" : ""
                    }`
                  }
                >
                  Contact
                </NavLink>
              </li>

              {/* MOBILE USER */}
              <li className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                {isAuthenticated ? (
                  <div ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      className={`${navLinkClass} flex items-center justify-between w-full px-3 py-3`}
                    >
                      <span>
                        {`Hello ${
                          user.name.length > 5
                            ? `${user.name.slice(0, 5)}...`
                            : user.name
                        }`}
                      </span>

                      <FontAwesomeIcon
                        icon={faAngleDown}
                        className="text-primary dark:text-light w-5 h-5"
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div className="ml-3 mb-2 border-l-2 border-gray-300 dark:border-gray-600">
                        <Link
                          to="/profile"
                          onClick={closeMobileMenu}
                          className={dropdownLinkClass}
                        >
                          Profile
                        </Link>

                        <Link
                          to="/orders"
                          onClick={closeMobileMenu}
                          className={dropdownLinkClass}
                        >
                          Orders
                        </Link>

                        {isAdmin && (
                          <>
                            <button
                              onClick={toggleAdminMenu}
                              className={`${dropdownLinkClass} flex items-center justify-between`}
                            >
                              Admin
                              <FontAwesomeIcon icon={faAngleDown} />
                            </button>

                            {isAdminMenuOpen && (
                              <div className="ml-4">
                                <Link
                                  to="/admin/orders"
                                  onClick={closeMobileMenu}
                                  className={dropdownLinkClass}
                                >
                                  Orders
                                </Link>

                                <Link
                                  to="/admin/messages"
                                  onClick={closeMobileMenu}
                                  className={dropdownLinkClass}
                                >
                                  Messages
                                </Link>

                                <Link
                                  to="/admin/price-offers"
                                  onClick={closeMobileMenu}
                                  className={dropdownLinkClass}
                                >
                                  Price Offers
                                </Link>
                              </div>
                            )}
                          </>
                        )}

                        <Link
                          to="/home"
                          onClick={handleLogout}
                          className={dropdownLinkClass}
                        >
                          Logout
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `block ${navLinkClass} text-left px-3 py-3 ${
                        isActive ? "underline" : ""
                      }`
                    }
                  >
                    Login
                  </NavLink>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
