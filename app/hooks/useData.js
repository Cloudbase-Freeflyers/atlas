import {useQuery} from "@tanstack/react-query"
import {useFilters} from "@/lib/FiltersContext.js";


export const useRequest = (payload,parser,key="data")=>{

    return useQuery({
        queryKey: [key, JSON.stringify(payload)],
        queryFn: () => {
            const base = typeof window !== "undefined" ? window.location.origin : "";
            const params = new URLSearchParams();
            params.append("data", JSON.stringify(payload))
            return fetch(`${base}/api/graph?${params}`)
                .then((r) => r.json())
                .then(res => {
                    if (parser) {
                        return parser(res)
                    }
                    return res
                })
        }
    })
}

export const useData = (payload,parser,key="data",timeDimension=null,granularity=true)=>{

    const {companyId,dateTimePeriod}=useFilters()

    return useQuery({
        queryKey: [key,companyId, JSON.stringify(payload)],
        queryFn: () => {
            const base = typeof window !== "undefined" ? window.location.origin : "";
            const params = new URLSearchParams();
            const filters = {
                "filters": [
                    {
                        "member": "Companies.id",
                        "operator": "equals",
                        "values": [
                            companyId
                        ]
                    }
                ],
            }
            if (timeDimension) {
                const timeDimensionsFilter={
                    "dimension": timeDimension,
                    "dateRange": [
                        dateTimePeriod.startDate.toDateString(),
                        dateTimePeriod.endDate.toDateString()
                    ]
                }
                if (granularity) {
                    timeDimensionsFilter.granularity = 'day'
                }
                filters["timeDimensions"]= [
                    timeDimensionsFilter
                ]
            }
            params.append("data", JSON.stringify({...payload,...filters}))
            return fetch(`${base}/api/graph?${params}`)
                .then((r) => r.json())
                .then(res => {
                    if (parser) {
                        return parser(res)
                    }
                    return res
                })
        }
    })
}