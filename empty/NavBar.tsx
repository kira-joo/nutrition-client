import Link from "next/link";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.appName}>MyApp</div>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link className={styles.navLink} href="/forms">
            <button className={styles.navButton}>send message</button>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={styles.navLink} href="/forms/about">
            <button className={styles.navButton}>All Messages</button>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
