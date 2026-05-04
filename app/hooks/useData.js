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
        queryKey: [
            key,
            companyId,
            dateTimePeriod,
            JSON.stringify(options.timeDimensionDateRange ?? null),
            JSON.stringify(payload),
        ],
        queryFn: async () => {
            const extraFilters = Array.isArray(payload.filters) ? payload.filters : [];
            const { filters: _payloadFilters, ...payloadRest } = payload;
            const filters = {
                "filters": [
                    {
                        "member": "Companies.id",
                        "operator": "equals",
                        "values": [
                            companyId
                        ]
                    },
                    ...extraFilters,
                ],
            }
            if (timeDimension) {
                const dr = options.timeDimensionDateRange;
                const rangeStart =
                    dr?.[0] ?? dateTimePeriod.startDate.toDateString();
                const rangeEnd =
                    dr?.[1] ?? dateTimePeriod.endDate.toDateString();
                const timeDimensionsFilter={
                    "dimension": timeDimension,
                    "dateRange": [rangeStart, rangeEnd]
                }
                const g =
                    options.timeGranularity !== undefined
                        ? options.timeGranularity
                        : granularity
                          ? "day"
                          : undefined;
                if (g) {
                    timeDimensionsFilter.granularity = g;
                }
                filters["timeDimensions"]= [
                    timeDimensionsFilter
                ]
            }
            
            const fullPayload = {...payloadRest,...filters};
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
        enabled:
          (options.enabled !== undefined ? options.enabled : true) && !!companyId,
    })
}