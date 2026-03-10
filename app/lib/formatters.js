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
