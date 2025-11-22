type RequestFn = (
  url: string,
  method: string,
  body?: FormData | object
) => Promise<Response>;

export default RequestFn;
