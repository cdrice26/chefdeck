const dynamic = (loader: () => Promise<any>, options?: any) => {
  try {
    return require('next/dynamic')(loader, options);
  } catch (error) {
    return loader;
  }
};

export default dynamic;
