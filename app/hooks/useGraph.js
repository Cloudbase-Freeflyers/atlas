import {useCallback, useEffect, useState} from "react";


export const useGraph=(configs,parse)=>{
    const [data,setData]=useState([])

    const getData=useCallback(()=>{
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const params = new URLSearchParams();
        params.append("data", JSON.stringify(configs))
        fetch(`${base}/api/graph?${params}`)
            .then((r) => r.json())
            .then(res=>{
                if(parse){
                    setData(parse(res))
                }else {setData(res)}

            })
            // .finally(() => setLoading(false));
    })
    useEffect(()=>{
        getData()
    },[])
    return {data}
}