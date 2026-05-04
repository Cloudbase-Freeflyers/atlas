import * as React from "react";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
})

const decimalFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})


const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
})
const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
})

/** Shorter currency ticks for chart Y-axes (avoids clipping long labels). */
const axisCurrencyCompact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
})

/**
 * @param {number} value
 * @param {string} [formatter] currency | percent | compact | decimal | default
 */
export function formatAxisTick(value, formatter) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return ""
    const n = Number(value)
    switch (formatter) {
        case "currency":
            return axisCurrencyCompact.format(n)
        case "percent":
            return percentFormatter.format(n / 100)
        case "compact":
            return compactFormatter.format(n)
        case "decimal":
            return decimalFormatter.format(n)
        default:
            return compactFormatter.format(n)
    }
}

export const formatValue = (value, formatter) => {
    if (value === null || value === undefined) return ""

    if (typeof formatter === "function") {
        return formatter(value)
    }

    switch (formatter) {
        case "currency":
            return currencyFormatter.format(value)
        case "decimal":
            return decimalFormatter.format(value)
        case "percent":
            return percentFormatter.format(value / 100) // Assuming value is 0-100
        case "compact":
            return compactFormatter.format(value)
        default:
            return value
    }
}
