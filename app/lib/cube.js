import cube from "@cubejs-client/core";


const cubeApi = cube(
    "",
    {
        apiUrl:
            "http://localhost:4000/cubejs-api/v1",
    }
);

export default cubeApi;