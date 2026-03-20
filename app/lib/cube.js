import cube from "@cubejs-client/core";

const createCubeApi = (token) => {
  return cube(token, {
    apiUrl: `${process.env.CUBE_API_URL}/cubejs-api/v1`,
      headers:{
        "Authorization": `Bearer ${token}`
      }
  });
};

export default createCubeApi;