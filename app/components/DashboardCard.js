"use client";

import Link from "next/link";
import {formatValue} from "../lib/formatters.js";



export default function DashboardCard({ href, title, description, stats, tag,isLoading }) {
    return (
    <Link href={href} className="card-link fade-in">
      <div className="badge">{tag}</div>
      <h3>{title}</h3>
      <span>{description}</span>
      <div className="meta">
        {stats.map((item) => (
          <span key={item.label} className={item.value === "—" ? "reports-placeholder" : undefined}>
            {formatValue(item.value,item.formatter)} {item.label}
          </span>
        ))}
      </div>
    </Link>
  );
}
