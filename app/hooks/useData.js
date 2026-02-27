import {useQuery} from "@tanstack/react-query"


export const useData = (payload,parser,key="data")=>{
    return useQuery({
        queryKey: [key, payload],
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