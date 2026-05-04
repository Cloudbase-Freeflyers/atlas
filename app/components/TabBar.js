import Link from "next/link";

export default function TabBar({ tabs, active }) {
  return (
    <div className="tabbar-wrap">
      <nav className="tabbar" aria-label="Report sections">
        {tabs.map((tab) => {
          const label = typeof tab === "string" ? tab : tab.label;
          const href = typeof tab === "string" ? null : tab.href;
          const isActive = label === active;

          if (href) {
            return (
              <Link key={label} href={href} className={isActive ? "active" : ""}>
                {label}
              </Link>
            );
          }

          return (
            <button key={label} type="button" className={isActive ? "active" : ""}>
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
