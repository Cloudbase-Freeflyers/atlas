import {useQuery} from "@tanstack/react-query"
import {useFilters} from "@/lib/FiltersContext.js";
import { fetchCubeAction } from "@/lib/cubeActions";

export const useRequest = (payload,parser,key="data", options = {})=>{

    return useQuery({
        queryKey: [key, JSON.stringify(payload)],
        queryFn: async () => {
            const result = await fetchCubeAction(payload);
            if (!result.success) throw new Error(result.message);
            const res = result.data;
            if (parser) {
                return parser(res)
            }
            return res
        },
        ...options
    })
}

export const useData = (payload,parser,key="data",timeDimension=null,granularity=true, options = {})=>{

    const {companyId,dateTimePeriod}=useFilters()

    return useQuery({
        queryKey: [key, companyId, dateTimePeriod, JSON.stringify(payload)],
        queryFn: async () => {
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
            
            const fullPayload = {...payload,...filters};
            const result = await fetchCubeAction(fullPayload);
            if (!result.success) throw new Error(result.message);
            const res = result.data;
            
            if (parser) {
                return parser(res)
            }
            return res
        },
        initialData: options.initialData,
        staleTime: options.initialData ? 1000 * 60 * 5 : 0, // 5 minutes if initialData provided
    })
}