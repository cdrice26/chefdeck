type RequestFn = (
  url: string,
  method: string,
  body?: BodyInit
) => Promise<Response>;

export default RequestFn;
